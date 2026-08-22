"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDeliveryFee,
  formatPrice,
  governorates,
  orderSizes
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { trackPixelEvent } from "@/lib/meta-pixel";
import type { AppliedPromo } from "@/lib/types";
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

// sessionStorage : le code survit à un aller-retour vers /cart mais pas à la
// fermeture de l'onglet. Le serveur revalide de toute façon à la commande.
const PROMO_STORAGE_KEY = "focus-promo";

function readStoredPromo(): AppliedPromo | null {
  try {
    const stored = window.sessionStorage.getItem(PROMO_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<AppliedPromo>;

    if (
      typeof parsed?.code !== "string" ||
      (parsed.type !== "percent" && parsed.type !== "fixed") ||
      !Number.isFinite(Number(parsed.value))
    ) {
      return null;
    }

    return {
      code: parsed.code,
      type: parsed.type,
      value: Number(parsed.value),
      minSubtotal: Number.isFinite(Number(parsed.minSubtotal))
        ? Number(parsed.minSubtotal)
        : 0
    };
  } catch {
    return null;
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const deliveryFee = useDeliveryFee();
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoHydrated, setPromoHydrated] = useState(false);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    setAppliedPromo(readStoredPromo());
    setPromoHydrated(true);
  }, []);

  useEffect(() => {
    if (!promoHydrated) {
      return;
    }

    try {
      if (appliedPromo) {
        window.sessionStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        window.sessionStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch {
      // Stockage indisponible : le code reste appliqué pour cette page.
    }
  }, [appliedPromo, promoHydrated]);

  // Arrondi au dixième (granularité des prix) pour que les comparaisons au
  // minimum d'achat correspondent au montant affiché.
  const roundedSubtotal = useMemo(() => Math.round(subtotal * 10) / 10, [subtotal]);

  // La remise est recalculée à chaque rendu à partir du type/valeur du code,
  // pour suivre le panier si son contenu change. Le serveur reste l'autorité.
  const discount = useMemo(() => {
    if (
      !appliedPromo ||
      items.length === 0 ||
      roundedSubtotal < appliedPromo.minSubtotal
    ) {
      return 0;
    }

    const raw =
      appliedPromo.type === "percent"
        ? (roundedSubtotal * appliedPromo.value) / 100
        : appliedPromo.value;

    return Math.round(Math.min(Math.max(raw, 0), roundedSubtotal) * 10) / 10;
  }, [appliedPromo, items.length, roundedSubtotal]);

  const total = useMemo(
    () =>
      items.length > 0
        ? Math.round((roundedSubtotal - discount + deliveryFee) * 10) / 10
        : 0,
    [deliveryFee, discount, items.length, roundedSubtotal]
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

  async function applyPromo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = promoInput.trim().toUpperCase();

    if (!code || isCheckingPromo) {
      return;
    }

    setIsCheckingPromo(true);
    setPromoMessage("");

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: roundedSubtotal })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.promo) {
        setAppliedPromo(null);
        setPromoMessage(data?.error || "Code promo invalide.");
        return;
      }

      setAppliedPromo(data.promo as AppliedPromo);
      setPromoInput("");
    } catch {
      setPromoMessage("Impossible de vérifier le code promo. Réessayez.");
    } finally {
      setIsCheckingPromo(false);
    }
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    // Le code n'est envoyé que s'il produit réellement une remise à l'écran :
    // un code sous le minimum d'achat ne doit pas bloquer la commande.
    const promoCodeToSend = appliedPromo && discount > 0 ? appliedPromo.code : "";

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, promoCode: promoCodeToSend })
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = String(data?.error || "Impossible de valider la commande.");

        // Code devenu invalide entre l'application et la commande (épuisé,
        // désactivé, expiré) : on le retire pour que le prochain essai passe.
        if (promoCodeToSend && /code promo/i.test(errorMessage)) {
          setAppliedPromo(null);
          setPromoMessage(errorMessage);
        }

        throw new Error(errorMessage);
      }

      trackPixelEvent("Purchase", {
        content_ids: items.map((item) => item.productId),
        content_type: "product",
        num_items: items.reduce((count, item) => count + item.quantity, 0),
        value: total,
        currency: "TND"
      });
      clearCart();
      setAppliedPromo(null);

      try {
        window.sessionStorage.removeItem(PROMO_STORAGE_KEY);
      } catch {
        // Stockage indisponible : rien à nettoyer.
      }

      const orderId = String(data?.order?.id ?? "");
      const orderRef = orderId ? orderId.slice(-6).toUpperCase() : "";
      router.push(orderRef ? `/merci?ref=${orderRef}` : "/merci");
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
                  {item.name} ({item.size}) × {item.quantity}
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))
          ) : (
            <p>Votre panier est actuellement vide.</p>
          )}
          <div className="promo-block">
            {appliedPromo ? (
              <div className="promo-applied">
                <span>
                  Code <strong>{appliedPromo.code}</strong>
                  {appliedPromo.type === "percent" ? ` (-${appliedPromo.value} %)` : ""}
                </span>
                <button className="promo-remove" onClick={removePromo} type="button">
                  Retirer
                </button>
              </div>
            ) : (
              <form className="promo-field" onSubmit={applyPromo}>
                <input
                  aria-label="Code promo"
                  disabled={isCheckingPromo}
                  onChange={(event) => setPromoInput(event.target.value)}
                  placeholder="Code promo"
                  value={promoInput}
                />
                <button
                  disabled={isCheckingPromo || items.length === 0 || !promoInput.trim()}
                  type="submit"
                >
                  {isCheckingPromo ? "..." : "Appliquer"}
                </button>
              </form>
            )}
            {promoMessage ? <p className="form-error">{promoMessage}</p> : null}
            {appliedPromo &&
            items.length > 0 &&
            roundedSubtotal < appliedPromo.minSubtotal ? (
              <p className="form-error">
                Ce code nécessite un minimum d’achat de {formatPrice(appliedPromo.minSubtotal)}
                . Il ne sera pas appliqué à la commande.
              </p>
            ) : null}
          </div>
          <div>
            <span>Sous-total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          {discount > 0 && appliedPromo ? (
            <div className="summary-discount">
              <span>Remise ({appliedPromo.code})</span>
              <strong>-{formatPrice(discount)}</strong>
            </div>
          ) : null}
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
