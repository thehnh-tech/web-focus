import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide des tailles",
  description: "Guide détaillé pour les t-shirts de compression FocusGym."
};

const rows = [
  ["S", "86-94 cm", "160-170 cm", "55-65 kg"],
  ["M", "94-102 cm", "170-178 cm", "65-75 kg"],
  ["L", "102-110 cm", "178-185 cm", "75-85 kg"]
];

export default function SizeGuidePage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Coupe</span>
        <h1>Guide des tailles</h1>
        <p>
          Les t-shirts de compression FocusGym sont conçus pour une coupe près
          du corps. Choisissez entre S, M et L selon votre tour de poitrine,
          votre taille corporelle et votre poids.
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Taille</th>
              <th>Poitrine</th>
              <th>Taille corporelle</th>
              <th>Poids</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="policy-list size-notes">
        <article>
          <h2>Guide détaillé</h2>
          <p>
            Si vous êtes entre deux tailles, choisissez la taille supérieure
            pour plus d’aisance et la taille inférieure pour un maintien plus
            compressif.
          </p>
        </article>
        <article>
          <h2>Coupe</h2>
          <p>
            La coupe est ajustée au torse et aux bras pour rester stable pendant
            les séances intenses.
          </p>
        </article>
      </div>
      <p className="note">Ce guide est indicatif. Les tailles disponibles sont S, M et L.</p>
    </section>
  );
}
