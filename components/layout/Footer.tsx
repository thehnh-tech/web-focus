import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Send } from "lucide-react";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/shop", label: "Compression Tops" },
      { href: "/size-guide", label: "Size Guide" }
    ]
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/about", label: "Materials" },
      { href: "/contact", label: "Contact" }
    ]
  },
  {
    title: "Support",
    links: [
      { href: "/shipping-returns", label: "Shipping & Delivery" },
      { href: "/shipping-returns", label: "Returns & Exchanges" },
      { href: "/faq", label: "FAQs" },
      { href: "/size-guide", label: "Size Guide" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image alt="FOCUS logo" height={56} src="/images/logo.png" width={56} />
          <p>Engineered compression wear for those who train with focus.</p>
          <div className="social-links" aria-label="Social links">
            <a href="https://instagram.com" aria-label="Instagram">
              <Instagram aria-hidden="true" />
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <Facebook aria-hidden="true" />
            </a>
            <a href="https://wa.me/21654254597" aria-label="WhatsApp">
              <Send aria-hidden="true" />
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
        <span>© 2025 FOCUS. All rights reserved.</span>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
