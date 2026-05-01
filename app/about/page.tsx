import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez la marque FOCUS et ses vêtements de compression."
};

const values = [
  {
    title: "Discipline",
    text: "Être présent. S’entraîner dur. Recommencer."
  },
  {
    title: "Performance",
    text: "Conçu pour le mouvement, l’intensité et le confort."
  },
  {
    title: "Focus",
    text: "Aucune distraction. Juste du progrès."
  }
];

export default function AboutPage() {
  return (
    <section className="content-page container">
      <div className="content-hero">
        <span className="section-eyebrow">À propos de FOCUS</span>
        <h1>Conçu pour rester focus.</h1>
        <p>
          FOCUS est une marque de vêtements performance créée pour les sportifs,
          les pratiquants de musculation et ceux qui s’entraînent avec discipline.
        </p>
      </div>

      <div className="content-split">
        <div>
          <h2>Vision de marque</h2>
          <p>
            Nous pensons que l’entraînement commence par la discipline. Nos
            vêtements de compression sont conçus pour vous garder concentré à
            chaque répétition, chaque séance et chaque objectif.
          </p>
        </div>
        <div>
          <h2>Philosophie produit</h2>
          <p>Design épuré. Coupe forte. Matières performantes. Rien d’inutile.</p>
        </div>
      </div>

      <div className="value-grid">
        {values.map((value) => (
          <article className="value-card" key={value.title}>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
