"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DELIVERY_FEE, formatPrice, governorates, orderSizes } from "@/lib/products";
import { useCart } from "@/lib/cart";

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
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const total = useMemo(
    () => (items.length > 0 ? subtotal + DELIVERY_FEE : 0),
    [items.length, subtotal]
  );

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
        throw new Error(data?.error || "Unable to place order.");
      }

      setStatus("success");
      setMessage(
        "Order confirmed. Thank you for your order. We will contact you shortly to confirm delivery."
      );
      clearCart();
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to place order.");
    }
  }

  return (
    <section className="checkout-page container">
      <div>
        <span className="section-eyebrow">Checkout</span>
        <h1>Place Order</h1>
        <p>
          Cash on delivery is prioritized for Tunisia. Delivery costs 7 DT and
          will be confirmed by our team.
        </p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-step">
            <h2>Contact</h2>
            <div className="form-grid two-cols">
              <div className="field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  minLength={2}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  required
                  value={form.fullName}
                />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  onChange={(event) => updateField("phone", event.target.value)}
                  required
                  type="tel"
                  value={form.phone}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                  type="email"
                  value={form.email}
                />
              </div>
              <div className="field">
                <label htmlFor="size">Size</label>
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
            <h2>Delivery</h2>
            <div className="form-grid two-cols">
              <div className="field">
                <label htmlFor="city">City</label>
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
                <label htmlFor="address">Address</label>
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
            <h2>Payment</h2>
            <label className="payment-method">
              <input checked readOnly type="radio" />
              <span>
                <strong>Cash on Delivery</strong>
                <small>Pay when your order arrives.</small>
              </span>
            </label>
          </div>

          {message ? (
            <p className={status === "error" ? "form-error" : "form-success"}>{message}</p>
          ) : null}

          <button className="buy-button" disabled={status === "loading"} type="submit">
            {status === "loading" ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Review</h2>
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
            <p>Your cart is currently empty.</p>
          )}
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>{items.length > 0 ? formatPrice(DELIVERY_FEE) : formatPrice(0)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <Link className="btn-secondary" href="/cart">
            Edit Cart
          </Link>
        </aside>
      </div>
    </section>
  );
}
