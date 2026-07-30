import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "focus_admin_session";

const WEAK_SECRETS = new Set([
  "focus-dev-session-secret",
  "replace-with-a-long-random-secret",
  "use-a-long-random-secret"
]);

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret && secret.length >= 32 && !WEAK_SECRETS.has(secret)) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return secret || "focus-dev-session-secret";
  }

  throw new Error(
    "ADMIN_SESSION_SECRET is missing or insecure. Set it to a random value of 32+ characters."
  );
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

async function verifyAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(getSecret()),
      { hash: "SHA-256", name: "HMAC" },
      false,
      ["sign"]
    );
    const expectedBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );

    if (toBase64Url(expectedBuffer) !== signature) {
      return false;
    }

    const parsed = JSON.parse(fromBase64Url(payload)) as { sub?: string; exp?: number };
    return parsed.sub === "admin" && Number(parsed.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifyAdminToken(request.cookies.get(COOKIE_NAME)?.value);

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
