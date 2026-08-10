"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDeliveryFee,
  formatPrice,
  governorates,
  orderSizes
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { trackPixelEvent } from "@/lib/meta-pixel";
import { useDeliveryFee } from "@/lib/use-delivery-fee";

type FormState = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  size: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  city: "Tunis",
  address: "",
  email: "",
  size: "M"
};

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const deliveryFee = useDeliveryFee();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const total = useMemo(
    () => (items.length > 0 ? subtotal + deliveryFee : 0),
    [deliveryFee, items.length, subtotal]
  );

  const hasTrackedCheckout = useRef(false);

  useEffect(() => {
    if (!hasTrackedCheckout.current && items.length > 0) {
      hasTrackedCheckout.current = true;
      trackPixelEvent("InitiateCheckout", {
        content_ids: items.map((item) => item.productId),
        num_items: items.reduce((count, item) => count + item.quantity, 0),
        value: subtotal,
        currency: "TND"
      });
    }
  }, [items, subtotal]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Impossible de valider la commande.");
      }

      setStatus("success");
      setMessage(
        "Commande confirmée. Merci pour votre commande. Nous vous contacterons rapidement pour confirmer la livraison."
      );
      trackPixelEvent("Purchase", {
        content_ids: items.map((item) => item.productId),
        content_type: "product",
        num_items: items.reduce((count, item) => count + item.quantity, 0),
        value: total,
        currency: "TND"
      });
      clearCart();
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Impossible de valider la commande.");
    }
  }

  return (
    <section className="checkout-page container">
      <div>
        <span className="section-eyebrow">Commande</span>
        <h1>Finaliser</h1>
        <p>
          Le paiement à la livraison est disponible partout en Tunisie. La
          commande sera confirmée par notre équipe.
        </p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <p className="required-note">L’email est optionnel. Les autres champs sont obligatoires.</p>
          <div className="checkout-step">
            <h2>Contact</h2>
            <div className="form-grid two-cols">
              <div className="field">
                <label htmlFor="fullName">
                  Nom complet <span aria-hidden="true">*</span>
                </label>
                <input
                  id="fullName"
                  minLength={2}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  required
                  value={form.fullName}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">
                  Téléphone <span aria-hidden="true">*</span>
                </label>
                <input
                  id="phone"
                  onChange={(event) => updateField("phone", event.target.value)}
                  required
                  type="tel"
                  value={form.phone}
                />
              </div>
              <div className="field">
                <label htmlFor="email">
                  Email <small>(optionnel)</small>
                </label>
                <input
                  id="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  type="email"
                  value={form.email}
                />
              </div>
              <div className="field">
                <label htmlFor="size">
                  Taille <span aria-hidden="true">*</span>
                </label>
                <select
                  id="size"
                  onChange={(event) => updateField("size", event.target.value)}
                  required
                  value={form.size}
                >
                  {orderSizes.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="checkout-step">
            <h2>Livraison</h2>
            <div className="form-grid two-cols">
              <div className="field">
                <label htmlFor="city">
                  Ville <span aria-hidden="true">*</span>
                </label>
                <select
                  id="city"
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                  value={form.city}
                >
                  {governorates.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="address">
                  Adresse <span aria-hidden="true">*</span>
                </label>
                <input
                  id="address"
                  onChange={(event) => updateField("address", event.target.value)}
                  required
                  value={form.address}
                />
              </div>
            </div>
          </div>

          <div className="checkout-step">
            <h2>Paiement</h2>
            <label className="payment-method">
              <input checked readOnly type="radio" />
              <span>
                <strong>Paiement à la livraison</strong>
                <small>Payez lorsque votre commande arrive.</small>
              </span>
            </label>
          </div>

          {message ? (
            <p className={status === "error" ? "form-error" : "form-success"}>{message}</p>
          ) : null}

          <button className="buy-button" disabled={status === "loading"} type="submit">
            {status === "loading" ? "Validation..." : "Valider la commande"}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Résumé</h2>
          {items.length > 0 ? (
            items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))
          ) : (
            <p>Votre panier est actuellement vide.</p>
          )}
          <div>
            <span>Sous-total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Livraison</span>
            <strong>{formatDeliveryFee(items.length > 0 ? deliveryFee : 0)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <Link className="btn-secondary" href="/cart">
            Modifier le panier
          </Link>
        </aside>
      </div>
    </section>
  );
}
