"use client";
import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";
import { useBudget } from "@/lib/budget-context";

// ── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};

// ── Style helpers ──────────────────────────────────────────────────────────
const card = {
  background: C.surf, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const inp = {
  background: C.surf, border: `1px solid ${C.border}`, color: C.text,
  padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%",
  boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit",
};
const th = {
  textAlign: "left" as const, padding: "8px 12px", color: C.subtle,
  fontSize: 11, fontWeight: 700 as const, textTransform: "uppercase" as const,
  letterSpacing: 0.5, borderBottom: `1px solid ${C.borderL}`,
};
const td = {
  padding: "9px 12px", borderBottom: `1px solid ${C.borderL}`,
  color: C.text, verticalAlign: "middle" as const,
};
const badge = (type: string) => ({
  display: "inline-block", padding: "2px 9px", borderRadius: 20,
  fontSize: 11, fontWeight: 700 as const,
  background: TYPE_META[type]?.bg || "#f1f5f9",
  color: TYPE_META[type]?.color || C.muted,
});

// ── Constants ──────────────────────────────────────────────────────────────
const TYPES = ["INCOME", "BILLS", "EXPENSES", "DEBT PAYMENT", "SUBSCRIPTIONS"];
const TYPE_META: Record<string, { color: string; bg: string; label: string }> = {
  "INCOME":        { color: "#16a34a", bg: "#dcfce7", label: "Income" },
  "BILLS":         { color: "#0284c7", bg: "#e0f2fe", label: "Bills" },
  "EXPENSES":      { color: "#7c3aed", bg: "#ede9fe", label: "Expenses" },
  "DEBT PAYMENT":  { color: "#dc2626", bg: "#fee2e2", label: "Debt" },
  "SUBSCRIPTIONS": { color: "#d97706", bg: "#fef3c7", label: "Subscriptions" },
};
const DONUT_COLORS = [
  "#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6",
  "#06b6d4","#84cc16","#f97316","#ec4899","#14b8a6","#a855f7",
  "#3b82f6","#22c55e","#eab308",
];
const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);

