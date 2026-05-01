import { NextResponse } from "next/server";
import {
  REMEMBER_SESSION_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  createAdminToken,
  getAdminCredentials,
  setAdminCookie
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  const remember = Boolean(body.remember);
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return NextResponse.json({ error: "Identifiants admin invalides." }, { status: 401 });
  }

  const maxAge = remember ? REMEMBER_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
  await setAdminCookie(createAdminToken(maxAge), maxAge);
  return NextResponse.json({ ok: true });
}
