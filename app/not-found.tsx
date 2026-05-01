import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page container">
      <h1>404</h1>
      <h2>Page introuvable</h2>
      <p>La page que vous cherchez n’existe pas.</p>
      <div>
        <Link className="btn-primary" href="/">
          Accueil
        </Link>
        <Link className="btn-secondary" href="/shop">
          Voir la boutique
        </Link>
      </div>
    </section>
  );
}
