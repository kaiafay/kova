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
    return () => {
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  return tier;
}
