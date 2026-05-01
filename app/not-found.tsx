import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found-page container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <div>
        <Link className="btn-primary" href="/">
          Back Home
        </Link>
        <Link className="btn-secondary" href="/shop">
          Shop Products
        </Link>
      </div>
    </section>
  );
}
