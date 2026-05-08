"use client";

const C = {
  bg: "#f8fafc",
  surf: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
};

const card = {
  background: C.surf,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

export default function DesktopDebt() {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Debt</div>
      </div>

      <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
          No debt accounts found
        </div>
        <div style={{ fontSize: 13.5, color: C.muted, maxWidth: 400, margin: "0 auto" }}>
          Add budget categories with type <strong>DEBT PAYMENT</strong> and set a starting balance in Settings to start tracking payoff progress.
        </div>
      </div>
    </div>
  );
}
