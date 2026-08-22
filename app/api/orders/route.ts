import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models";
import {
  claimPromoCode,
  computePromoDiscount,
  releasePromoCode,
  roundMoney
} from "@/lib/promo";
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
    promoCode: order.promoCode ?? null,
    discount: Number(order.discount ?? 0),
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

  const orderData = validated.data;
  let promoClaimed = false;

  if (orderData.promoCode) {
    // Réservation atomique : re-vérifie limite/expiration/minimum au moment
    // de l'incrément, puis recalcule la remise depuis le document réservé
    // (qui fait foi si l'admin a modifié le code entre-temps).
    const claimed = await claimPromoCode(orderData.promoCode, orderData.subtotal);

    if (!claimed) {
      return NextResponse.json(
        { error: "Ce code promo n’est plus disponible." },
        { status: 400 }
      );
    }

    promoClaimed = true;
    orderData.discount = computePromoDiscount(claimed, orderData.subtotal);
    orderData.total = roundMoney(
      orderData.subtotal - orderData.discount + orderData.deliveryFee
    );
  }

  let created;

  try {
    created = await OrderModel.create(orderData);
  } catch (error) {
    if (promoClaimed && orderData.promoCode) {
      await releasePromoCode(orderData.promoCode).catch(() => undefined);
    }

    throw error;
  }

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
      promoCode: orderObject.promoCode ? String(orderObject.promoCode) : undefined,
      discount: Number(orderObject.discount ?? 0),
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
