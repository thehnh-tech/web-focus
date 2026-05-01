"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, User, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
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
          aria-label="Open menu"
          className="icon-button mobile-menu-trigger"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <Menu aria-hidden="true" />
        </button>

        <Link className="logo-link" href="/" aria-label="FOCUS home">
          <Image
            alt="FOCUS logo"
            className="logo-image"
            height={58}
            priority
            src="/images/logo.png"
            width={58}
          />
        </Link>

        <div className="header-actions">
          <button className="icon-button desktop-icon" aria-label="Search" type="button">
            <Search aria-hidden="true" />
          </button>
          <Link className="icon-button desktop-icon" href="/admin/login" aria-label="Account">
            <User aria-hidden="true" />
          </Link>
          <Link className="icon-button cart-icon" href="/cart" aria-label="Cart">
            <ShoppingBag aria-hidden="true" />
            {count > 0 ? <span className="cart-badge">{count}</span> : null}
          </Link>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="mobile-menu-head">
          <Image alt="FOCUS logo" height={48} src="/images/logo.png" width={48} />
          <button
            aria-label="Close menu"
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
            href="/contact"
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? "220ms" : "0ms" }}
          >
            Contact
          </Link>
          <Link
            className="mobile-menu-link"
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            style={{ transitionDelay: isOpen ? "275ms" : "0ms" }}
          >
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}
