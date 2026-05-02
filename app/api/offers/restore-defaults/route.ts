import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OfferModel } from "@/lib/models";
import { restoreFallbackOffers, serializeOffer } from "@/lib/server-utils";

export const runtime = "nodejs";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to restore offers." },
      { status: 503 }
    );
  }

  await connectToDatabase();
  const restoredCount = await restoreFallbackOffers();
  const offers = await OfferModel.find({}).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    restoredCount,
    offers: offers.map((offer) => serializeOffer(offer as Record<string, unknown>))
  });
}
