import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models";
import { validateOrderPayload } from "@/lib/server-utils";
import { sendOrderNotification } from "@/lib/email";

export const runtime = "nodejs";

function serializeOrder(order: Record<string, unknown>) {
  return {
    id: String(order._id),
    fullName: order.fullName,
    phone: order.phone,
    city: order.city,
    address: order.address,
    email: order.email,
    size: order.size,
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMongoUri()) {
    return NextResponse.json({ orders: [], source: "missing-mongodb" });
  }

  await connectToDatabase();
  const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    orders: orders.map((order) => serializeOrder(order as Record<string, unknown>))
  });
}

export async function POST(request: Request) {
  if (!hasMongoUri()) {
    return NextResponse.json(
      { error: "MONGODB_URI must be configured before orders can be placed." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  await connectToDatabase();
  const validated = await validateOrderPayload(body);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const created = await OrderModel.create(validated.data);
  const orderObject = created.toObject() as Record<string, unknown>;

  try {
    await sendOrderNotification({
      id: String(orderObject._id),
      fullName: String(orderObject.fullName),
      phone: String(orderObject.phone),
      city: String(orderObject.city),
      address: String(orderObject.address),
      email: orderObject.email ? String(orderObject.email) : undefined,
      size: String(orderObject.size),
      items: orderObject.items as Array<{
        name: string;
        quantity: number;
        size: string;
        price: number;
      }>,
      subtotal: Number(orderObject.subtotal),
      deliveryFee: Number(orderObject.deliveryFee),
      total: Number(orderObject.total),
      paymentMethod: String(orderObject.paymentMethod || "Paiement à la livraison"),
      createdAt: orderObject.createdAt as Date
    });
  } catch (error) {
    console.error("Failed to send order notification email", error);
  }

  return NextResponse.json(
    { order: serializeOrder(orderObject) },
    { status: 201 }
  );
}
