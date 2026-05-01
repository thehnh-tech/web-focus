import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/commerce/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact FOCUS for sizing, delivery or order support."
};

export default function ContactPage() {
  return (
    <section className="contact-page container">
      <div className="content-hero">
        <span className="section-eyebrow">Support</span>
        <h1>Contact Us</h1>
        <p>Need help with sizing, delivery or your order? Send us a message.</p>
      </div>

      <div className="contact-layout">
        <ContactForm />

        <aside className="contact-card">
          <h2>Contact</h2>
          <p>Email: hello@focuswear.com</p>
          <p>Phone: +216 54 254 597</p>
          <p>Location: Tunis, Tunisia</p>
          <Link className="btn-secondary" href="https://wa.me/21654254597">
            Message on WhatsApp
          </Link>
        </aside>
      </div>
    </section>
  );
}
