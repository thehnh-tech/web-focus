import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Merci pour votre achat",
  description: "Votre commande FocusGym a bien été enregistrée."
};

type Props = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function MerciPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  const orderRef = ref ? String(ref).slice(0, 12).toUpperCase() : null;

  return (
    <section className="thankyou-page container">
      <div className="thankyou-card">
        <span className="thankyou-check" aria-hidden="true">
          <CheckCircle2 />
        </span>
        <h1>Merci pour votre achat !</h1>
        {orderRef ? <p className="thankyou-ref">Commande #{orderRef}</p> : null}
        <p className="thankyou-text">
          Votre commande a bien été enregistrée. Notre équipe vous contactera
          rapidement par téléphone pour confirmer la livraison.
        </p>
        <Link className="btn-primary" href="/shop">
          Retour à la boutique
        </Link>
      </div>
    </section>
  );
}
