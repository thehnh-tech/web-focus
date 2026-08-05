"use client";

import { useEffect, useState } from "react";

export function useDeliveryFee() {
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/settings", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const fee = Number(data?.settings?.deliveryFee);

        if (isMounted && Number.isFinite(fee) && fee > 0) {
          setDeliveryFee(fee);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  return deliveryFee;
}
