"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { fallbackProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/offers", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data?.offers) && data.offers.length > 0) {
          setProducts(data.offers);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const featured = useMemo(
    () => products.filter((product) => product.featured !== false).slice(0, 3),
    [products]
  );

  return (
    <div className="product-grid">
      {featured.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
