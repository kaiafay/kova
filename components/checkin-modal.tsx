"use client";

import { useState } from "react";

const C = { bg:"#f8fafc", surf:"#ffffff", border:"#e2e8f0", borderL:"#f1f5f9", text:"#0f172a", muted:"#64748b", subtle:"#94a3b8", green:"#16a34a", red:"#dc2626", accent:"#2563eb", amber:"#d97706" };
const fmt = (n: number) => `$${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

interface Bill {
  name: string;
  amount: number;
  dueDay: number;
  diffDays: number;
  isPaid: boolean;
}

interface WeeklyData {
  weekSpend: number;
  weekDebt: number;
  weeklyPace: number;
  topCat: [string, number] | undefined;
  weekTxns: number;
}

interface CheckinModalProps {
  weeklyData: WeeklyData;
  dueSoon: Bill[];
  onDismiss: (notes: string, save: boolean) => void;
  onClose: () => void;
}

export function CheckinModal({ weeklyData, dueSoon, onDismiss, onClose }: CheckinModalProps) {
  const [weeklyNotes, setWeeklyNotes] = useState("");

  const inp = { background: C.surf, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%", boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit" };
  const btn = (v = "primary") => ({
    padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600 as const, fontFamily: "inherit", whiteSpace: "nowrap" as const, transition: "all 0.12s",
    background: v === "primary" ? C.accent : v === "ghost" ? "transparent" : "#f1f5f9",
    color: v === "primary" ? "#fff" : C.muted,
  });

  const ordinal = (n: number) => n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surf, borderRadius: 16, padding: 32, maxWidth: 560, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>Kova Check-in</div>
            <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Here&apos;s your weekly recap from Kova.</div>
          </div>
          <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 18, color: C.subtle }} onClick={onClose}>✕</button>
        </div>

        {/* AI Summary stub */}
        <div style={{ background: "linear-gradient(135deg,#eff6ff,#f0fdf4)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none" style={{ display: "inline", verticalAlign: "middle" }}>
              <polygon points="24,4 36,16 24,22 12,16" fill={C.accent} opacity="0.9"/>
              <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
              <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
              <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
            </svg>
            Kova
            <span style={{ marginLeft: "auto", fontSize: 10, color: C.subtle, fontWeight: 500, background: "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>AI coming soon</span>
          </div>
          <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6 }}>
            {weeklyData.weekSpend > weeklyData.weeklyPace
              ? `You spent ${fmt(weeklyData.weekSpend)} this week — about ${fmt(weeklyData.weekSpend - weeklyData.weeklyPace)} over your weekly pace.`
              : `You spent ${fmt(weeklyData.weekSpend)} this week — ${fmt(weeklyData.weeklyPace - weeklyData.weekSpend)} under your weekly pace.`}
            {weeklyData.topCat && ` Your biggest category was ${weeklyData.topCat[0]} at ${fmt(weeklyData.topCat[1])}.`}
            {weeklyData.weekDebt > 0 && ` You put ${fmt(weeklyData.weekDebt)} toward debt this week — keep it up.`}
            <span style={{ display: "block", marginTop: 6, fontSize: 12, color: C.subtle }}>Kova will generate personalized insights here once the Claude API is connected.</span>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Spent this week", val: fmt(weeklyData.weekSpend), sub: `Pace: ${fmt(weeklyData.weeklyPace)}/wk`, ok: weeklyData.weekSpend <= weeklyData.weeklyPace },
            { label: "Debt paid", val: fmt(weeklyData.weekDebt), sub: "This week", ok: weeklyData.weekDebt > 0 },
            { label: "Transactions", val: String(weeklyData.weekTxns), sub: "This week", ok: true },
          ].map(s => (
            <div key={s.label} style={{ background: C.bg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.4, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.ok ? C.green : C.red }}>{s.val}</div>
              <div style={{ fontSize: 11, color: C.subtle, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Upcoming bills */}
        {dueSoon.filter(b => b.diffDays >= 0 && b.diffDays <= 7).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 8 }}>Coming up this week</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {dueSoon.filter(b => b.diffDays >= 0 && b.diffDays <= 7).map(b => (
                <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, borderRadius: 7, padding: "8px 12px", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{b.name}</span>
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.subtle }}>Due the {b.dueDay}{ordinal(b.dueDay)}</span>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{fmt(b.amount)}</span>
                    {b.isPaid && <span style={{ fontSize: 10, fontWeight: 700, background: "#dcfce7", color: C.green, padding: "2px 7px", borderRadius: 20 }}>Paid</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 8 }}>Notes from this week</div>
          <textarea style={{ ...inp, height: 72, resize: "vertical", lineHeight: 1.5 }} placeholder="Anything worth remembering about this week's spending?" value={weeklyNotes} onChange={e => setWeeklyNotes(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={btn("secondary")} onClick={() => onDismiss(weeklyNotes, true)}>Save &amp; Close</button>
          <button style={btn()} onClick={() => onDismiss(weeklyNotes, false)}>Done</button>
        </div>
      </div>
    </div>
  );
}
