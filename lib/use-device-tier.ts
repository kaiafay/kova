"use client";
import { useEffect, useState } from "react";
import { MOBILE_MAX, TABLET_MAX } from "./breakpoints";

export type DeviceTier = "mobile" | "tablet" | "desktop";

export function useDeviceTier(): DeviceTier | null {
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(() => {
    const mqMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const mqTablet = window.matchMedia(`(max-width: ${TABLET_MAX}px)`);

    const update = () => {
      if (mqMobile.matches) setTier("mobile");
      else if (mqTablet.matches) setTier("tablet");
      else setTier("desktop");
    };

    update();
    mqMobile.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    // `matchMedia('change')` only runs when a query’s truth value flips. Moving a
    // window between monitors without resizing keeps the same innerWidth, so
    // nothing fires — that’s expected. Resize/visualViewport still matter when
    // the user drags window edges, zooms, or undocks DevTools.
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  return tier;
}
