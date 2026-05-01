import Image from "next/image";
import Link from "next/link";
import { FeaturedProducts } from "@/components/commerce/FeaturedProducts";
import { FeatureStrip } from "@/components/commerce/FeatureStrip";
import { Reveal } from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              Conçu
              <br />
              pour le focus.
            </h1>
            <p className="hero-text">
              Des vêtements de compression performants pour accompagner chaque
              répétition, chaque série, chaque objectif.
            </p>
            <div className="hero-actions">
              <Link className="btn-primary" href="/shop">
                Voir les produits
              </Link>
              <Link className="btn-secondary" href="/size-guide">
                Guide des tailles
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <Image
              alt="Black and white FOCUS compression tops"
              className="hero-product-image"
              height={720}
              priority
              src="/images/packhero.png"
              width={720}
            />
          </div>
        </div>
      </section>

      <section className="section featured-products">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <span className="section-eyebrow">Produits phares</span>
              <h2 className="section-title">
                Conçus pour
                <br />
                performer.
              </h2>
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
