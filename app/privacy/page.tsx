import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité FocusGym."
};

const sections = [
  {
    title: "Informations collectées",
    text: "Nous collectons les informations nécessaires au traitement de votre commande : nom, téléphone, email, adresse, ville et taille choisie."
  },
  {
    title: "Utilisation des informations",
    text: "Nous utilisons vos informations pour confirmer les commandes, organiser la livraison et assurer le support client."
  },
  {
    title: "Cookies",
    text: "Le site peut utiliser des cookies essentiels pour le panier et la session administrateur."
  },
  {
    title: "Services tiers",
    text: "L’hébergement, les outils d’analyse ou de livraison peuvent traiter certaines données nécessaires au fonctionnement de la boutique."
  },
  {
    title: "Contact",
    text: "Pour toute question liée à la confidentialité, contactez focusgym.pro@gmail.com."
  }
];

export default function PrivacyPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Légal</span>
        <h1>Politique de confidentialité</h1>
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
