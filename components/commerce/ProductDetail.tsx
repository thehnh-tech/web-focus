"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { fallbackProducts, formatPrice, sizes } from "@/lib/products";
import type { CartItem, Product } from "@/lib/types";
import { Accordion } from "@/components/ui/Accordion";

const accordionItems = [
  {
    title: "Description",
    content:
      "Designed for training, FOCUS compression wear delivers a close athletic fit that supports movement without distraction."
  },
  {
    title: "Materials",
    content:
      "Soft stretch performance fabric with a smooth feel and breathable construction."
  },
  {
    title: "Size & Fit",
    content:
      "Compression fit. Choose your usual size for a fitted feel, or size up for a more relaxed fit."
  },
  {
    title: "Shipping & Returns",
    content:
      "Delivery available in Tunisia. Returns and exchanges accepted according to store policy."
  },
  {
    title: "Care Instructions",
    content: "Machine wash cold. Do not bleach. Air dry recommended."
  }
];

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState<CartItem["size"]>("M");
  const [quantity, setQuantity] = useState(1);
  const [buttonText, setButtonText] = useState("Add to Cart");

  const gallery = useMemo(
    () => [product.image, product.secondaryImage].filter(Boolean) as string[],
    [product.image, product.secondaryImage]
  );

  function handleAddToCart() {
    setButtonText("Adding...");
    addToCart({ product, size: selectedSize, quantity });
    window.setTimeout(() => setButtonText("Added"), 250);
    window.setTimeout(() => setButtonText("Add to Cart"), 1200);
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
              aria-label={`View ${product.name} image`}
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
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <span>{product.color ?? "Product"}</span>
        </nav>

        <div className="product-heading-row">
          <h1>{product.name}</h1>
          <span className="product-badge">Sale</span>
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
            <span>Color</span>
            <strong>{product.color}</strong>
          </div>
          <div className="color-options">
            {fallbackProducts
              .filter((item) => item.category === "Compression Tops")
              .map((item) => (
                <Link
                  aria-label={`Select ${item.color}`}
                  className={`color-swatch ${item.color?.toLowerCase()} ${
                    item.slug === product.slug ? "active" : ""
                  }`}
                  href={`/products/${item.slug}`}
                  key={item.id}
                />
              ))}
          </div>
        </div>

        <div className="option-group">
          <div className="option-head">
            <span>Size</span>
            <Link href="/size-guide">Size Guide</Link>
          </div>
          <div className="size-options">
            {sizes.map((size) => (
              <button
                className={selectedSize === size ? "active" : ""}
                key={size}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="quantity-row">
          <span>Quantity</span>
          <div className="quantity-selector">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              type="button"
            >
              <Minus aria-hidden="true" />
            </button>
            <span>{quantity}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => value + 1)}
              type="button"
            >
              <Plus aria-hidden="true" />
            </button>
          </div>
        </div>

        <button className="buy-button" onClick={handleAddToCart} type="button">
          {buttonText}
        </button>
        <Link className="buy-now-button" href="/checkout" onClick={handleAddToCart}>
          Buy Now
        </Link>

        <Accordion items={accordionItems} />
      </div>
    </section>
  );
}
