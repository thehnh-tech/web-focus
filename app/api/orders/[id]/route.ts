import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

const statuses = ["new", "confirmed", "delivered", "cancelled"];

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to update orders." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;
  const status = String(body.status ?? "");

  if (!statuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const { id } = await context.params;
  await connectToDatabase();
  const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured to delete orders." },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  await connectToDatabase();
  const deleted = await OrderModel.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
