import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente FocusGym."
};

const terms = [
  {
    title: "Commandes",
    text: "Les commandes sont confirmées après réception des informations complètes de contact et de livraison."
  },
  {
    title: "Prix",
    text: "Les prix sont affichés en DT. Les prix promotionnels peuvent évoluer selon la disponibilité."
  },
  {
    title: "Paiement",
    text: "Le paiement à la livraison est disponible. D’autres moyens de paiement pourront être ajoutés."
  },
  {
    title: "Livraison",
    text: "La livraison est disponible en Tunisie. Le délai dépend de la ville du client."
  },
  {
    title: "Retours",
    text: "Les retours et échanges sont traités selon la politique de la boutique. Les articles doivent être non portés et en état d’origine."
  },
  {
    title: "Disponibilité",
    text: "Les produits et tailles sont soumis aux stocks disponibles."
  },
  {
    title: "Contact",
    text: "Pour toute demande, contactez focusgym.pro@gmail.com."
  }
];

export default function TermsPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Légal</span>
        <h1>Conditions générales de vente</h1>
      </div>
      <div className="policy-list">
        {terms.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="note">Ce texte légal est un modèle de départ et doit être validé.</p>
    </section>
  );
}
