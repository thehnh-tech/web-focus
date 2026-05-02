import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OfferModel } from "@/lib/models";
import { seedFallbackOffersIfEmpty, serializeOffer, validateOfferPayload } from "@/lib/server-utils";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
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

  const { id } = await context.params;
  await connectToDatabase();
  await seedFallbackOffersIfEmpty();
  const selector = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
  const updated = await OfferModel.findOneAndUpdate(selector, validated.data, {
    new: true
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  return NextResponse.json({
    offer: serializeOffer(updated as Record<string, unknown>)
  });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage offers." },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  await connectToDatabase();
  await seedFallbackOffersIfEmpty();
  const selector = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
  const deleted = await OfferModel.findOneAndDelete(selector).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
