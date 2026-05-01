import { NextResponse } from "next/server";
import { createAdminToken, getAdminCredentials, setAdminCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const username = String(body.username ?? "");
  const password = String(body.password ?? "");
  const credentials = getAdminCredentials();

  if (username !== credentials.username || password !== credentials.password) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  await setAdminCookie(createAdminToken());
  return NextResponse.json({ ok: true });
}
