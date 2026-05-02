import Link from "next/link";
import { FeaturedProducts } from "@/components/commerce/FeaturedProducts";
import { FeatureStrip } from "@/components/commerce/FeatureStrip";
import { HeroCarousel } from "@/components/commerce/HeroCarousel";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              FocusGym
              <br />
              Official Website
            </h1>
            <p className="hero-text">
              Des vêtements de compression performants pour accompagner chaque
              répétition, chaque série, chaque objectif.
            </p>
            <div className="hero-actions">
              <Link className="btn-primary" href="/shop">
                Voir les produits
              </Link>
            </div>
          </div>
          <HeroCarousel />
        </div>
      </section>

      <section className="section featured-products">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">Produits phares</span>
              <h2 className="section-title">Sélection FocusGym</h2>
            </div>
          </Reveal>
          <Reveal>
            <FeaturedProducts />
          </Reveal>
        </div>
      </section>

      <FeatureStrip />
    </>
  );
}