// ── Today helpers ──────────────────────────────────────────────────────────
const todayObj = new Date();
const todayStr = todayObj.toISOString().slice(0, 10);
const todayDay = todayObj.getDate();
const todayMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}`;

// ── Custom recharts tooltip ────────────────────────────────────────────────
const CT = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    }}>
      {label && (
        <div style={{ color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{
          color: p.color || "#374151", display: "flex", gap: 12, justifyContent: "space-between",
        }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────
const sectionHead = (type: string) => (
  <div style={{
    fontSize: 12, fontWeight: 700, color: TYPE_META[type].color,
    textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 12,
    display: "flex", alignItems: "center", gap: 6, paddingBottom: 10,
    borderBottom: `2px solid ${TYPE_META[type].bg}`,
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: TYPE_META[type].color, display: "inline-block",
    }} />
    {TYPE_META[type].label}
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { transactions, budgets, settings, filterMonth, setFilterMonth, saveSettings } = useBudget();
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  // Build budgetMap from array
  const budgetMap = useMemo(() => {
    const m: Record<string, {
      budget: number; type: string; dueDay: number | null; startingBalance: number | null;
    }> = {};
    budgets.forEach(b => {
      m[b.name] = {
        budget: parseFloat(b.budgetAmount),
        type: b.type,
        dueDay: b.dueDay,
        startingBalance: b.startingBalance ? parseFloat(b.startingBalance) : null,
      };
    });
    return m;
  }, [budgets]);

  // Months available across all transactions
  const months = useMemo(
    () => [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse(),
    [transactions],
  );

  // Transactions for the selected month
  const monthTxns = useMemo(
    () => transactions.filter(t => t.date.startsWith(filterMonth)),
    [transactions, filterMonth],
  );

  // KPI stats
  const stats = useMemo(() => {
    const inc = monthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
    const out = monthTxns.filter(t => t.type !== "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
    const bud = Object.values(budgetMap).filter(b => b.type !== "INCOME").reduce((s, b) => s + b.budget, 0);
    return { inc, out, bud, left: bud - out, net: inc - out };
  }, [monthTxns, budgetMap]);

  // Category totals (spend only)
  const catTotals = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxns.filter(t => t.type !== "INCOME").forEach(t => {
      m[t.name] = (m[t.name] || 0) + parseFloat(t.amount);
    });
    return m;
  }, [monthTxns]);

  // Donut chart data — sorted descending
  const donutData = useMemo(
    () => Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    [catTotals],
  );

  // Budget vs Actual by type
  const bva = useMemo(() => {
    const g: Record<string, { budget: number; actual: number }> = {};
    Object.entries(budgetMap).filter(([, v]) => v.type !== "INCOME").forEach(([n, v]) => {
      if (!g[v.type]) g[v.type] = { budget: 0, actual: 0 };
      g[v.type].budget += v.budget;
      g[v.type].actual += catTotals[n] || 0;
    });
    return Object.entries(g).map(([k, v]) => ({
      name: k === "DEBT PAYMENT" ? "Debt" : k,
      budget: Math.round(v.budget),
      actual: Math.round(v.actual),
    }));
  }, [budgetMap, catTotals]);

  // Balance trend line — starts at settings.startingBalance
  interface TrendLinePoint { day: number; balance: number }
  const trendLine = useMemo((): TrendLinePoint[] => {
    const sorted = [...monthTxns].sort((a, b) => a.date.localeCompare(b.date));
    let bal = settings.startingBalance ?? 0;
    const pts: TrendLinePoint[] = [];
    sorted.forEach(t => {
      if (t.type === "INCOME") bal += parseFloat(t.amount);
      else bal -= parseFloat(t.amount);
      const day = parseInt(t.date.slice(8), 10);
      const ex = pts.find(p => p.day === day);
      if (ex) ex.balance = Math.round(bal * 100) / 100;
      else pts.push({ day, balance: Math.round(bal * 100) / 100 });
    });
    return pts;
  }, [monthTxns, settings.startingBalance]);

  // Group budgets by type for category tables
  const typeGroups = useMemo(() => {
    const g: Record<string, { name: string; budget: number; actual: number }[]> = {};
    TYPES.forEach(type => {
      g[type] = Object.entries(budgetMap)
        .filter(([, v]) => v.type === type)
        .map(([name, v]) => ({
          name,
          budget: v.budget,
          actual: monthTxns.filter(tx => tx.name === name).reduce((s, tx) => s + parseFloat(tx.amount), 0),
        }));
    });
    return g;
  }, [budgetMap, monthTxns]);

  // Bills due soon: -3 to +10 days of today
  const dueSoon = useMemo(() => {
    const results: { name: string; amount: number; dueDay: number; diffDays: number; isPaid: boolean }[] = [];
    const year = todayObj.getFullYear();
    const month = todayObj.getMonth();
    Object.entries(budgetMap)
      .filter(([, v]) => v.type === "BILLS" && v.dueDay)
      .forEach(([name, v]) => {
        const dueDate = new Date(year, month, v.dueDay!);
        const diffDays = Math.ceil((dueDate.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));
        const paidThisMonth = transactions
          .filter(t => t.name === name && t.date.startsWith(todayMonth))
          .reduce((s, t) => s + parseFloat(t.amount), 0);
        const isPaid = paidThisMonth >= v.budget * 0.9;
        if (diffDays >= -3 && diffDays <= 10) {
          results.push({ name, amount: v.budget, dueDay: v.dueDay!, diffDays, isPaid });
        }
      });
    return results.sort((a, b) => a.diffDays - b.diffDays);
  }, [budgetMap, transactions]);

  // Debt payoff stats
  const debtStats = useMemo(() => {
    return Object.entries(budgetMap)
      .filter(([, v]) => v.type === "DEBT PAYMENT" && v.startingBalance)
      .map(([name, v]) => {
        const totalPaid = transactions
          .filter(t => t.name === name && t.type === "DEBT PAYMENT")
          .reduce((s, t) => s + parseFloat(t.amount), 0);
        const remaining = Math.max(0, v.startingBalance! - totalPaid);
        const pct = Math.min(100, Math.round((totalPaid / v.startingBalance!) * 100));
        const monthlyPaid = monthTxns.filter(t => t.name === name).reduce((s, t) => s + parseFloat(t.amount), 0);
        return { name, startingBalance: v.startingBalance!, totalPaid, remaining, pct, monthlyPaid };
      });
  }, [budgetMap, transactions, monthTxns]);

  // Monthly notes — use draft if editing, else fall back to saved
  const notesValue = notesDraft !== null ? notesDraft : (settings.monthlyNotes[filterMonth] || "");

  const handleNotesSave = async () => {
    if (notesDraft === null) return;
    const updated = { ...settings.monthlyNotes, [filterMonth]: notesDraft };
    await saveSettings({ monthlyNotes: updated });
    setNotesDraft(null);
  };

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div className="kova-mobile-only">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Overview</div>
          <select
            style={{
              background: C.surf, border: `1px solid ${C.border}`, color: C.text,
              padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="kova-overview-kpi-grid" style={{ gap: 12, marginBottom: 14 }}>
          {[
            { label: "Money In",      val: stats.inc,  pos: null },
            { label: "Money Out",     val: stats.out,  pos: null },
            { label: "Total Budget",  val: stats.bud,  pos: null },
            { label: "Left to Spend", val: stats.left, pos: stats.left >= 0 },
            { label: "Net Savings",   val: stats.net,  pos: stats.net >= 0 },
          ].map(k => (
            <div key={k.label} style={card}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.muted,
                textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
              }}>
                {k.label}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 800, letterSpacing: -0.5,
                color: k.pos === null ? C.text : k.pos ? C.green : C.red,
              }}>
                {fmt(k.val)}
              </div>
            </div>
          ))}
        </div>

        {dueSoon.length > 0 && (
          <div style={{ ...card, marginBottom: 14, padding: "14px 16px" }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10,
            }}>
              Bills Due Soon
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dueSoon.map(b => {
                const color = b.isPaid
                  ? C.green
                  : b.diffDays < 0
                    ? C.red
                    : b.diffDays <= 3
                      ? C.amber
                      : C.accent;
                const bg = b.isPaid
                  ? "#dcfce7"
                  : b.diffDays < 0
                    ? "#fee2e2"
                    : b.diffDays <= 3
                      ? "#fef3c7"
                      : "#eff6ff";
                const label = b.isPaid
                  ? "Paid"
                  : b.diffDays < 0
                    ? `${Math.abs(b.diffDays)}d overdue`
                    : b.diffDays === 0
                      ? "Due today"
                      : `Due in ${b.diffDays}d`;

                return (
                  <div
                    key={b.name}
                    style={{
                      background: bg,
                      border: `1px solid ${color}30`,
                      borderRadius: 8,
                      padding: "8px 10px",
                      minWidth: 120,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{fmt(b.amount)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
          }}>
            Money Out by Category
          </div>
          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={76} dataKey="value" paddingAngle={2}>
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CT />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Desktop has the full budget workflow</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            Open Kova on desktop to review category tables, debt payoff details, trends, calendar, and check-ins.
          </div>
        </div>
      </div>

      <div className="kova-desktop-only">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Overview</div>
        <select
          style={{
            background: C.surf, border: `1px solid ${C.border}`, color: C.text,
            padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <div className="kova-overview-kpi-grid" style={{ gap: 14, marginBottom: 20 }}>
        {[
          { label: "Money In",      val: stats.inc,  pos: null },
          { label: "Money Out",     val: stats.out,  pos: null },
          { label: "Total Budget",  val: stats.bud,  pos: null },
          { label: "Left to Spend", val: stats.left, pos: stats.left >= 0 },
          { label: "Net Savings",   val: stats.net,  pos: stats.net >= 0 },
        ].map(k => (
          <div key={k.label} style={card}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
            }}>
              {k.label}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
              color: k.pos === null ? C.text : k.pos ? C.green : C.red,
            }}>
              {fmt(k.val)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bills due soon strip ─────────────────────────────────────────── */}
      {dueSoon.length > 0 && (
        <div style={{ ...card, marginBottom: 16, padding: "14px 20px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
          }}>
            Bills Due Soon
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {dueSoon.map(b => {
              const color = b.isPaid
                ? C.green
                : b.diffDays < 0
                  ? C.red
                  : b.diffDays <= 3
                    ? C.amber
                    : C.accent;
              const bg = b.isPaid
                ? "#dcfce7"
                : b.diffDays < 0
                  ? "#fee2e2"
                  : b.diffDays <= 3
                    ? "#fef3c7"
                    : "#eff6ff";
              const label = b.isPaid
                ? "Paid"
                : b.diffDays < 0
                  ? `${Math.abs(b.diffDays)}d overdue`
                  : b.diffDays === 0
                    ? "Due today"
                    : `Due in ${b.diffDays}d`;
              return (
                <div
                  key={b.name}
                  style={{
                    background: bg, border: `1px solid ${color}30`, borderRadius: 8,
                    padding: "8px 14px", display: "flex", flexDirection: "column", gap: 2, minWidth: 130,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{b.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{fmt(b.amount)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="kova-two-col-mobile" style={{ gap: 16, marginBottom: 16 }}>
        {/* Donut — Money Out by Category */}
        <div style={card}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16,
          }}>
            Money Out by Category
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ flexShrink: 0, width: 170, height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData} cx="50%" cy="50%"
                    innerRadius={48} outerRadius={82}
                    dataKey="value" paddingAngle={2}
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CT />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
              {donutData.slice(0, 10).map((d, i) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: 2,
                    background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, color: C.muted,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {d.name}
                  </span>
                  <span style={{ fontWeight: 700, color: C.text, flexShrink: 0, fontSize: 12 }}>
                    {fmt(d.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar — Budget vs Actual */}
        <div style={card}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16,
          }}>
            Budget vs Actual
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={bva} barCategoryGap="35%" barGap={3}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CT />} />
              <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual"  name="Actual"  fill={C.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Balance Trend ────────────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16,
        }}>
          Balance Trend — {filterMonth}
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={trendLine}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.borderL} />
            <XAxis dataKey="day" tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CT />} />
            <Line
              type="monotone" dataKey="balance" name="Balance"
              stroke={C.accent} strokeWidth={2.5} dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category tables ──────────────────────────────────────────────── */}
      <div className="kova-two-col-mobile" style={{ gap: 14, marginBottom: 16 }}>
        {TYPES.map(type => (
          <div key={type} style={card}>
            {sectionHead(type)}
            <div className="kova-table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={th}>Category</th>
                    <th style={{ ...th, textAlign: "right" }}>Budget</th>
                    <th style={{ ...th, textAlign: "right" }}>Actual</th>
                    <th style={{ ...th, textAlign: "right" }}>Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {typeGroups[type].map(row => {
                    const d = type === "INCOME"
                      ? row.actual - row.budget
                      : row.budget - row.actual;
                    return (
                      <tr key={row.name}>
                        <td style={td}>{row.name}</td>
                        <td style={{ ...td, textAlign: "right", color: C.muted }}>{fmt(row.budget)}</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(row.actual)}</td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <span style={{ color: d >= 0 ? C.green : C.red, fontWeight: 700 }}>
                            {d >= 0 ? "+" : ""}{fmt(d)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* ── Debt payoff progress ─────────────────────────────────────────── */}
      {debtStats.length > 0 && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16,
          }}>
            Debt Payoff Progress
          </div>
          <div className="kova-two-col-mobile" style={{ gap: 16 }}>
            {debtStats.map(d => (
              <div key={d.name} style={{
                background: C.bg, borderRadius: 10, padding: 16, border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{d.pct}% paid off</div>
                </div>
                <div style={{
                  background: C.border, borderRadius: 99, height: 8, marginBottom: 10, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    background: `linear-gradient(90deg,${C.green},#4ade80)`,
                    width: `${d.pct}%`, transition: "width 0.5s",
                  }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Remaining",  val: fmtK(d.remaining),   color: C.red },
                    { label: "Total Paid", val: fmtK(d.totalPaid),   color: C.green },
                    { label: "This Month", val: fmtK(d.monthlyPaid), color: C.accent },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{
                        fontSize: 10, color: C.subtle,
                        textTransform: "uppercase", letterSpacing: 0.4, marginTop: 2,
                      }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Monthly notes ────────────────────────────────────────────────── */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.muted,
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10,
        }}>
          Month Notes — {filterMonth}
        </div>
        <textarea
          style={{
            ...inp, height: 64, resize: "vertical", lineHeight: 1.5, fontSize: 13.5,
          }}
          placeholder="Add context about this month…"
          value={notesValue}
          onChange={e => setNotesDraft(e.target.value)}
          onBlur={handleNotesSave}
        />
      </div>
      </div>
    </div>
  );
}
