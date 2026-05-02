"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, User, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const navLinks = [
  { href: "/shop", label: "Boutique" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const { count } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link className="nav-link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          aria-expanded={isOpen}
          aria-label="Ouvrir le menu"
          className="icon-button mobile-menu-trigger"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" />
        </button>

        <Link className="logo-link" href="/" aria-label="FocusGym home">
          <Image
            alt="FocusGym logo"
            className="logo-image"
            height={58}
            priority
            src="/images/logo.png"
            width={58}
          />
        </Link>

        <div className="header-actions">
          <Link className="icon-button desktop-icon" href="/admin/login" aria-label="Compte">
            <User aria-hidden="true" />
          </Link>
          <Link className="icon-button cart-icon" href="/cart" aria-label="Panier">
            <ShoppingBag aria-hidden="true" />
            {count > 0 ? <span className="cart-badge">{count}</span> : null}
          </Link>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="mobile-menu-head">
          <Image alt="FocusGym logo" height={48} src="/images/logo.png" width={48} />
          <button
            aria-label="Fermer le menu"
            className="icon-button"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="mobile-menu-nav" aria-label="Mobile navigation">
          {navLinks.map((link, index) => (
            <Link
              className="mobile-menu-link"
              href={link.href}
              key={link.href}
              onClick={() => setIsOpen(false)}
              style={{ transitionDelay: isOpen ? `${index * 55}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-menu-link"
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? `${navLinks.length * 55}ms` : "0ms" }}
          >
            Compte
          </Link>
        </nav>
      </div>
    </header>
  );
}
