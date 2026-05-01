import type { Product, ProductCategory } from "@/lib/types";
import { fallbackProducts, governorates, orderSizes } from "@/lib/products";

export const productCategories: ProductCategory[] = [
  "Compression Tops",
  "Sets",
  "Accessories"
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function serializeOffer(offer: Record<string, unknown>): Product {
  return {
    id: String(offer._id ?? offer.id),
    slug: String(offer.slug),
    name: String(offer.name),
    price: Number(offer.price),
    oldPrice:
      offer.oldPrice === undefined || offer.oldPrice === null
        ? undefined
        : Number(offer.oldPrice),
    category: String(offer.category) as ProductCategory,
    image: String(offer.image),
    secondaryImage: offer.secondaryImage ? String(offer.secondaryImage) : undefined,
    alt: String(offer.alt ?? offer.name),
    color: offer.color ? String(offer.color) : undefined,
    description: String(offer.description),
    featured: offer.featured !== false
  };
}

export function validateOfferPayload(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const oldPrice =
    body.oldPrice === undefined || body.oldPrice === "" ? undefined : Number(body.oldPrice);
  const category = String(body.category ?? "").trim() as ProductCategory;
  const image = String(body.image ?? "").trim();
  const description = String(body.description ?? "").trim();
  const slug = String(body.slug ?? slugify(name)).trim();

  if (!name || !slug || !Number.isFinite(price) || price <= 0) {
    return { error: "Name, slug and a valid price are required." };
  }

  if (!productCategories.includes(category)) {
    return { error: "Invalid product category." };
  }

  if (!image || !description) {
    return { error: "Image and description are required." };
  }

  if (oldPrice !== undefined && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
    return { error: "Old price must be a valid number." };
  }

  return {
    data: {
      slug,
      name,
      price,
      oldPrice,
      category,
      image,
      secondaryImage: String(body.secondaryImage ?? "").trim() || undefined,
      alt: String(body.alt ?? name).trim() || name,
      color: String(body.color ?? "").trim() || undefined,
      description,
      featured: body.featured !== false
    }
  };
}

export function validateOrderPayload(body: Record<string, unknown>) {
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const size = String(body.size ?? "").trim();
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!fullName || !phone || !city || !address || !email || !size) {
    return { error: "All order fields are required." };
  }

  if (!governorates.includes(city as (typeof governorates)[number])) {
    return { error: "Invalid city." };
  }

  if (!orderSizes.includes(size as (typeof orderSizes)[number])) {
    return { error: "Invalid size." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email." };
  }

  if (rawItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const items = rawItems.map((item) => {
    const record = item as Record<string, unknown>;
    const quantity = Number(record.quantity);
    const price = Number(record.price);

    return {
      productId: String(record.productId ?? ""),
      slug: String(record.slug ?? ""),
      name: String(record.name ?? ""),
      price,
      color: record.color ? String(record.color) : undefined,
      size: String(record.size ?? size),
      quantity
    };
  });

  if (
    items.some(
      (item) =>
        !item.productId ||
        !item.slug ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    )
  ) {
    return { error: "Invalid cart item." };
  }

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 7;

  return {
    data: {
      fullName,
      phone,
      city,
      address,
      email,
      size,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: "Cash on Delivery"
    }
  };
}

export function fallbackProductBySlug(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug);
}
