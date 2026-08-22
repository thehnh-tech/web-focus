import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { PromoCodeModel } from "@/lib/models";
import { serializePromoCode, validatePromoCodePayload } from "@/lib/promo";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

const objectIdPattern = /^[a-f\d]{24}$/i;

export async function PUT(request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage promo codes." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const validated = validatePromoCodePayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const updated = await PromoCodeModel.findByIdAndUpdate(id, validated.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      promoCode: serializePromoCode(updated as Record<string, unknown>)
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "Un autre code promo utilise déjà ce nom." },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage promo codes." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await PromoCodeModel.findByIdAndUpdate(
    id,
    { active: body.active },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    promoCode: serializePromoCode(updated as Record<string, unknown>)
  });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage promo codes." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
  }

  await connectToDatabase();
  const deleted = await PromoCodeModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Code promo introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
