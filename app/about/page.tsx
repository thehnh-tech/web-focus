import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about FOCUS performance compression wear."
};

const values = [
  {
    title: "Discipline",
    text: "Show up. Train hard. Repeat."
  },
  {
    title: "Performance",
    text: "Built for movement, intensity and comfort."
  },
  {
    title: "Focus",
    text: "No distractions. Just progress."
  }
];

export default function AboutPage() {
  return (
    <section className="content-page container">
      <div className="content-hero">
        <span className="section-eyebrow">About FOCUS</span>
        <h1>Built for Focus.</h1>
        <p>
          FOCUS is a performance wear brand created for athletes, lifters and
          everyday grinders who train with discipline.
        </p>
      </div>

      <div className="content-split">
        <div>
          <h2>Brand Statement</h2>
          <p>
            We believe training starts with discipline. Our compression wear is
            designed to keep you focused through every rep, every session and
            every goal.
          </p>
        </div>
        <div>
          <h2>Product Philosophy</h2>
          <p>Clean design. Strong fit. Performance materials. Nothing unnecessary.</p>
        </div>
      </div>

      <div className="value-grid">
        {values.map((value) => (
          <article className="value-card" key={value.title}>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
