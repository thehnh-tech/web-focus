import type { Metadata } from "next";
import { ProductListing } from "@/components/commerce/ProductListing";

export const metadata: Metadata = {
  title: "Boutique | FOCUS",
  description: "Découvrez les vêtements de compression FOCUS conçus pour chaque séance."
};

export default function ShopPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Boutique</h1>
          <p>Des vêtements de compression conçus pour chaque séance.</p>
        </div>
      </section>
      <ProductListing />
    </>
  );
}
