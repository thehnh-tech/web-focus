import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce/ProductDetail";
import { getProductBySlug } from "@/lib/products";
import { connectToDatabase, hasMongoUri } from "@/lib/mongodb";
import { OfferModel } from "@/lib/models";
import { serializeOffer } from "@/lib/server-utils";
import type { Product } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

async function findProduct(slug: string): Promise<Product | undefined> {
  if (hasMongoUri()) {
    await connectToDatabase();
    const offer = await OfferModel.findOne({ slug }).lean();

    if (offer) {
      return serializeOffer(offer as Record<string, unknown>);
    }

    if (await OfferModel.exists({})) {
      return undefined;
    }
  }

  return getProductBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    return {
      title: "Produit"
    };
  }

  return {
    title: `${product.name} | FocusGym`,
    description: product.description,
    openGraph: {
      images: [product.image]
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await findProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
