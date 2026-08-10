"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { CartItem, Product } from "@/lib/types";
import { trackPixelEvent } from "@/lib/meta-pixel";

type AddToCartInput = {
  product: Product;
  size?: CartItem["size"];
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (input: AddToCartInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  getItemKey: (item: CartItem) => string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "focus-cart";

function itemKey(item: Pick<CartItem, "productId" | "size" | "color">) {
  return `${item.productId}:${item.size}:${item.color ?? "default"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [hasHydrated, items]);

  useEffect(() => {
    if (!hasHydrated || items.length === 0) {
      return;
    }

    let isMounted = true;

    fetch("/api/offers", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!isMounted || !Array.isArray(data?.offers)) {
          return;
        }

        const products = data.offers as Product[];
        const productsById = new Map(products.map((product) => [product.id, product]));
        const productsBySlug = new Map(products.map((product) => [product.slug, product]));

        setItems((currentItems) => {
          let hasChanges = false;
          const nextItems = currentItems.map((item) => {
            const product = productsById.get(item.productId) ?? productsBySlug.get(item.slug);

            if (!product) {
              return item;
            }

            const nextItem = {
              ...item,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              color: product.color
            };

            hasChanges =
              hasChanges ||
              nextItem.productId !== item.productId ||
              nextItem.slug !== item.slug ||
              nextItem.name !== item.name ||
              nextItem.price !== item.price ||
              nextItem.image !== item.image ||
              nextItem.color !== item.color;

            return nextItem;
          });

          return hasChanges ? nextItems : currentItems;
        });
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [hasHydrated, items.length]);

  const addToCart = useCallback(({ product, size = "M", quantity = 1 }: AddToCartInput) => {
    trackPixelEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price * quantity,
      currency: "TND"
    });

    setItems((currentItems) => {
      const nextItem: CartItem = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color,
        size,
        quantity
      };
      const key = itemKey(nextItem);
      const existing = currentItems.find((item) => itemKey(item) === key);

      if (existing) {
        return currentItems.map((item) =>
          itemKey(item) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...currentItems, nextItem];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => itemKey(item) !== key);
      }

      return currentItems.map((item) =>
        itemKey(item) === key ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((currentItems) => currentItems.filter((item) => itemKey(item) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return {
      items,
      count,
      subtotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      getItemKey: itemKey
    };
  }, [addToCart, clearCart, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return context;
}
