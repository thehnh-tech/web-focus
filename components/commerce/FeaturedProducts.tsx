"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { Product } from "@/lib/types";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/offers", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("offers failed");
        }
        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (Array.isArray(data?.offers)) {
          setProducts(data.offers);
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featured = useMemo(
    () => products.filter((product) => product.featured !== false).slice(0, 4),
    [products]
  );

  if (isLoading) {
    return (
      <div className="product-grid shop-grid">
        {[0, 1, 2, 3].map((index) => (
          <div className="product-card product-card-skeleton" key={index} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="empty-state">
        <h2>Une erreur est survenue.</h2>
        <p>Impossible de charger les produits. Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  if (featured.length === 0) {
    return (
      <div className="empty-state">
        <h2>Bientôt disponible.</h2>
        <p>Les produits FocusGym arrivent très prochainement.</p>
      </div>
    );
  }

  return (
    <div className="product-grid shop-grid">
      {featured.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
}
