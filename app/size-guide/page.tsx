import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide des tailles",
  description: "Guide des tailles pour les t-shirts de compression FOCUS."
};

const rows = [
  ["S", "86-94 cm", "160-170 cm", "55-65 kg"],
  ["M", "94-102 cm", "170-178 cm", "65-75 kg"],
  ["L", "102-110 cm", "178-185 cm", "75-85 kg"],
  ["XL", "110-118 cm", "185-192 cm", "85-95 kg"],
  ["XXL", "118-126 cm", "190+ cm", "95+ kg"]
];

export default function SizeGuidePage() {
  return (
    <section className="content-page container narrow">
      <div className="content-hero">
        <span className="section-eyebrow">Coupe</span>
        <h1>Guide des tailles</h1>
        <p>
          Les t-shirts de compression FOCUS sont conçus pour une coupe près du
          corps. Choisissez votre taille habituelle pour un effet compression,
          ou une taille au-dessus pour plus d’aisance.
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
      <p className="note">Ce guide est indicatif. Pour une coupe plus ample, choisissez une taille au-dessus.</p>
    </section>
  );
}
