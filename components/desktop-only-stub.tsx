const C = { surf: "#ffffff", border: "#e2e8f0", muted: "#64748b" };

export function DesktopOnlyStub({ title, copy }: { title: string; copy: string }) {
  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div
        style={{
          background: C.surf,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 22,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{copy}</div>
      </div>
    </div>
  );
}
