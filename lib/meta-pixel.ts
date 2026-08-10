export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1529176291846150";

// Actif uniquement en production pour ne pas polluer les statistiques
// publicitaires avec les visites de développement.
export const isPixelEnabled =
  process.env.NODE_ENV === "production" && Boolean(META_PIXEL_ID);

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPixelEvent(event: string, data?: Record<string, unknown>) {
  if (!isPixelEnabled || typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  if (data) {
    window.fbq("track", event, data);
  } else {
    window.fbq("track", event);
  }
}

export function trackPageView() {
  trackPixelEvent("PageView");
}
