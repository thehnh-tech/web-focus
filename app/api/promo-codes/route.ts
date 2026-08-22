import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { PromoCodeModel } from "@/lib/models";
import { serializePromoCode, validatePromoCodePayload } from "@/lib/promo";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json({ promoCodes: [], source: "missing-mongodb" });
  }

  try {
    await connectToDatabase();
    const promoCodes = await PromoCodeModel.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      promoCodes: promoCodes.map((promo) =>
        serializePromoCode(promo as Record<string, unknown>)
      ),
      source: "mongodb"
    });
  } catch (error) {
    console.error("GET /api/promo-codes failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les codes promo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage promo codes." },
      { status: 503 }
    );
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
    const created = await PromoCodeModel.create(validated.data);

    return NextResponse.json(
      { promoCode: serializePromoCode(created.toObject() as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "Un code promo avec ce nom existe déjà." },
        { status: 409 }
      );
    }

    throw error;
  }
}
