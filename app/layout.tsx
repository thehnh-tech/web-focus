import type { Metadata } from "next";
import "./globals.css";
import { MetaPixelRouteTracker } from "@/components/analytics/MetaPixel";
import { META_PIXEL_ID, isPixelEnabled } from "@/lib/meta-pixel";
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

const metaPixelBootstrap = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {isPixelEnabled ? (
          <script
            dangerouslySetInnerHTML={{ __html: metaPixelBootstrap }}
            id="meta-pixel"
          />
        ) : null}
      </head>
      <body>
        {isPixelEnabled ? (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              style={{ display: "none" }}
              width="1"
            />
          </noscript>
        ) : null}
        <MetaPixelRouteTracker />
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
