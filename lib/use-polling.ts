"use client";

import { useEffect, useRef } from "react";

export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState === "visible") {
        try {
          await savedCallback.current();
        } catch (err) {
          console.error("[usePolling] callback error:", err);
        }
      }
    };

    const id = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);
}
