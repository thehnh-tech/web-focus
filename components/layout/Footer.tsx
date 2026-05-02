import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

const footerColumns = [
  {
    title: "Boutique",
    links: [
      { href: "/shop", label: "Tous les produits" },
      { href: "/size-guide", label: "Guide des tailles" }
    ]
  },
  {
    title: "Marque",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/contact", label: "Contact" }
    ]
  },
  {
    title: "Support",
    links: [
      { href: "/shipping-returns", label: "Livraison" },
      { href: "/shipping-returns", label: "Retours et échanges" },
      { href: "/faq", label: "FAQs" }
    ]
  }
];

function TikTokLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="M16.75 2c.3 2.42 1.69 3.87 4.05 4.03v3.22c-1.37.13-2.57-.31-3.95-1.15v6.02c0 7.65-8.33 10.04-11.68 4.56-2.15-3.52-.83-9.68 6.05-9.93v3.4c-.45.07-.93.18-1.37.33-1.31.44-2.05 1.27-1.85 2.73.38 2.8 5.53 3.63 5.1-1.84V2h3.65z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image alt="FocusGym logo" height={56} src="/images/logo.png" width={56} />
          <p>Sportswear de performance avec qualité européenne 🇪🇺, pensé pour s’entraîner avec discipline.</p>
          <div className="social-links" aria-label="Social links">
            <a href="https://www.instagram.com/focusgym.tn/" aria-label="Instagram">
              <Instagram aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61585161253025"
              aria-label="Facebook"
            >
              <Facebook aria-hidden="true" />
            </a>
            <a href="https://www.tiktok.com/@focusgym_tn" aria-label="TikTok">
              <TikTokLogo />
            </a>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h2>{column.title}</h2>
            {column.links.map((link) => (
              <Link href={link.href} key={`${column.title}-${link.label}`}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <div className="footer-column">
          <h2>Contact</h2>
          <a href="mailto:focusgym.pro@gmail.com">focusgym.pro@gmail.com</a>
          <a href="tel:+21625166891">25 166 891</a>
          <span>Tunis, Tunisia</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FocusGym. Tous droits réservés.</span>
        <div>
          <Link href="/terms">CGV</Link>
          <Link href="/privacy">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
