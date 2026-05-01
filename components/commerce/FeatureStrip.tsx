import { Dumbbell, ShieldCheck, Wind, Gem } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Coupe seconde peau",
    text: "Un maintien ajusté qui suit chaque mouvement."
  },
  {
    icon: Wind,
    title: "Tissu respirant",
    text: "Aide à rester au frais pendant l’effort."
  },
  {
    icon: Dumbbell,
    title: "Fait pour l’entraînement",
    text: "Conçu pour performer à chaque répétition."
  },
  {
    icon: Gem,
    title: "Qualité premium",
    text: "Des matériaux durables, faits pour tenir."
  }
];

export function FeatureStrip() {
  return (
    <section className="features-strip">
      <div className="container features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div className="feature-item" key={feature.title}>
              <Icon aria-hidden="true" />
              <div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
