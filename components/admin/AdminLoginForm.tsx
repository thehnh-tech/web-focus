"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data?.authenticated) {
          router.push("/admin");
        }
      })
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, remember })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Connexion impossible.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <section className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <span className="section-eyebrow">Admin</span>
        <h1>FOCUS Admin</h1>
        <div className="field">
          <label htmlFor="admin-username">Identifiant</label>
          <input
            autoComplete="username"
            id="admin-username"
            onChange={(event) => setUsername(event.target.value)}
            required
            value={username}
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Mot de passe</label>
          <input
            autoComplete="current-password"
            id="admin-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <label className="admin-checkbox">
          <input
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            type="checkbox"
          />
          Garder la session active 30 jours
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="buy-button" disabled={isLoading} type="submit">
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
