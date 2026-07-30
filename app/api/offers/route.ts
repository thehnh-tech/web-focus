import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OfferModel } from "@/lib/models";
import {
  ensureCategoriesSeeded,
  serializeOffer,
  validateOfferPayload
} from "@/lib/server-utils";

export const runtime = "nodejs";

export async function GET() {
  if (!hasMongoUri()) {
    return NextResponse.json({ offers: [], source: "missing-mongodb" });
  }

  try {
    await connectToDatabase();
    const offers = await OfferModel.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      offers: offers.map((offer) => serializeOffer(offer as Record<string, unknown>)),
      source: "mongodb"
    });
  } catch (error) {
    console.error("GET /api/offers failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les produits." },
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
      { error: "MONGODB_URI must be configured to manage offers." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  await connectToDatabase();
  await ensureCategoriesSeeded();
  const validated = await validateOfferPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const existing = await OfferModel.exists({ slug: validated.data.slug });

  if (existing) {
    return NextResponse.json(
      { error: "Un produit avec ce slug existe déjà." },
      { status: 409 }
    );
  }

  try {
    const created = await OfferModel.create(validated.data);

    return NextResponse.json(
      { offer: serializeOffer(created.toObject() as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "Un produit avec ce slug existe déjà." },
        { status: 409 }
      );
    }

    throw error;
  }
}
