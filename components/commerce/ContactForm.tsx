"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="field">
        <label htmlFor="contact-name">Nom complet</label>
        <input id="contact-name" required />
      </div>
      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" required type="email" />
      </div>
      <div className="field">
        <label htmlFor="contact-phone">Téléphone</label>
        <input id="contact-phone" required type="tel" />
      </div>
      <div className="field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" required />
      </div>
      {sent ? (
        <p className="form-success">
          Message prêt. Contactez FocusGym directement par email ou WhatsApp pour le moment.
        </p>
      ) : null}
      <button className="buy-button" type="submit">
        Envoyer
      </button>
    </form>
  );
}
