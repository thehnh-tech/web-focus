import { Dumbbell, ShieldCheck, Wind, Gem } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Second-Skin Fit",
    text: "Snug support that moves with you."
  },
  {
    icon: Wind,
    title: "Breathable Fabric",
    text: "Keeps you cool and dry."
  },
  {
    icon: Dumbbell,
    title: "Built for Training",
    text: "Designed to perform through every rep."
  },
  {
    icon: Gem,
    title: "Premium Quality",
    text: "Durable materials. Made to last."
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
