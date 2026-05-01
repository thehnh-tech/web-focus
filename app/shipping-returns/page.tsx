import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "FOCUS delivery, returns and exchange policy."
};

const sections = [
  {
    title: "Delivery",
    text: "We deliver across Tunisia. Delivery times may vary depending on your city."
  },
  {
    title: "Order Confirmation",
    text: "After placing your order, our team may contact you to confirm your details."
  },
  {
    title: "Returns & Exchanges",
    text: "Returns and exchanges are accepted according to the store policy. Items must be unworn and in original condition."
  },
  {
    title: "Support",
    text: "For delivery or return questions, contact us at hello@focuswear.com."
  }
];

export default function ShippingReturnsPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Support</span>
        <h1>Shipping & Returns</h1>
      </div>
      <div className="policy-list">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
