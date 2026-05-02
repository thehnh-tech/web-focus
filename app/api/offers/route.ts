import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OfferModel } from "@/lib/models";
import { fallbackProducts } from "@/lib/products";
import { seedFallbackOffersIfEmpty, serializeOffer, validateOfferPayload } from "@/lib/server-utils";

export const runtime = "nodejs";

export async function GET() {
  if (!hasMongoUri()) {
    return NextResponse.json({ offers: fallbackProducts, source: "fallback" });
  }

  await connectToDatabase();
  const offers = await OfferModel.find({}).sort({ createdAt: -1 }).lean();

  if (offers.length === 0) {
    return NextResponse.json({ offers: fallbackProducts, source: "fallback" });
  }

  return NextResponse.json({
    offers: offers.map((offer) => serializeOffer(offer as Record<string, unknown>)),
    source: "mongodb"
  });
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
  const validated = validateOfferPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  await connectToDatabase();
  await seedFallbackOffersIfEmpty();
  const created = await OfferModel.create(validated.data);

  return NextResponse.json(
    { offer: serializeOffer(created.toObject() as Record<string, unknown>) },
    { status: 201 }
  );
}
