import type { Metadata } from "next";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";

export const metadata: Metadata = {
  title: "Commande",
  description: "Finalisez votre commande FOCUS avec livraison en Tunisie."
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
