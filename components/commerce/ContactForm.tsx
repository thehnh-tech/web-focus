"use client";

import { useState } from "react";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  message: ""
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Impossible d’envoyer le message.");
      }

      setStatus("success");
      setMessage("Message envoyé. Nous vous répondrons rapidement.");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Impossible d’envoyer le message.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="contact-name">Nom complet</label>
        <input
          id="contact-name"
          minLength={2}
          onChange={(event) => updateField("fullName", event.target.value)}
          required
          value={form.fullName}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          onChange={(event) => updateField("email", event.target.value)}
          required
          type="email"
          value={form.email}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-phone">Téléphone</label>
        <input
          id="contact-phone"
          onChange={(event) => updateField("phone", event.target.value)}
          required
          type="tel"
          value={form.phone}
        />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          minLength={8}
          onChange={(event) => updateField("message", event.target.value)}
          required
          value={form.message}
        />
      </div>
      {message ? (
        <p className={status === "error" ? "form-error" : "form-success"}>{message}</p>
      ) : null}
      <button className="buy-button" disabled={status === "loading"} type="submit">
        {status === "loading" ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
