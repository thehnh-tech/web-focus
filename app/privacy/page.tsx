import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FOCUS privacy policy."
};

const sections = [
  {
    title: "Information We Collect",
    text: "We collect the information needed to process your order, including name, phone, email, address, city and selected size."
  },
  {
    title: "How We Use Information",
    text: "We use your information to confirm orders, arrange delivery and provide customer support."
  },
  {
    title: "Cookies",
    text: "The site may use essential cookies for cart and admin session functionality."
  },
  {
    title: "Third-Party Services",
    text: "Hosting, analytics or delivery tools may process limited data needed to operate the store."
  },
  {
    title: "Contact",
    text: "For privacy questions, contact hello@focuswear.com."
  }
];

export default function PrivacyPage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
      </div>
      <div className="policy-list">
        {sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
