import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "focus_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const REMEMBER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "focus-dev-session-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "FOCUSADMIN2026",
    password: process.env.ADMIN_PASSWORD || "TaharBNA2026+"
  };
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

  const expected = sign(payload);
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
