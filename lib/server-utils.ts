import type { Category, Product } from "@/lib/types";
import { CategoryModel, OfferModel, SettingsModel } from "@/lib/models";
import { governorates, orderSizes } from "@/lib/products";
import { isSizeSoldOut, sanitizeSoldOutSizes } from "@/lib/sizes";

const objectIdPattern = /^[a-f\d]{24}$/i;

type ParsedOrderItem = {
  productId: string;
  slug: string;
  size: string;
  quantity: number;
};

type OfficialOrderItem = ParsedOrderItem & {
  name: string;
  price: number;
  color?: string;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    category: String(offer.category),
    image: String(offer.image),
    secondaryImage: offer.secondaryImage ? String(offer.secondaryImage) : undefined,
    alt: String(offer.alt ?? offer.name),
    color: offer.color ? String(offer.color) : undefined,
    description: String(offer.description),
    featured: offer.featured !== false,
    soldOutSizes: sanitizeSoldOutSizes(offer.soldOutSizes),
    createdAt:
      offer.createdAt instanceof Date ? offer.createdAt.toISOString() : undefined
  };
}

export async function getDeliveryFee() {
  const settings = await SettingsModel.findOne({ key: "shop" }).lean();
  const fee = Number(settings?.deliveryFee ?? 0);
  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

export async function updateDeliveryFee(deliveryFee: number) {
  const settings = await SettingsModel.findOneAndUpdate(
    { key: "shop" },
    { $set: { deliveryFee } },
    { new: true, upsert: true }
  ).lean();

  return Number(settings?.deliveryFee ?? 0);
}

export function serializeCategory(category: Record<string, unknown>): Category {
  return {
    id: String(category._id ?? category.id),
    slug: String(category.slug),
    name: String(category.name)
  };
}

export function validateCategoryPayload(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const slug = slugify(String(body.slug ?? "").trim() || name);

  if (!name || !slug) {
    return { error: "Le nom de la catégorie est obligatoire." };
  }

  return { data: { name, slug } };
}

export async function ensureCategoriesSeeded() {
  const count = await CategoryModel.estimatedDocumentCount();

  if (count > 0) {
    return;
  }

  const existing = (await OfferModel.distinct("category")) as string[];

  if (existing.length === 0) {
    return;
  }

  // L'index unique sur slug doit exister avant d'écrire, sinon des requêtes
  // concurrentes au premier déploiement peuvent créer des doublons.
  await CategoryModel.createIndexes();

  const bySlug = new Map<string, string>();

  for (const raw of existing) {
    const name = raw?.trim();

    if (!name) {
      continue;
    }

    const slug = slugify(name);

    if (!slug) {
      continue;
    }

    const kept = bySlug.get(slug);

    if (!kept) {
      bySlug.set(slug, name);
    } else if (kept !== name) {
      // Deux noms qui produisent le même slug : on fusionne sur le premier
      // pour qu'aucune offre ne reste sans catégorie valide.
      await OfferModel.updateMany({ category: name }, { $set: { category: kept } });
    }
  }

  if (bySlug.size === 0) {
    return;
  }

  await CategoryModel.bulkWrite(
    Array.from(bySlug, ([slug, name]) => ({
      updateOne: {
        filter: { slug },
        update: { $setOnInsert: { name, slug } },
        upsert: true
      }
    })),
    { ordered: false }
  );
}

function isAllowedImageSrc(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function validateOfferPayload(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  // null (et pas undefined) pour que Mongoose efface bien le champ lors d'un PUT :
  // les clés undefined sont supprimées de l'update et l'ancienne valeur resterait.
  const oldPrice =
    body.oldPrice === undefined || body.oldPrice === "" ? null : Number(body.oldPrice);
  const category = String(body.category ?? "").trim();
  const image = String(body.image ?? "").trim();
  const secondaryImage = String(body.secondaryImage ?? "").trim() || null;
  const description = String(body.description ?? "").trim();
  const slug = String(body.slug ?? "").trim() || slugify(name);

  if (!name || !slug || !Number.isFinite(price) || price <= 0) {
    return { error: "Le nom et un prix valide sont obligatoires." };
  }

  if (!category) {
    return { error: "La catégorie est obligatoire." };
  }

  const categoryExists = await CategoryModel.exists({ name: category });

  if (!categoryExists) {
    return { error: "Catégorie produit invalide." };
  }

  if (!image || !description) {
    return { error: "L’image et la description sont obligatoires." };
  }

  if (!isAllowedImageSrc(image) || (secondaryImage && !isAllowedImageSrc(secondaryImage))) {
    return {
      error:
        "L’image doit provenir de l’upload (res.cloudinary.com) ou être un chemin local commençant par /."
    };
  }

  if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= 0)) {
    return { error: "L’ancien prix doit être un nombre valide." };
  }

  return {
    data: {
      slug,
      name,
      price,
      oldPrice,
      category,
      image,
      secondaryImage,
      alt: String(body.alt ?? name).trim() || name,
      color: String(body.color ?? "").trim() || null,
      description,
      featured: body.featured !== false,
      // Clé omise si le payload ne l'envoie pas : Mongoose retire les clés
      // undefined de l'update, donc un client qui n'envoie pas le champ ne
      // remet pas à zéro les ruptures enregistrées.
      soldOutSizes: Array.isArray(body.soldOutSizes)
        ? sanitizeSoldOutSizes(body.soldOutSizes)
        : undefined
    }
  };
}

