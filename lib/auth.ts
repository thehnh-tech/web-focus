import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "focus_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const REMEMBER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

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

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (username && password) {
    return { username, password };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      username: username || "FOCUSADMIN2026",
      password: password || "TaharBNA2026+"
    };
  }

  return null;
}

export function createAdminToken(maxAge = SESSION_TTL_SECONDS) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1000) + maxAge
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    return parsed.sub === "admin" && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function setAdminCookie(token: string, maxAge = SESSION_TTL_SECONDS) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export { COOKIE_NAME, REMEMBER_SESSION_TTL_SECONDS, SESSION_TTL_SECONDS };
