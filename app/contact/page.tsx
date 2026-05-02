import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/commerce/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez FocusGym pour une taille, une livraison ou une commande."
};

export default function ContactPage() {
  return (
    <section className="contact-page container">
      <div className="content-hero">
        <span className="section-eyebrow">Support</span>
        <h1>Contact</h1>
        <p>Besoin d’aide pour une taille, une livraison ou une commande ? Écrivez-nous.</p>
      </div>

      <div className="contact-layout">
        <ContactForm />

        <aside className="contact-card">
          <h2>Contact</h2>
          <p>Email: focusgym.pro@gmail.com</p>
          <p>Téléphone : 25 166 891</p>
          <p>Adresse : Tunis, Tunisie</p>
          <Link className="btn-secondary" href="https://wa.me/21625166891">
            Message WhatsApp
          </Link>
        </aside>
      </div>
    </section>
  );
}
