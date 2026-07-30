import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { CategoryModel, OfferModel } from "@/lib/models";
import {
  ensureCategoriesSeeded,
  serializeCategory,
  validateCategoryPayload
} from "@/lib/server-utils";

export const runtime = "nodejs";

export async function GET() {
  if (!hasMongoUri()) {
    return NextResponse.json({ categories: [], source: "missing-mongodb" });
  }

  try {
    await connectToDatabase();
    await ensureCategoriesSeeded();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    const counts = await OfferModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const countByName = new Map(counts.map((entry) => [entry._id, entry.count]));

    return NextResponse.json({
      categories: categories.map((category) => ({
        ...serializeCategory(category as Record<string, unknown>),
        productCount: countByName.get(category.name) ?? 0
      })),
      source: "mongodb"
    });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les catégories." },
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
      { error: "MONGODB_URI must be configured to manage categories." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const validated = validateCategoryPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  await connectToDatabase();
  await ensureCategoriesSeeded();
  const existing = await CategoryModel.exists({
    $or: [{ slug: validated.data.slug }, { name: validated.data.name }]
  });

  if (existing) {
    return NextResponse.json(
      { error: "Cette catégorie existe déjà." },
      { status: 409 }
    );
  }

  try {
    const created = await CategoryModel.create(validated.data);

    return NextResponse.json(
      { category: serializeCategory(created.toObject() as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà." },
        { status: 409 }
      );
    }

    throw error;
  }
}
