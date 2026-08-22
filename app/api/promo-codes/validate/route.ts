import { NextResponse } from "next/server";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import {
  PROMO_CODE_PATTERN,
  checkPromoUsable,
  findPromoCode,
  normalizePromoCode,
  roundMoney
} from "@/lib/promo";

export const runtime = "nodejs";

// Limitation en mémoire, par instance : best effort contre l'énumération de
// codes par force brute (le process peut redémarrer, mais casse les rafales).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 20;
const attemptsByIp = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);

  if (!entry || entry.resetAt <= now) {
    if (attemptsByIp.size > 1000) {
      for (const [key, value] of attemptsByIp) {
        if (value.resetAt <= now) {
          attemptsByIp.delete(key);
        }
      }
    }

    attemptsByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_ATTEMPTS;
}

// Endpoint public : le checkout vérifie un code avant de passer commande.
// Le sous-total envoyé ne sert qu'à l'aperçu — la commande recalcule tout.
export async function POST(request: Request) {
  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "Les codes promo sont indisponibles pour le moment." },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const code = normalizePromoCode(body?.code);
  const subtotalRaw = Number(body?.subtotal);
  const subtotal =
    Number.isFinite(subtotalRaw) && subtotalRaw > 0 ? roundMoney(subtotalRaw) : 0;

  if (!PROMO_CODE_PATTERN.test(code)) {
    return NextResponse.json({ error: "Code promo invalide." }, { status: 400 });
  }

  await connectToDatabase();
  const promo = await findPromoCode(code);

  if (!promo) {
    return NextResponse.json({ error: "Ce code promo n’existe pas." }, { status: 400 });
  }

  const check = checkPromoUsable(promo, subtotal);

  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  return NextResponse.json({
    promo: {
      code,
      type: promo.type,
      value: Number(promo.value),
      minSubtotal: Number(promo.minSubtotal ?? 0)
    },
    discount: check.discount
  });
}
