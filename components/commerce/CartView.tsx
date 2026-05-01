"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { DELIVERY_FEE, formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem, getItemKey } = useCart();
  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

  if (items.length === 0) {
    return (
      <section className="cart-page container">
        <div className="cart-empty">
          <h1>Your Cart</h1>
          <p>Your cart is currently empty.</p>
          <Link className="btn-primary" href="/shop">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page container">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const key = getItemKey(item);
            return (
              <article className="cart-item" key={key}>
                <Image alt={item.name} height={140} src={item.image} width={140} />
                <div className="cart-item-info">
                  <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  <span>
                    {item.color} / {item.size}
                  </span>
                  <strong>{formatPrice(item.price)}</strong>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-selector">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      type="button"
                    >
                      <Minus aria-hidden="true" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      type="button"
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    aria-label="Remove item"
                    className="remove-item"
                    onClick={() => removeItem(key)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="order-summary">
          <h2>Order Summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>{formatPrice(DELIVERY_FEE)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <Link className="btn-primary" href="/checkout">
            Checkout
          </Link>
          <p>Shipping and taxes calculated at checkout.</p>
        </aside>
      </div>
    </section>
  );
}
