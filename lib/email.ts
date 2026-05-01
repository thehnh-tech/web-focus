import { Resend } from "resend";
import { formatPrice } from "@/lib/products";

type OrderEmailItem = {
  name: string;
  quantity: number;
  size: string;
  price: number;
};

type OrderEmailInput = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  size: string;
  items: OrderEmailItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: string;
  createdAt?: Date | string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value?: Date | string) {
  if (!value) {
    return "Date indisponible";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date indisponible";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function buildOrderEmail(order: OrderEmailInput) {
  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.size)}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatPrice(
            item.price * item.quantity
          )}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#171717;background:#ffffff;line-height:1.5;">
      <h1 style="margin:0 0 8px;font-size:28px;text-transform:uppercase;">Nouveau bon de commande</h1>
      <p style="margin:0 0 24px;color:#525252;">Commande #${escapeHtml(
        order.id.slice(-6).toUpperCase()
      )} reçue le ${escapeHtml(formatDate(order.createdAt))}.</p>

      <div style="display:block;padding:18px;border:1px solid #e5e5e5;border-radius:8px;margin-bottom:18px;">
        <h2 style="font-size:14px;text-transform:uppercase;margin:0 0 12px;">Client</h2>
        <p style="margin:0;"><strong>${escapeHtml(order.fullName)}</strong></p>
        <p style="margin:0;">Téléphone : ${escapeHtml(order.phone)}</p>
        <p style="margin:0;">Email : ${escapeHtml(order.email)}</p>
      </div>

      <div style="display:block;padding:18px;border:1px solid #e5e5e5;border-radius:8px;margin-bottom:18px;">
        <h2 style="font-size:14px;text-transform:uppercase;margin:0 0 12px;">Livraison</h2>
        <p style="margin:0;">Ville : ${escapeHtml(order.city)}</p>
        <p style="margin:0;">Adresse : ${escapeHtml(order.address)}</p>
        <p style="margin:0;">Taille demandée : ${escapeHtml(order.size)}</p>
        <p style="margin:0;">Paiement : ${escapeHtml(order.paymentMethod || "Paiement à la livraison")}</p>
      </div>

      <table style="border-collapse:collapse;width:100%;margin-bottom:18px;">
        <thead>
          <tr>
            <th style="padding:12px;background:#f5f5f5;text-align:left;">Produit</th>
            <th style="padding:12px;background:#f5f5f5;text-align:left;">Taille</th>
            <th style="padding:12px;background:#f5f5f5;text-align:center;">Qté</th>
            <th style="padding:12px;background:#f5f5f5;text-align:right;">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="padding:18px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:0;">Sous-total : <strong>${formatPrice(order.subtotal)}</strong></p>
        <p style="margin:0;">Livraison : <strong>${formatPrice(order.deliveryFee)}</strong></p>
        <p style="margin:8px 0 0;font-size:18px;">Total : <strong>${formatPrice(order.total)}</strong></p>
      </div>
    </div>
  `;
}

export async function sendOrderNotification(order: OrderEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return { skipped: true };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: order.email,
    subject: `FOCUS - Nouveau bon de commande #${order.id.slice(-6).toUpperCase()}`,
    html: buildOrderEmail(order)
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return { skipped: false, id: data?.id };
}
