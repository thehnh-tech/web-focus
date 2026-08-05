"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatColor, formatDeliveryFee, formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useDeliveryFee } from "@/lib/use-delivery-fee";

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem, getItemKey } = useCart();
  const deliveryFee = useDeliveryFee();
  const total = items.length > 0 ? subtotal + deliveryFee : 0;

  if (items.length === 0) {
    return (
      <section className="cart-page container">
        <div className="cart-empty">
          <h1>Votre panier</h1>
          <p>Votre panier est actuellement vide.</p>
          <Link className="btn-primary" href="/shop">
            Continuer mes achats
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page container">
      <h1>Votre panier</h1>
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
                    {formatColor(item.color)} / {item.size}
                  </span>
                  <strong>{formatPrice(item.price)}</strong>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-selector">
                    <button
                      aria-label="Réduire la quantité"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      type="button"
                    >
                      <Minus aria-hidden="true" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Augmenter la quantité"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      type="button"
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    aria-label="Supprimer le produit"
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
          <h2>Résumé de commande</h2>
          <div>
            <span>Sous-total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Livraison</span>
            <strong>{formatDeliveryFee(deliveryFee)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <Link className="btn-primary" href="/checkout">
            Commander
          </Link>
          <p>Livraison confirmée au moment de la commande.</p>
        </aside>
      </div>
    </section>
  );
}
