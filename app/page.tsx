import Image from "next/image";
import Link from "next/link";
import { FeaturedProducts } from "@/components/commerce/FeaturedProducts";
import { FeatureStrip } from "@/components/commerce/FeatureStrip";
import { Reveal } from "@/components/ui/Reveal";

const heroSlides = [
  {
    src: "/images/shooting-focus-black-offi.png",
    alt: "FocusGym black compression top photoshoot"
  },
  {
    src: "/images/shooting-focus-black-offi-2.png",
    alt: "FocusGym black compression top back photoshoot"
  },
  {
    src: "/images/shooting-focus-white.png",
    alt: "FocusGym white compression top photoshoot"
  },
  {
    src: "/images/shooting-focus-white-offi.png",
    alt: "FocusGym white compression top back photoshoot"
  }
];

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
          <div className="hero-carousel-frame" aria-label="FocusGym product photos">
            <div className="hero-carousel-track">
              {heroSlides.map((slide, index) => (
                <div className="hero-carousel-slide" key={slide.src}>
                  <Image
                    alt={slide.alt}
                    className="hero-carousel-image"
                    height={1492}
                    priority={index === 0}
                    src={slide.src}
                    width={1054}
                  />
                </div>
              ))}
            </div>
          </div>
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
