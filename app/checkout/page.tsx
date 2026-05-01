import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place your FOCUS order with delivery in Tunisia."
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
