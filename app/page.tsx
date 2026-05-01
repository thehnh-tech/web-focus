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
              Engineered
              <br />
              for Focus.
            </h1>
            <p className="hero-text">
              High-performance compression wear built to support every rep,
              every set, every goal.
            </p>
            <div className="hero-actions">
              <Link className="btn-primary" href="/shop">
                Shop Products
              </Link>
              <Link className="btn-secondary" href="/size-guide">
                Size Guide
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
              <span className="section-eyebrow">Featured Products</span>
              <h2 className="section-title">
                Built for
                <br />
                performance.
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
