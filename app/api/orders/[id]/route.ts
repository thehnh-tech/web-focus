import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models";
import { releasePromoCode, restorePromoCodeUse } from "@/lib/promo";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

const statuses = ["new", "confirmed", "delivered", "cancelled"];

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to update orders." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const status = String(body.status ?? "");

  if (!statuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  // Sans { new: true } : findByIdAndUpdate renvoie le document AVANT mise à
  // jour, ce qui donne l'ancien statut en une seule opération atomique.
  const previous = await OrderModel.findByIdAndUpdate(id, { status }).lean();

  if (!previous) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // Annuler une commande rend son utilisation du code promo ; la réactiver
  // la reprend. Ainsi un code à usage limité n'est pas épuisé par des
  // commandes annulées.
  if (previous.promoCode && previous.status !== status) {
    try {
      if (status === "cancelled" && previous.status !== "cancelled") {
        await releasePromoCode(String(previous.promoCode));
      } else if (previous.status === "cancelled") {
        await restorePromoCodeUse(String(previous.promoCode));
      }
    } catch (error) {
      console.error("Failed to adjust promo code usage", error);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to delete orders." },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  await connectToDatabase();
  const deleted = await OrderModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  // Une commande annulée a déjà rendu son utilisation lors de l'annulation.
  if (deleted.promoCode && deleted.status !== "cancelled") {
    await releasePromoCode(String(deleted.promoCode)).catch((error) =>
      console.error("Failed to release promo code usage", error)
    );
  }

  return NextResponse.json({ ok: true });
}
