"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  function handleAddToCart() {
    setState("adding");
    addToCart({ product, size: "M", quantity: 1 });
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
          disabled={state !== "idle"}
          onClick={handleAddToCart}
          type="button"
        >
          {state === "adding" ? "Ajout..." : state === "added" ? "Ajouté" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}
