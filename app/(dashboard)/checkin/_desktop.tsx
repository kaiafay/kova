"use client";
import { useState } from "react";
import { useBudget } from "@/lib/budget-context";

const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};
const card = { background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const btn = (v = "primary") => ({
  padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 600 as const, fontFamily: "inherit",
  whiteSpace: "nowrap" as const, transition: "all 0.12s",
  background: v === "primary" ? C.accent : v === "danger" ? "#fef2f2" : v === "ghost" ? "transparent" : "#f1f5f9",
  color: v === "primary" ? "#fff" : v === "danger" ? C.red : C.muted,
});

const fmt = (n: string | null | undefined) =>
  n ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function GemIcon({ size = 28, accent = C.accent }: { size?: number; accent?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 36,16 24,22 12,16" fill={accent} opacity="0.9" />
      <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75" />
      <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85" />
      <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6" />
      <line x1="24" y1="4" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.9" />
    </svg>
  );
}
function GemIconWhite({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 36,16 24,22 12,16" fill="white" opacity="0.95" />
      <polygon points="24,22 36,16 38,32 24,44" fill="white" opacity="0.7" />
      <polygon points="24,22 12,16 10,32 24,44" fill="white" opacity="0.85" />
      <polygon points="24,44 10,32 38,32" fill="white" opacity="0.55" />
    </svg>
  );
}
function GemIconGray({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 36,16 24,22 12,16" fill={C.border} opacity="0.9" />
      <polygon points="24,22 36,16 38,32 24,44" fill={C.border} opacity="0.75" />
      <polygon points="24,22 12,16 10,32 24,44" fill={C.border} opacity="0.85" />
      <polygon points="24,44 10,32 38,32" fill={C.border} opacity="0.6" />
    </svg>
  );
}

export default function DesktopCheckin() {
  const { checkins, settings, deleteCheckin } = useBudget();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const todayObj = new Date();
  const todayDOW = todayObj.getDay();
  const checkinDay = settings.checkinDay;

  const nextScheduled = (() => {
    const d = new Date(todayObj);
    const daysUntil = ((checkinDay - d.getDay() + 7) % 7) || 7;
    d.setDate(d.getDate() + daysUntil);
    return d;
  })();

  const daysUntilNext = Math.ceil((nextScheduled.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
  const isScheduledToday = todayDOW === checkinDay;

  const openCheckin = () => window.dispatchEvent(new CustomEvent("kova:open-checkin"));

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>Check-in</div>

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "#eff6ff", borderRadius: 12, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <GemIcon size={28} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                {isScheduledToday ? "Check-in available today" : `Next check-in: ${nextScheduled.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {isScheduledToday ? "Your Kova check-in is scheduled for today." : `In ${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"} — auto-opens on ${DAYS[checkinDay]}s`}
              </div>
            </div>
          </div>
          <button style={{ ...btn(), display: "flex", alignItems: "center", gap: 8 }} onClick={openCheckin}>
            <GemIconWhite size={14} />
            Start now
          </button>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 16, padding: "14px 18px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: C.muted }}>
          <span style={{ fontWeight: 600, color: C.text }}>Scheduled day: </span>{DAYS[checkinDay]}s
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS_SHORT.map((d, i) => (
            <div key={d} style={{ width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: i === checkinDay ? 700 : 500, background: i === checkinDay ? "#eff6ff" : C.bg, color: i === checkinDay ? C.accent : C.subtle, border: `1px solid ${i === checkinDay ? C.accent + "60" : C.borderL}` }}>{d[0]}</div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.subtle }}>Change in Settings → Check-in Day</div>
      </div>

      {deleteError && (
        <div style={{ marginBottom: 12, padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{deleteError}</div>
      )}

      <div style={card}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>
          Past check-ins
          {checkins.length > 0 && <span style={{ marginLeft: 8, background: "#eff6ff", color: C.accent, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700, textTransform: "none" }}>{checkins.length}</span>}
        </div>
        {checkins.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.subtle }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><GemIconGray size={36} /></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.muted, marginBottom: 4 }}>No check-ins yet</div>
            <div style={{ fontSize: 13 }}>Complete your first check-in to see your history here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checkins.map(ci => (
              <div key={ci.id} style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: ci.notes ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, flexShrink: 0 }}>
                      {new Date(ci.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, background: "#eff6ff", color: C.accent, borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>Spent {fmt(ci.weekSpend)}</span>
                      {ci.weekDebt && parseFloat(ci.weekDebt) > 0 && <span style={{ fontSize: 12, background: "#dcfce7", color: C.green, borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>Debt {fmt(ci.weekDebt)}</span>}
                      {ci.topCatName && <span style={{ fontSize: 12, background: C.borderL, color: C.muted, borderRadius: 20, padding: "2px 9px", fontWeight: 500 }}>Top: {ci.topCatName}{ci.topCatAmount && parseFloat(ci.topCatAmount) > 0 ? ` · ${fmt(ci.topCatAmount)}` : ""}</span>}
                    </div>
                  </div>
                  <button style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12, color: C.subtle, flexShrink: 0, marginLeft: 8 }}
                    onClick={async () => { setDeleteError(null); try { await deleteCheckin(ci.id); } catch { setDeleteError("Failed to delete check-in. Please try again."); } }}
                    title="Delete this check-in">✕</button>
                </div>
                {ci.notes && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, borderTop: `1px solid ${C.borderL}`, paddingTop: 8, marginTop: 2 }}>{ci.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
