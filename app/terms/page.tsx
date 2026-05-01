import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FOCUS terms of service."
};

const terms = [
  {
    title: "Orders",
    text: "Orders are confirmed after the customer submits complete contact and delivery information."
  },
  {
    title: "Pricing",
    text: "Prices are displayed in DT. Promotional prices may change according to availability."
  },
  {
    title: "Payment",
    text: "Cash on delivery is available. Other payment methods may be added later."
  },
  {
    title: "Delivery",
    text: "Delivery is available in Tunisia. Delivery timing depends on the customer city."
  },
  {
    title: "Returns",
    text: "Returns and exchanges are handled according to store policy and require items to be unworn and in original condition."
  },
  {
    title: "Product Availability",
    text: "Products and sizes are subject to stock availability."
  },
  {
    title: "Contact",
    text: "For support, contact hello@focuswear.com."
  }
];

export default function TermsPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Legal</span>
        <h1>Terms of Service</h1>
      </div>
      <div className="policy-list">
        {terms.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="note">This legal text is a starter template and should be validated.</p>
    </section>
  );
}
