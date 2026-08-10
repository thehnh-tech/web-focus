"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/meta-pixel";

// Le snippet de base (injecté en HTML brut dans app/layout.tsx) ne suit que le
// premier chargement ; les navigations côté client de l'App Router doivent
// re-déclencher PageView manuellement.
export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackPageView();
  }, [pathname]);

  return null;
}
