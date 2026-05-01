import type { Metadata } from "next";
import { CartView } from "@/components/commerce/CartView";

export const metadata: Metadata = {
  title: "Panier",
  description: "Consultez votre panier FOCUS."
};

export default function CartPage() {
  return <CartView />;
}
