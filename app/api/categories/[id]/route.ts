import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { CategoryModel, OfferModel } from "@/lib/models";
import { serializeCategory, validateCategoryPayload } from "@/lib/server-utils";

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
      { error: "MONGODB_URI must be configured to manage categories." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const validated = validateCategoryPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { id } = await context.params;

  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  await connectToDatabase();
  const category = await CategoryModel.findById(id);

  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  const duplicate = await CategoryModel.exists({
    _id: { $ne: category._id },
    $or: [{ slug: validated.data.slug }, { name: validated.data.name }]
  });

  if (duplicate) {
    return NextResponse.json(
      { error: "Une autre catégorie utilise déjà ce nom." },
      { status: 409 }
    );
  }

  const previousName = category.name;
  category.name = validated.data.name;
  category.slug = validated.data.slug;
  await category.save();

  if (previousName !== validated.data.name) {
    await OfferModel.updateMany(
      { category: previousName },
      { $set: { category: validated.data.name } }
    );
  }

  return NextResponse.json({
    category: serializeCategory(category.toObject() as Record<string, unknown>)
  });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage categories." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  if (!objectIdPattern.test(id)) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  await connectToDatabase();
  const category = await CategoryModel.findById(id).lean();

  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  const productCount = await OfferModel.countDocuments({ category: category.name });

  if (productCount > 0) {
    return NextResponse.json(
      {
        error: `Impossible de supprimer : ${productCount} produit(s) utilisent cette catégorie. Déplacez-les d’abord.`
      },
      { status: 409 }
    );
  }

  await CategoryModel.deleteOne({ _id: category._id });

  // Si un produit a été rattaché à la catégorie entre le comptage et la
  // suppression, on la restaure pour ne pas laisser de produits orphelins.
  const orphans = await OfferModel.countDocuments({ category: category.name });

  if (orphans > 0) {
    await CategoryModel.updateOne(
      { _id: category._id },
      { $setOnInsert: { name: category.name, slug: category.slug } },
      { upsert: true }
    );

    return NextResponse.json(
      { error: "Impossible de supprimer : des produits utilisent cette catégorie." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
