import { PromoCodeModel } from "@/lib/models";
import { formatPrice } from "@/lib/products";

export const PROMO_CODE_PATTERN = /^[A-Z0-9_-]{2,24}$/;

export type PromoCodeType = "percent" | "fixed";

// Forme minimale d'un code promo lu en base (lean) : les champs optionnels
// couvrent d'éventuels documents créés avant l'ajout des défauts du schéma.
export type PromoCodeLean = {
  code: string;
  type: PromoCodeType;
  value: number;
  minSubtotal?: number | null;
  maxUses?: number | null;
  usedCount?: number | null;
  expiresAt?: Date | string | null;
  active?: boolean;
};

export type SerializedPromoCode = {
  id: string;
  code: string;
  type: PromoCodeType;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt?: string;
};

export function normalizePromoCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export function roundMoney(value: number) {
  return Math.round(value * 10) / 10;
}

export function computePromoDiscount(
  promo: Pick<PromoCodeLean, "type" | "value">,
  subtotal: number
) {
  const raw = promo.type === "percent" ? (subtotal * promo.value) / 100 : promo.value;
  return roundMoney(Math.min(Math.max(raw, 0), subtotal));
}

type PromoCheck = { ok: true; discount: number } | { ok: false; error: string };

export function checkPromoUsable(promo: PromoCodeLean, subtotal: number): PromoCheck {
  if (promo.active === false) {
    return { ok: false, error: "Ce code promo n’est plus actif." };
  }

  if (promo.expiresAt) {
    const expiresAt = new Date(promo.expiresAt);

    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now()) {
      return { ok: false, error: "Ce code promo a expiré." };
    }
  }

  const maxUses = promo.maxUses ?? null;

  if (maxUses !== null && (promo.usedCount ?? 0) >= maxUses) {
    return { ok: false, error: "Ce code promo a atteint sa limite d’utilisation." };
  }

  const minSubtotal = promo.minSubtotal ?? 0;

  if (subtotal < minSubtotal) {
    return {
      ok: false,
      error: `Ce code promo nécessite un minimum d’achat de ${formatPrice(minSubtotal)}.`
    };
  }

  return { ok: true, discount: computePromoDiscount(promo, subtotal) };
}

export async function findPromoCode(code: string) {
  const promo = await PromoCodeModel.findOne({ code }).lean();
  return promo as (PromoCodeLean & Record<string, unknown>) | null;
}

// Réserve une utilisation du code de façon atomique : le filtre re-vérifie
// validité, minimum et limite au moment de l'incrément, ce qui évite qu'un
// code limité soit dépassé par deux commandes simultanées.
export async function claimPromoCode(code: string, subtotal: number) {
  // Mêmes tolérances que checkPromoUsable pour les documents sans les champs
  // par défaut ($ne/null matchent aussi les champs absents), sinon un code
  // accepté à la validation serait refusé à la réservation.
  const claimed = await PromoCodeModel.findOneAndUpdate(
    {
      code,
      active: { $ne: false },
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
        { $or: [{ minSubtotal: null }, { minSubtotal: { $lte: subtotal } }] }
      ],
      $expr: {
        $or: [{ $eq: ["$maxUses", null] }, { $lt: ["$usedCount", "$maxUses"] }]
      }
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  ).lean();

  return claimed as (PromoCodeLean & Record<string, unknown>) | null;
}

// Rend une utilisation : création de commande échouée, commande annulée ou
// supprimée avant livraison.
export async function releasePromoCode(code: string) {
  await PromoCodeModel.updateOne(
    { code, usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  );
}

// Reprend une utilisation quand une commande annulée est réactivée.
export async function restorePromoCodeUse(code: string) {
  await PromoCodeModel.updateOne({ code }, { $inc: { usedCount: 1 } });
}

export function serializePromoCode(promo: Record<string, unknown>): SerializedPromoCode {
  const expiresAt = promo.expiresAt ? new Date(promo.expiresAt as string | Date) : null;
  const maxUses =
    promo.maxUses === undefined || promo.maxUses === null ? null : Number(promo.maxUses);

  return {
    id: String(promo._id ?? promo.id),
    code: String(promo.code),
    type: promo.type === "fixed" ? "fixed" : "percent",
    value: Number(promo.value),
    minSubtotal: Number(promo.minSubtotal ?? 0),
    maxUses,
    usedCount: Number(promo.usedCount ?? 0),
    expiresAt:
      expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt.toISOString() : null,
    active: promo.active !== false,
    createdAt:
      promo.createdAt instanceof Date ? promo.createdAt.toISOString() : undefined
  };
}

export function validatePromoCodePayload(body: Record<string, unknown>) {
  const code = normalizePromoCode(body.code);

  if (!PROMO_CODE_PATTERN.test(code)) {
    return {
      error:
        "Le code doit contenir entre 2 et 24 caractères : lettres, chiffres, tirets ou underscores."
    };
  }

  const type: PromoCodeType = body.type === "fixed" ? "fixed" : "percent";
  const value = Number(body.value);

  if (!Number.isFinite(value) || value <= 0) {
    return { error: "La valeur de la remise doit être un nombre positif." };
  }

  if (type === "percent" && value > 100) {
    return { error: "Le pourcentage de remise ne peut pas dépasser 100." };
  }

  const minSubtotalRaw = body.minSubtotal;
  const minSubtotal =
    minSubtotalRaw === undefined || minSubtotalRaw === null || minSubtotalRaw === ""
      ? 0
      : Number(minSubtotalRaw);

  if (!Number.isFinite(minSubtotal) || minSubtotal < 0) {
    return { error: "Le minimum d’achat doit être un nombre positif ou zéro." };
  }

  const maxUsesRaw = body.maxUses;
  const maxUses =
    maxUsesRaw === undefined || maxUsesRaw === null || maxUsesRaw === ""
      ? null
      : Number(maxUsesRaw);

  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return { error: "La limite d’utilisations doit être un entier supérieur ou égal à 1." };
  }

  const expiresAtRaw = String(body.expiresAt ?? "").trim();
  let expiresAt: Date | null = null;

  if (expiresAtRaw) {
    // Une date seule (input type=date) reste valable toute la journée indiquée.
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(expiresAtRaw)
      ? new Date(`${expiresAtRaw}T23:59:59.999Z`)
      : new Date(expiresAtRaw);

    if (Number.isNaN(parsed.getTime())) {
      return { error: "La date d’expiration est invalide." };
    }

    expiresAt = parsed;
  }

  return {
    data: {
      code,
      type,
      value,
      minSubtotal,
      maxUses,
      expiresAt,
      active: body.active !== false
    }
  };
}
