"use client";

import { CartProvider } from "@/lib/cart";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
