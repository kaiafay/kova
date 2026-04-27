"use client";
import { useEffect } from "react";

export default function OnboardingError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 40,
        maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Something went wrong</div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
          An unexpected error occurred. Reload the page or try again.
        </div>
        <button
          onClick={() => unstable_retry()}
          style={{
            padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none",
            borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
