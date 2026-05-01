import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about FOCUS compression wear."
};

const faqItems = [
  {
    title: "What size should I choose?",
    content:
      "Our compression tops are fitted. Choose your usual size for compression, or size up for a more relaxed fit."
  },
  {
    title: "Do you deliver in Tunisia?",
    content: "Yes, delivery is available across Tunisia."
  },
  {
    title: "How long does delivery take?",
    content:
      "Delivery time depends on your city. We will contact you after your order to confirm timing."
  },
  {
    title: "Can I exchange my item?",
    content: "Yes, exchanges are possible according to our return policy."
  },
  {
    title: "How should I wash the compression top?",
    content: "Machine wash cold. Do not bleach. Air dry recommended."
  }
];

export default function FAQPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Support</span>
        <h1>FAQ</h1>
      </div>
      <Accordion items={faqItems} />
    </section>
  );
}
