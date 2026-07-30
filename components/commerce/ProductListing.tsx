"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/commerce/ProductCard";

type SortMode = "Featured" | "Price: Low to High" | "Price: High to Low" | "Newest";

const sorts: SortMode[] = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest"
];

const sortLabels: Record<SortMode, string> = {
  Featured: "Sélection",
  "Price: Low to High": "Prix croissant",
  "Price: High to Low": "Prix décroissant",
  Newest: "Nouveautés"
};

export function ProductListing({
  initialCategory = "All",
  compactFilters = false
}: {
  initialCategory?: string;
  compactFilters?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(initialCategory);
  const [sort, setSort] = useState<SortMode>("Featured");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetch("/api/offers", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
      fetch("/api/categories", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null)
    ])
      .then(([offersData, categoriesData]) => {
        if (!isMounted) {
          return;
        }

        if (Array.isArray(offersData?.offers)) {
          setProducts(offersData.offers);
        } else {
          // Une panne des catégories seule est tolérable (les filtres
          // retombent sur « Tous ») ; sans produits, on affiche l'erreur.
          setHasError(true);
        }

        if (Array.isArray(categoriesData?.categories)) {
          setCategories(categoriesData.categories);
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

  const filters = useMemo(() => {
    const names = categories.map((category) => category.name);
    return ["All", ...names];
  }, [categories]);

  const visibleProducts = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? products
        : products.filter((product) => product.category === activeFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Newest") {
        return (
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
      }
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [activeFilter, products, sort]);

  const availableFilters = compactFilters
    ? filters.filter((filter) => filter === "All" || filter === initialCategory)
    : filters;

  return (
    <section className="products-section">
      <div className="container">
        <div className="filter-bar">
          <div className="filter-tabs" aria-label="Filtres produits">
            {availableFilters.map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter === "All" ? "Tous" : filter}
              </button>
            ))}
          </div>
          <label className="sort-select">
            <span>Trier</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              {sorts.map((sortOption) => (
                <option key={sortOption} value={sortOption}>
                  {sortLabels[sortOption]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="product-grid shop-grid">
            {[0, 1, 2].map((index) => (
              <div className="product-card product-card-skeleton" key={index} aria-hidden="true" />
            ))}
          </div>
        ) : hasError ? (
          <div className="empty-state">
            <h2>Une erreur est survenue.</h2>
            <p>Impossible de charger les produits. Veuillez réessayer plus tard.</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="product-grid shop-grid">
            {visibleProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Aucun produit trouvé.</h2>
            <p>Essayez un autre filtre ou revenez bientôt.</p>
          </div>
        )}
      </div>
    </section>
  );
}
