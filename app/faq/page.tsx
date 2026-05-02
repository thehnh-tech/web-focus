import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur les vêtements de compression FocusGym."
};

const faqItems = [
  {
    title: "Quelle taille choisir ?",
    content:
      "Nos t-shirts de compression sont ajustés. Choisissez votre taille habituelle pour un effet compression, ou une taille au-dessus pour plus d’aisance."
  },
  {
    title: "Livrez-vous en Tunisie ?",
    content: "Oui, la livraison est disponible partout en Tunisie."
  },
  {
    title: "Combien de temps prend la livraison ?",
    content:
      "Le délai dépend de votre ville. Nous vous contactons après la commande pour confirmer la livraison."
  },
  {
    title: "Puis-je échanger mon article ?",
    content: "Oui, les échanges sont possibles selon notre politique de retour."
  },
  {
    title: "Comment laver le t-shirt de compression ?",
    content:
      "Conseils d’entretien : séchage en machine à basse température. Ne pas repasser. Ne pas utiliser d’adoucissant. Ne pas nettoyer à sec."
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
