import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez la marque FocusGym et ses vêtements de compression."
};

export default function AboutPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">À propos</span>
        <h1>FocusGym</h1>
        <p>
          FocusGym est une marque de performance sportswear conçue pour les
          athlètes qui exigent plus de leur training.
        </p>
      </div>

      <div className="policy-list">
        <article>
          <p>
            Notre mission est simple : créer des vêtements de compression de
            qualité européenne 🇪🇺, alliant performance, confort et design
            minimaliste. Chaque pièce est pensée pour accompagner vos
            entraînements les plus intenses et vous aider à repousser vos
            limites.
          </p>
        </article>
        <article>
          <p>
            Chez FocusGym, nous croyons que la réussite repose sur la discipline,
            la constance et le focus.
          </p>
          <p>Train harder. Stay focused.</p>
        </article>
      </div>
    </section>
  );
}
