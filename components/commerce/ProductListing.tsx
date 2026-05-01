"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackProducts } from "@/lib/products";
import type { Product, ProductCategory } from "@/lib/types";
import { ProductCard } from "@/components/commerce/ProductCard";

type SortMode = "Featured" | "Price: Low to High" | "Price: High to Low" | "Newest";
type FilterMode = "All" | ProductCategory;

const filters: FilterMode[] = ["All", "Compression Tops", "Sets", "Accessories"];
const sorts: SortMode[] = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest"
];

export function ProductListing({
  initialCategory = "All",
  compactFilters = false
}: {
  initialCategory?: FilterMode;
  compactFilters?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [activeFilter, setActiveFilter] = useState<FilterMode>(initialCategory);
  const [sort, setSort] = useState<SortMode>("Featured");

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

  const visibleProducts = useMemo(() => {
    const filtered =
      activeFilter === "All"
        ? products
        : products.filter((product) => product.category === activeFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Newest") return b.id.localeCompare(a.id);
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
          <div className="filter-tabs" aria-label="Product filters">
            {availableFilters.map((filter) => (
              <button
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
          <label className="sort-select">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              {sorts.map((sortOption) => (
                <option key={sortOption}>{sortOption}</option>
              ))}
            </select>
          </label>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="product-grid shop-grid">
            {visibleProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>No products found.</h2>
            <p>Try another filter or check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
