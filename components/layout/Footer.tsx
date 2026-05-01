import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Music2 } from "lucide-react";

const footerColumns = [
  {
    title: "Boutique",
    links: [
      { href: "/shop", label: "Tous les produits" },
      { href: "/shop", label: "T-shirts de compression" },
      { href: "/size-guide", label: "Guide des tailles" }
    ]
  },
  {
    title: "Marque",
    links: [
      { href: "/about", label: "Notre histoire" },
      { href: "/about", label: "Matières" },
      { href: "/contact", label: "Contact" }
    ]
  },
  {
    title: "Support",
    links: [
      { href: "/shipping-returns", label: "Livraison" },
      { href: "/shipping-returns", label: "Retours et échanges" },
      { href: "/faq", label: "FAQs" },
      { href: "/size-guide", label: "Guide des tailles" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image alt="FOCUS logo" height={56} src="/images/logo.png" width={56} />
          <p>Vêtements de compression conçus pour ceux qui s’entraînent avec discipline.</p>
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
              <Music2 aria-hidden="true" />
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
          <a href="mailto:hello@focuswear.com">hello@focuswear.com</a>
          <a href="tel:+21654254597">+216 54 254 597</a>
          <span>Tunis, Tunisia</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2025 FOCUS. Tous droits réservés.</span>
        <div>
          <Link href="/terms">CGV</Link>
          <Link href="/privacy">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
