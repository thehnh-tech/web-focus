import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { getDeliveryFee, updateDeliveryFee } from "@/lib/server-utils";

export const runtime = "nodejs";

export async function GET() {
  if (!hasMongoUri()) {
    return NextResponse.json({ settings: { deliveryFee: 0 }, source: "missing-mongodb" });
  }

  try {
    await connectToDatabase();
    const deliveryFee = await getDeliveryFee();

    return NextResponse.json({ settings: { deliveryFee }, source: "mongodb" });
  } catch (error) {
    console.error("GET /api/settings failed", error);
    return NextResponse.json(
      { error: "Impossible de charger les paramètres." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to manage settings." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const deliveryFee = Number(body?.deliveryFee);

  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    return NextResponse.json(
      { error: "Les frais de livraison doivent être un nombre positif ou zéro." },
      { status: 400 }
    );
  }

  await connectToDatabase();
  const saved = await updateDeliveryFee(deliveryFee);

  return NextResponse.json({ settings: { deliveryFee: saved } });
}
