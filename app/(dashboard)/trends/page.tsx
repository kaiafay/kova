"use client";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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
  background: C.surf,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

// ── Formatters ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Custom Tooltip ─────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
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
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      {label && (
        <div style={{ color: "#6b7280", marginBottom: 6, fontWeight: 700, fontSize: 11 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            color: p.color || "#374151",
            display: "flex",
            gap: 16,
            justifyContent: "space-between",
            marginBottom: i < payload.length - 1 ? 3 : 0,
          }}
        >
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Summary stat card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        ...card,
        flex: "1 1 160px",
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent || C.text, letterSpacing: -0.5 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TrendsPage() {
  const { transactions } = useBudget();

  // All months present in data, newest first
  const months = useMemo(
    () => [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse(),
    [transactions]
  );

  // Chart data — oldest first
  const chartData = useMemo(
    () =>
      months
        .slice()
        .reverse()
        .map((m) => {
          const mt = transactions.filter((t) => t.date.startsWith(m));
          return {
            month: m,
            Income: Math.round(
              mt.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0)
            ),
            "Money Out": Math.round(
              mt.filter((t) => t.type !== "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0)
            ),
            Debt: Math.round(
              mt
                .filter((t) => t.type === "DEBT PAYMENT")
                .reduce((s, t) => s + parseFloat(t.amount), 0)
            ),
          };
        }),
    [months, transactions]
  );

  // Averages for stat cards (using all available months)
  const avgs = useMemo(() => {
    if (chartData.length === 0) return { income: 0, out: 0, debt: 0, net: 0 };
    const n = chartData.length;
    const income = chartData.reduce((s, d) => s + d.Income, 0) / n;
    const out = chartData.reduce((s, d) => s + d["Money Out"], 0) / n;
    const debt = chartData.reduce((s, d) => s + d.Debt, 0) / n;
    return { income, out, debt, net: income - out };
  }, [chartData]);

  // Month-over-month delta for most recent month
  const momDelta = useMemo(() => {
    if (chartData.length < 2) return null;
    const latest = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];
    return {
      spend: latest["Money Out"] - prev["Money Out"],
      income: latest.Income - prev.Income,
    };
  }, [chartData]);

  const hasTrends = months.length >= 2;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      {/* Page title */}
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
        Trends
      </div>

      {!hasTrends ? (
        /* Empty state */
        <div
          style={{
            ...card,
            textAlign: "center",
            padding: "60px 40px",
            color: C.muted,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>📈</div>
          {months.length === 0 ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: C.text }}>
                No transactions yet
              </div>
              <div style={{ fontSize: 13.5 }}>
                Add transactions to get started. Trends appear once you have 2+ months of data.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: C.text }}>
                Need at least 2 months of data
              </div>
              <div style={{ fontSize: 13.5 }}>
                You have 1 month recorded — add transactions for another month to unlock trends.
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Avg stat cards */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <StatCard
              label="Avg Income"
              value={fmt(avgs.income)}
              sub={`over ${months.length} months`}
              accent={C.green}
            />
            <StatCard
              label="Avg Money Out"
              value={fmt(avgs.out)}
              sub={`over ${months.length} months`}
              accent={C.red}
            />
            <StatCard
              label="Avg Net"
              value={fmt(avgs.net)}
              sub="income minus spend"
              accent={avgs.net >= 0 ? C.green : C.red}
            />
            <StatCard
              label="Avg Debt Payment"
              value={fmt(avgs.debt)}
              sub={`over ${months.length} months`}
              accent="#7c3aed"
            />
            {momDelta && (
              <StatCard
                label="MoM Spend Change"
                value={`${momDelta.spend >= 0 ? "+" : ""}${fmt(momDelta.spend)}`}
                sub="vs previous month"
                accent={momDelta.spend <= 0 ? C.green : C.red}
              />
            )}
          </div>

          {/* Line chart */}
          <div style={card}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 20,
              }}
            >
              Month-over-Month
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderL} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.subtle, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                  width={54}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, color: C.muted, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke={C.green}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: C.green }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Money Out"
                  stroke={C.red}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: C.red }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Debt"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#7c3aed" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Per-month breakdown table */}
          <div style={{ ...card, marginTop: 16, overflowX: "auto" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 14,
              }}
            >
              Monthly Breakdown
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Month", "Income", "Money Out", "Net", "Debt"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        color: C.subtle,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        borderBottom: `1px solid ${C.borderL}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData
                  .slice()
                  .reverse()
                  .map((row) => {
                    const net = row.Income - row["Money Out"];
                    return (
                      <tr key={row.month}>
                        <td
                          style={{
                            padding: "9px 12px",
                            borderBottom: `1px solid ${C.borderL}`,
                            color: C.text,
                            verticalAlign: "middle",
                            fontWeight: 600,
                          }}
                        >
                          {row.month}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            borderBottom: `1px solid ${C.borderL}`,
                            color: C.green,
                            verticalAlign: "middle",
                            fontWeight: 600,
                          }}
                        >
                          {fmt(row.Income)}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            borderBottom: `1px solid ${C.borderL}`,
                            color: C.red,
                            verticalAlign: "middle",
                            fontWeight: 600,
                          }}
                        >
                          {fmt(row["Money Out"])}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            borderBottom: `1px solid ${C.borderL}`,
                            color: net >= 0 ? C.green : C.red,
                            verticalAlign: "middle",
                            fontWeight: 700,
                          }}
                        >
                          {net >= 0 ? "+" : ""}
                          {fmt(net)}
                        </td>
                        <td
                          style={{
                            padding: "9px 12px",
                            borderBottom: `1px solid ${C.borderL}`,
                            color: "#7c3aed",
                            verticalAlign: "middle",
                          }}
                        >
                          {fmt(row.Debt)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
