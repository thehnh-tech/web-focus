import type { Metadata } from "next";
import { ProductListing } from "@/components/commerce/ProductListing";

export const metadata: Metadata = {
  title: "Shop | FOCUS Compression Wear",
  description: "Shop all FOCUS compression wear built for every training session."
};

export default function ShopPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Shop All</h1>
          <p>Compression wear built for every training session.</p>
        </div>
      </section>
      <ProductListing />
    </>
  );
}
