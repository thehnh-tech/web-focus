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
  await connectToDatabase();
  await ensureCategoriesSeeded();
  const validated = await validateOfferPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { id } = await context.params;
  const selector = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
  const duplicate = await OfferModel.findOne({ slug: validated.data.slug }).lean();

  if (duplicate && String(duplicate._id) !== id && duplicate.slug !== id) {
    return NextResponse.json(
      { error: "Un autre produit utilise déjà ce slug." },
      { status: 409 }
    );
  }

  try {
    const updated = await OfferModel.findOneAndUpdate(selector, validated.data, {
      new: true
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }

    return NextResponse.json({
      offer: serializeOffer(updated as Record<string, unknown>)
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "Un autre produit utilise déjà ce slug." },
        { status: 409 }
      );
    }

    throw error;
  }
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
  const selector = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
  const deleted = await OfferModel.findOneAndDelete(selector).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
