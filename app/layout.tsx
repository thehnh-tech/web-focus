import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AppProviders } from "@/components/layout/AppProviders";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "FocusGym Official Website",
    template: "%s | FocusGym"
  },
  description:
    "Découvrez FocusGym, des vêtements de compression premium pour l’entraînement, la performance et la discipline.",
  openGraph: {
    title: "FocusGym Official Website",
    description:
      "T-shirts de compression premium pour l’entraînement, la performance et la discipline.",
    images: ["/images/shooting-focus-black-offi.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProviders>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