async function resolveOfficialOrderItems(items: ParsedOrderItem[]) {
  const slugs = Array.from(new Set(items.map((item) => item.slug).filter(Boolean)));
  const objectIds = Array.from(
    new Set(items.map((item) => item.productId).filter((id) => objectIdPattern.test(id)))
  );
  const filters = [
    ...(slugs.length > 0 ? [{ slug: { $in: slugs } }] : []),
    ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : [])
  ];
  const offers =
    filters.length > 0
      ? await OfferModel.find({ $or: filters }).lean()
      : [];
  const officialProducts = offers.map((offer) =>
    serializeOffer(offer as Record<string, unknown>)
  );
  const productsById = new Map(officialProducts.map((product) => [product.id, product]));
  const productsBySlug = new Map(officialProducts.map((product) => [product.slug, product]));
  const officialItems: OfficialOrderItem[] = [];

  for (const item of items) {
    const product = productsById.get(item.productId) ?? productsBySlug.get(item.slug);

    if (!product) {
      return { error: "Produit indisponible dans le panier." };
    }

    if (isSizeSoldOut(product, item.size)) {
      return {
        error: `La taille ${item.size} de « ${product.name} » est en rupture de stock. Retirez-la du panier pour continuer.`
      };
    }

    officialItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      color: product.color,
      size: item.size,
      quantity: item.quantity
    });
  }

  return { items: officialItems };
}

export async function validateOrderPayload(body: Record<string, unknown>) {
  const fullName = String(body.fullName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const size = String(body.size ?? "").trim();
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!fullName || !phone || !city || !address || !size) {
    return { error: "Tous les champs de commande sont obligatoires." };
  }

  if (!governorates.includes(city as (typeof governorates)[number])) {
    return { error: "Ville invalide." };
  }

  if (!orderSizes.includes(size as (typeof orderSizes)[number])) {
    return { error: "Taille invalide." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email invalide." };
  }

  if (rawItems.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const items = rawItems.map((item) => {
    const record = item as Record<string, unknown>;
    const quantity = Number(record.quantity);

    return {
      productId: String(record.productId ?? ""),
      slug: String(record.slug ?? ""),
      size: String(record.size ?? size),
      quantity
    };
  });

  if (
    items.some(
      (item) =>
        (!item.productId && !item.slug) ||
        !orderSizes.includes(item.size as (typeof orderSizes)[number]) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    )
  ) {
    return { error: "Produit invalide dans le panier." };
  }

  const resolved = await resolveOfficialOrderItems(items);

  if ("error" in resolved) {
    return { error: resolved.error };
  }

  const subtotal = resolved.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = await getDeliveryFee();

  return {
    data: {
      fullName,
      phone,
      city,
      address,
      email,
      size,
      items: resolved.items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: "Paiement à la livraison"
    }
  };
}
