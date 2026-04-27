"use client";
import { useMemo, useState } from "react";
import { useBudget } from "@/lib/budget-context";

// ── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};

// ── Style helpers ──────────────────────────────────────────────────────────
const card = {
  background: C.surf,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const btn = (v = "primary") => ({
  padding: "9px 20px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontSize: 13.5,
  fontWeight: 600 as const,
  fontFamily: "inherit",
  whiteSpace: "nowrap" as const,
  transition: "all 0.12s",
  background:
    v === "primary" ? C.accent
    : v === "danger" ? "#fef2f2"
    : v === "ghost" ? "transparent"
    : "#f1f5f9",
  color:
    v === "primary" ? "#fff"
    : v === "danger" ? C.red
    : C.muted,
});

// ── Formatters ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n));

// ── Month label helper ─────────────────────────────────────────────────────
function monthLabel(calMonth: string) {
  const [yr, mo] = calMonth.split("-").map(Number);
  return new Date(yr, mo - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarPage() {
  const { transactions, budgets } = useBudget();

  const todayObj = new Date();
  const todayDay = todayObj.getDate();
  const todayMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}`;

  const [calMonth, setCalMonth] = useState(todayMonth);

  const calData = useMemo(() => {
    const parts = calMonth.split("-").map(Number);
    const yr = parts[0];
    const mo = parts[1];
    if (!yr || !mo || mo < 1 || mo > 12 || yr < 2000 || yr > 2100) {
      return { firstDay: 0, daysInMonth: 0, txnsByDay: {}, billsByDay: {} };
    }
    const firstDay = new Date(yr, mo - 1, 1).getDay();
    const daysInMonth = new Date(yr, mo, 0).getDate();

    const txnsByDay: Record<number, { count: number; amount: number }> = {};
    transactions
      .filter((t) => t.date.startsWith(calMonth))
      .forEach((t) => {
        const d = parseInt(t.date.slice(8));
        if (!txnsByDay[d]) txnsByDay[d] = { count: 0, amount: 0 };
        if (t.type !== "INCOME") {
          txnsByDay[d].count++;
          txnsByDay[d].amount += parseFloat(t.amount);
        }
      });

    const billsByDay: Record<number, { name: string; amount: number }[]> = {};
    budgets
      .filter((b) => b.type === "BILLS" && b.dueDay)
      .forEach((b) => {
        const d = b.dueDay!;
        if (!billsByDay[d]) billsByDay[d] = [];
        billsByDay[d].push({ name: b.name, amount: parseFloat(b.budgetAmount) });
      });

    return { firstDay, daysInMonth, txnsByDay, billsByDay };
  }, [calMonth, transactions, budgets]);

  const prevMonth = () => {
    const [y, m] = calMonth.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const nextMonth = () => {
    const [y, m] = calMonth.split("-").map(Number);
    const d = new Date(y, m, 1);
    setCalMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div className="kova-mobile-only" style={{ ...card }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Calendar</div>
        <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
          Calendar is available on desktop only. Open Kova on desktop for monthly bill and transaction date review.
        </div>
      </div>

      <div className="kova-desktop-only">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Calendar</div>
      </div>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button style={{ ...btn("secondary"), padding: "7px 14px" }} onClick={prevMonth}>
          ‹
        </button>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            minWidth: 180,
            textAlign: "center",
            color: C.text,
          }}
        >
          {monthLabel(calMonth)}
        </div>
        <button style={{ ...btn("secondary"), padding: "7px 14px" }} onClick={nextMonth}>
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div style={card}>
        {/* Day-of-week header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            marginBottom: 8,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                padding: "8px 4px",
                fontSize: 11,
                fontWeight: 700,
                color: C.subtle,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}
        >
          {/* Leading empty cells */}
          {Array.from({ length: calData.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: calData.daysInMonth }, (_, i) => i + 1).map((day) => {
            const isToday = calMonth === todayMonth && day === todayDay;
            const hasTxns = calData.txnsByDay[day];
            const bills = calData.billsByDay[day] || [];

            return (
              <div
                key={day}
                style={{
                  minHeight: 80,
                  background: isToday ? "#eff6ff" : C.bg,
                  borderRadius: 8,
                  padding: "6px 8px",
                  border: `1px solid ${isToday ? C.accent : C.borderL}`,
                  position: "relative",
                }}
              >
                {/* Day number */}
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? C.accent : C.text,
                    marginBottom: 4,
                  }}
                >
                  {day}
                </div>

                {/* Bill chips */}
                {bills.map((b) => (
                  <div
                    key={b.name}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: "#e0f2fe",
                      color: "#0284c7",
                      borderRadius: 4,
                      padding: "2px 5px",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={`${b.name} — ${fmt(b.amount)}`}
                  >
                    {b.name} {fmtK(b.amount)}
                  </div>
                ))}

                {/* Transaction summary */}
                {hasTxns && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{hasTxns.count}</span>{" "}
                    txn{hasTxns.count > 1 ? "s" : ""} · {fmtK(hasTxns.amount)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {[
          { color: "#e0f2fe", text: "#0284c7", label: "Bill due" },
          { color: "#eff6ff", text: C.accent, label: "Today" },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              color: C.muted,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: l.color,
                border: `1px solid ${l.text}40`,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
