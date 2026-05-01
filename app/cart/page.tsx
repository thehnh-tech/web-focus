import type { Metadata } from "next";
import { CartView } from "@/components/commerce/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your FOCUS cart."
};

export default function CartPage() {
  return <CartView />;
}
