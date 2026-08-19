"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { defaultAvailableSize, isProductSoldOut } from "@/lib/sizes";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const soldOut = isProductSoldOut(product);
  const quickAddSize = defaultAvailableSize(product);

  function handleAddToCart() {
    if (!quickAddSize) {
      return;
    }

    setState("adding");
    addToCart({ product, size: quickAddSize, quantity: 1 });
    window.setTimeout(() => setState("added"), 250);
    window.setTimeout(() => setState("idle"), 1200);
  }

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-wrap">
        <Image
          alt={product.alt}
          className="product-image"
          height={720}
          loading="lazy"
          src={product.image}
          width={720}
        />
      </Link>
      <div className="product-info">
        <Link href={`/products/${product.slug}`} className="product-title">
          {product.name}
        </Link>
        <div className="product-price-row">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="price-old">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </div>
        <button
          className="add-to-cart"
          disabled={soldOut || state !== "idle"}
          onClick={handleAddToCart}
          type="button"
        >
          {soldOut
            ? "Épuisé"
            : state === "adding"
              ? `Ajout... (${quickAddSize})`
              : state === "added"
                ? `Ajouté (${quickAddSize})`
                : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
