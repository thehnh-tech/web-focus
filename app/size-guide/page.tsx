import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "FOCUS compression tops size guide."
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
        <span className="section-eyebrow">Fit</span>
        <h1>Size Guide</h1>
        <p>
          FOCUS compression tops are designed for a close athletic fit. Choose
          your usual size for compression. Size up for a more relaxed feel.
        </p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest</th>
              <th>Height</th>
              <th>Weight</th>
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
      <p className="note">This guide is approximate. For a looser fit, choose one size up.</p>
    </section>
  );
}
