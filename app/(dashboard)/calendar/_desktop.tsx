"use client";
import { useEffect, useMemo, useState } from "react";
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
  background: v === "primary" ? C.accent : v === "ghost" ? "transparent" : "#f1f5f9",
  color: v === "primary" ? "#fff" : C.muted,
});

const fmt = (n: number) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n));
type DayTotals = Record<number, { count: number; amount: number }>;
type DayBills = Record<number, { name: string; amount: number }[]>;
type DayTxnItem = { id: number; name: string; category: string; amount: number; isIncome: boolean };
type DayTxns = Record<number, DayTxnItem[]>;

function monthLabel(calMonth: string) {
  const [yr, mo] = calMonth.split("-").map(Number);
  return new Date(yr, mo - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function DesktopCalendar() {
  const { transactions, budgets } = useBudget();

  const todayObj = new Date();
  const todayDay = todayObj.getDate();
  const todayMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}`;

  const [calMonth, setCalMonth] = useState(todayMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const calData = useMemo(() => {
    const parts = calMonth.split("-").map(Number);
    const yr = parts[0];
    const mo = parts[1];
    if (!yr || !mo || mo < 1 || mo > 12 || yr < 2000 || yr > 2100) {
      return {
        firstDay: 0,
        daysInMonth: 0,
        txnsByDay: {} as DayTotals,
        incomeByDay: {} as DayTotals,
        billsByDay: {} as DayBills,
        dayTransactions: {} as DayTxns,
      };
    }
    const firstDay = new Date(yr, mo - 1, 1).getDay();
    const daysInMonth = new Date(yr, mo, 0).getDate();

    const txnsByDay: DayTotals = {};
    const incomeByDay: DayTotals = {};
    const dayTransactions: DayTxns = {};
    transactions.filter(t => t.date.startsWith(calMonth)).forEach(t => {
      const d = parseInt(t.date.slice(8));
      if (!dayTransactions[d]) dayTransactions[d] = [];
      dayTransactions[d].push({
        id: t.id,
        name: t.name,
        category: t.type,
        amount: parseFloat(t.amount),
        isIncome: t.type === "INCOME",
      });
      if (!txnsByDay[d]) txnsByDay[d] = { count: 0, amount: 0 };
      if (t.type !== "INCOME") {
        txnsByDay[d].count++;
        txnsByDay[d].amount += parseFloat(t.amount);
      } else {
        if (!incomeByDay[d]) incomeByDay[d] = { count: 0, amount: 0 };
        incomeByDay[d].count++;
        incomeByDay[d].amount += parseFloat(t.amount);
      }
    });

    const billsByDay: DayBills = {};
    budgets.filter(b => b.type === "BILLS" && b.dueDay).forEach(b => {
      const d = b.dueDay!;
      if (!billsByDay[d]) billsByDay[d] = [];
      billsByDay[d].push({ name: b.name, amount: parseFloat(b.budgetAmount) });
    });

    return { firstDay, daysInMonth, txnsByDay, incomeByDay, billsByDay, dayTransactions };
  }, [calMonth, transactions, budgets]);

  useEffect(() => {
    if (selectedDay === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDay(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDay]);

  useEffect(() => {
    setSelectedDay(null);
  }, [calMonth]);

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

  const selectedBills = selectedDay ? (calData.billsByDay[selectedDay] || []) : [];
  const selectedTransactions = selectedDay ? (calData.dayTransactions[selectedDay] || []) : [];
  const selectedDateLabel = selectedDay
    ? new Date(`${calMonth}-${String(selectedDay).padStart(2, "0")}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Calendar</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button style={{ ...btn("secondary"), padding: "7px 14px" }} onClick={prevMonth}>‹</button>
        <div style={{ fontSize: 16, fontWeight: 700, minWidth: 180, textAlign: "center", color: C.text }}>{monthLabel(calMonth)}</div>
        <button style={{ ...btn("secondary"), padding: "7px 14px" }} onClick={nextMonth}>›</button>
      </div>
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 8 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ textAlign: "center", padding: "8px 4px", fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: calData.firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: calData.daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = calMonth === todayMonth && day === todayDay;
            const hasTxns = calData.txnsByDay[day];
            const hasIncome = calData.incomeByDay[day];
            const bills = calData.billsByDay[day] || [];
            const canOpenModal = bills.length > 0 || !!hasTxns || !!hasIncome;
            return (
              <div
                key={day}
                onClick={() => canOpenModal && setSelectedDay(day)}
                onKeyDown={(e) => {
                  if (!canOpenModal) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedDay(day);
                  }
                }}
                role={canOpenModal ? "button" : undefined}
                tabIndex={canOpenModal ? 0 : -1}
                style={{
                  minHeight: 80,
                  background: isToday ? "#eff6ff" : C.bg,
                  borderRadius: 8,
                  padding: "6px 8px",
                  border: `1px solid ${isToday ? C.accent : C.borderL}`,
                  position: "relative",
                  cursor: canOpenModal ? "pointer" : "default",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? C.accent : C.text, marginBottom: 4 }}>{day}</div>
                {hasIncome && (
                  <div style={{ fontSize: 10, fontWeight: 600, background: "#dcfce7", color: C.green, borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`Income — ${fmt(hasIncome.amount)}`}>
                    Income {fmtK(hasIncome.amount)}
                  </div>
                )}
                {bills.map(b => (
                  <div key={b.name} style={{ fontSize: 10, fontWeight: 600, background: "#e0f2fe", color: "#0284c7", borderRadius: 4, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${b.name} — ${fmt(b.amount)}`}>
                    {b.name} {fmtK(b.amount)}
                  </div>
                ))}
                {hasTxns && (
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{hasTxns.count}</span>{" "}txn{hasTxns.count > 1 ? "s" : ""} · {fmtK(hasTxns.amount)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {[{ color: "#e0f2fe", text: "#0284c7", label: "Bill due" }, { color: "#eff6ff", text: C.accent, label: "Today" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: C.muted }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: `1px solid ${l.text}40` }} />
            {l.label}
          </div>
        ))}
      </div>
      {selectedDay !== null && (
        <div
          onClick={() => setSelectedDay(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(680px, 100%)",
              maxHeight: "82vh",
              overflowY: "auto",
              background: C.surf,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              boxShadow: "0 12px 28px rgba(15,23,42,0.2)",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{selectedDateLabel}</div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ ...btn("ghost"), border: `1px solid ${C.border}`, padding: "6px 10px", fontSize: 12, color: C.text }}
                aria-label="Close day details"
              >
                X
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Bills due
              </div>
              {selectedBills.length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No bills due.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {selectedBills.map((b) => (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.borderL}`, borderRadius: 8, padding: "9px 10px", background: "#f8fbff" }}>
                      <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: 13.5, color: "#0284c7", fontWeight: 700 }}>{fmt(b.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Transactions
              </div>
              {selectedTransactions.length === 0 ? (
                <div style={{ fontSize: 13, color: C.muted }}>No transactions.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {selectedTransactions.map((t) => (
                    <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, border: `1px solid ${C.borderL}`, borderRadius: 8, padding: "9px 10px", background: C.bg }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.category}</div>
                      </div>
                      <div style={{ fontSize: 13.5, color: t.isIncome ? C.green : C.text, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {t.isIncome ? "+" : "-"}{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
