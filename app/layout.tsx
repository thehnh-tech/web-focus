import type { Metadata } from "next";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { AppProviders } from "@/components/layout/AppProviders";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "FOCUS | Compression Wear for Training",
    template: "%s | FOCUS"
  },
  description:
    "Discover FOCUS compression wear. Premium athletic tops built for training, performance and everyday focus.",
  openGraph: {
    title: "FOCUS | Compression Wear for Training",
    description:
      "Premium athletic compression tops built for training, performance and everyday focus.",
    images: ["/images/packhero.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
