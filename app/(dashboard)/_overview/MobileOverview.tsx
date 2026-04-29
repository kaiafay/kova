"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { MonthPicker } from "@/components/month-picker";
import { useOverviewData } from "./use-overview-data";

const C = {
  bg: "#f8fafc",
  surf: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  green: "#16a34a",
  red: "#dc2626",
  accent: "#2563eb",
  amber: "#d97706",
};
const card = {
  background: C.surf,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const DONUT_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#14b8a6",
  "#a855f7",
  "#3b82f6",
  "#22c55e",
  "#eab308",
];

const CT = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            color: p.color || "#374151",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function MobileOverview() {
  const { months, filterMonth, setFilterMonth, stats, dueSoon, donutData } =
    useOverviewData();

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          Overview
        </div>
        <MonthPicker months={months} value={filterMonth} onChange={setFilterMonth} menuAlign="end" />
      </div>

      <div className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1280px]:grid-cols-5 gap-3 mb-3.5">
        {[
          { label: "Money In", val: stats.inc, pos: null },
          { label: "Money Out", val: stats.out, pos: null },
          { label: "Total Budget", val: stats.bud, pos: null },
          { label: "Left to Spend", val: stats.left, pos: stats.left >= 0 },
          { label: "Net Savings", val: stats.net, pos: stats.net >= 0 },
        ].map((k) => (
          <div key={k.label} style={card}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 6,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: -0.5,
                color: k.pos === null ? C.text : k.pos ? C.green : C.red,
              }}
            >
              {fmt(k.val)}
            </div>
          </div>
        ))}
      </div>

      {dueSoon.length > 0 && (
        <div style={{ ...card, marginBottom: 14, padding: "14px 16px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.muted,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 10,
            }}
          >
            Bills Due Soon
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {dueSoon.map((b) => {
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
                  <div style={{ fontSize: 12, fontWeight: 700, color }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {fmt(b.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ ...card, marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 12,
          }}
        >
          Money Out by Category
        </div>
        <div style={{ height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={76}
                dataKey="value"
                paddingAngle={2}
              >
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
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          Desktop has the full budget workflow
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
          Open Kova on desktop to review category tables, debt payoff details,
          trends, calendar, and check-ins.
        </div>
      </div>
    </div>
  );
}
