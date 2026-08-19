"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { trackPixelEvent } from "@/lib/meta-pixel";
import { formatColor, formatPrice } from "@/lib/products";
import {
  ALL_SIZES,
  availableSizes,
  defaultAvailableSize,
  isProductSoldOut,
  isSizeSoldOut
} from "@/lib/sizes";
import type { CartItem, Product } from "@/lib/types";
import { Accordion } from "@/components/ui/Accordion";

const accordionItems = [
  {
    title: "Description",
    content:
      "Pensé pour l’entraînement, FocusGym offre une coupe près du corps qui accompagne le mouvement sans distraction."
  },
  {
    title: "Matières",
    content:
      "80% Polyamide et 20% Elastane. Tissu extensible et doux, avec une construction respirante adaptée à l’effort."
  },
  {
    title: "Taille & coupe",
    content:
      "Coupe compression. Choisissez votre taille habituelle pour un maintien ajusté, ou une taille au-dessus pour plus d’aisance."
  },
  {
    title: "Livraison & retours",
    content:
      "Livraison disponible en Tunisie. Retours et échanges selon la politique de la boutique."
  },
  {
    title: "Entretien",
    content:
      "Conseils d’entretien : séchage en machine à basse température. Ne pas repasser. Ne pas utiliser d’adoucissant. Ne pas nettoyer à sec."
  }
];

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const soldOut = isProductSoldOut(product);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState<CartItem["size"]>(
    () => defaultAvailableSize(product) ?? "M"
  );
  const [quantity, setQuantity] = useState(1);
  const [buttonText, setButtonText] = useState("Ajouter au panier");

  const gallery = useMemo(
    () => [product.image, product.secondaryImage].filter(Boolean) as string[],
    [product.image, product.secondaryImage]
  );

  useEffect(() => {
    trackPixelEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "TND"
    });
  }, [product.id, product.name, product.price]);

  function handleAddToCart() {
    if (soldOut || isSizeSoldOut(product, selectedSize)) {
      return;
    }

    setButtonText("Ajout...");
    addToCart({ product, size: selectedSize, quantity });
    window.setTimeout(() => setButtonText("Ajouté"), 250);
    window.setTimeout(() => setButtonText("Ajouter au panier"), 1200);
  }

  return (
    <section className="product-page container">
      <div className="product-gallery">
        <div className="product-gallery-main">
          <Image
            alt={product.alt}
            height={900}
            priority
            src={selectedImage}
            width={900}
          />
        </div>
        <div className="product-thumbnails">
          {gallery.map((image) => (
            <button
              aria-label={`Voir l’image ${product.name}`}
              className={selectedImage === image ? "active" : ""}
              key={image}
              onClick={() => setSelectedImage(image)}
              type="button"
            >
              <Image alt={product.alt} height={180} src={image} width={180} />
            </button>
          ))}
        </div>
      </div>

      <div className="product-buybox">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/shop">Boutique</Link>
          <span>/</span>
          <span>{formatColor(product.color) || "Produit"}</span>
        </nav>

        <div className="product-heading-row">
          <h1>{product.name}</h1>
          <span className="product-badge">Promo</span>
        </div>

        <div className="product-detail-price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.oldPrice ? (
            <span className="price-old">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </div>

        <p className="product-description">{product.description}</p>

        <div className="option-group">
          <div className="option-head">
            <span>Taille</span>
            {availableSizes(product).length < ALL_SIZES.length && !soldOut ? (
              <span className="size-soldout-note">Tailles barrées : en rupture</span>
            ) : null}
          </div>
          <div className="size-options">
            {ALL_SIZES.map((size) => {
              const sizeSoldOut = isSizeSoldOut(product, size);
              return (
                <button
                  aria-disabled={sizeSoldOut}
                  aria-label={sizeSoldOut ? `Taille ${size} en rupture de stock` : `Taille ${size}`}
                  className={
                    sizeSoldOut ? "size-sold-out" : selectedSize === size ? "active" : ""
                  }
                  disabled={sizeSoldOut}
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  type="button"
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="quantity-row">
          <span>Quantité</span>
          <div className="quantity-selector">
            <button
              aria-label="Réduire la quantité"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              type="button"
            >
              <Minus aria-hidden="true" />
            </button>
            <span>{quantity}</span>
            <button
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity((value) => value + 1)}
              type="button"
            >
              <Plus aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          className="buy-button"
          disabled={soldOut}
          onClick={handleAddToCart}
          type="button"
        >
          {soldOut ? "Épuisé" : buttonText}
        </button>
        {soldOut ? null : (
          <Link className="buy-now-button" href="/checkout" onClick={handleAddToCart}>
            Acheter maintenant
          </Link>
        )}

        <Accordion items={accordionItems} />
      </div>
    </section>
  );
}
