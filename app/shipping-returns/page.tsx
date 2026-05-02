import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description: "Politique de livraison, retour et échange FocusGym."
};

const sections = [
  {
    title: "Livraison",
    text: "Nous livrons partout en Tunisie. Les délais peuvent varier selon votre ville."
  },
  {
    title: "Confirmation de commande",
    text: "Après votre commande, notre équipe peut vous contacter pour confirmer vos informations."
  },
  {
    title: "Retours & échanges",
    text: "Les retours et échanges sont acceptés selon la politique de la boutique. Les articles doivent être non portés et en état d’origine."
  },
  {
    title: "Support",
    text: "Pour toute question de livraison ou de retour, contactez-nous à focusgym.pro@gmail.com."
  }
];

export default function ShippingReturnsPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Support</span>
        <h1>Livraison & retours</h1>
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
