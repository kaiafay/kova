"use client";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDebtData } from "./use-debt-data";
import type { DebtAccount } from "./use-debt-data";

const C = {
  bg: "#f8fafc",
  surf: "#ffffff",
  border: "#e2e8f0",
  borderL: "#f1f5f9",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  green: "#16a34a",
  red: "#dc2626",
  accent: "#2563eb",
  amber: "#d97706",
  purple: "#7c3aed",
};

const card = {
  background: C.surf,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 22,
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};

const th = {
  textAlign: "left" as const,
  padding: "8px 12px",
  color: C.subtle,
  fontSize: 11,
  fontWeight: 700 as const,
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  borderBottom: `1px solid ${C.borderL}`,
  whiteSpace: "nowrap" as const,
};

const td = {
  padding: "9px 12px",
  borderBottom: `1px solid ${C.borderL}`,
  color: C.text,
  verticalAlign: "middle" as const,
  fontSize: 13,
};

const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtK = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n);

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  "missing-balance": { label: "Missing balance", color: C.amber, bg: "#fef3c7" },
  "no-payments": { label: "No payments", color: C.muted, bg: C.borderL },
  "paid-off": { label: "Paid off", color: C.green, bg: "#dcfce7" },
  "on-track": { label: "On track", color: C.accent, bg: "#eff6ff" },
  "under-target": { label: "Under target", color: C.red, bg: "#fee2e2" },
};

function StatusBadge({ status }: { status: DebtAccount["status"] }) {
  const meta = STATUS_META[status] ?? STATUS_META["under-target"];
  return (
    <span
      style={{
        background: meta.bg,
        color: meta.color,
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap" as const,
      }}
    >
      {meta.label}
    </span>
  );
}

const CT = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
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
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      {label && (
        <div style={{ color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>
          {label}
        </div>
      )}
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

function AccountProgressCard({ acc }: { acc: DebtAccount }) {
  const isPaidOff = acc.status === "paid-off";
  const hasMissingBalance = acc.startingBalance === null;
  const barPct = hasMissingBalance ? 0 : acc.percentPaid;
  const barColor = isPaidOff
    ? `linear-gradient(90deg,${C.green},#4ade80)`
    : `linear-gradient(90deg,${C.accent},#60a5fa)`;

  const monthsLeft =
    acc.estimatedMonthsRemaining !== null
      ? acc.estimatedMonthsRemaining === 0
        ? "Paid off"
        : `~${acc.estimatedMonthsRemaining} mo left`
      : "Unknown";

  return (
    <div
      style={{
        background: isPaidOff ? "#f0fdf4" : C.bg,
        borderRadius: 10,
        padding: 16,
        border: `1px solid ${isPaidOff ? "#bbf7d0" : C.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            marginRight: 8,
          }}
          title={acc.name}
        >
          {acc.name}
        </div>
        <div style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>
          {hasMissingBalance ? "—" : `${acc.percentPaid}% paid`}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: C.border,
          borderRadius: 99,
          height: 8,
          marginBottom: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: hasMissingBalance ? C.subtle : barColor,
            width: `${barPct}%`,
            transition: "width 0.5s",
          }}
        />
      </div>

      {hasMissingBalance && (
        <div
          style={{
            fontSize: 11,
            color: C.amber,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          No starting balance — set one in Settings
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
          marginBottom: 8,
        }}
      >
        {[
          { label: "Remaining", val: fmtK(acc.remaining), color: C.red },
          { label: "Total Paid", val: fmtK(acc.totalPaid), color: C.green },
          { label: "This Month", val: fmtK(acc.monthlyPaid), color: C.accent },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: 15, fontWeight: 800, color: s.color }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.subtle,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: C.muted,
          borderTop: `1px solid ${C.borderL}`,
          paddingTop: 8,
        }}
      >
        <span>
          Monthly plan:{" "}
          <strong style={{ color: C.text }}>{fmtK(acc.monthlyPlanned)}</strong>
        </span>
        <span style={{ color: isPaidOff ? C.green : C.muted }}>{monthsLeft}</span>
      </div>
    </div>
  );
}

export default function DesktopDebt() {
  const { accounts, totals } = useDebtData();

  const hasAccounts = accounts.length > 0;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          Debt
        </div>
      </div>

      {!hasAccounts ? (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.text,
              marginBottom: 8,
            }}
          >
            No debt accounts found
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: C.muted,
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            Add budget categories with type <strong>DEBT PAYMENT</strong> and
            set a starting balance in{" "}
            <Link
              href="/settings"
              style={{ color: C.accent, textDecoration: "underline" }}
            >
              Settings
            </Link>{" "}
            to start tracking payoff progress.
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div
            className="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1280px]:grid-cols-6 gap-3.5"
            style={{ marginBottom: 20 }}
          >
            {[
              {
                label: "Total Remaining",
                val: fmtK(totals.totalRemaining),
                color: C.red,
              },
              {
                label: "Total Paid",
                val: fmtK(totals.totalPaid),
                color: C.green,
              },
              {
                label: "This Month",
                val: fmtK(totals.monthlyPaid),
                color: C.accent,
              },
              {
                label: "Monthly Planned",
                val: fmtK(totals.monthlyPlanned),
                color: C.muted,
              },
              {
                label: "Overall Progress",
                val: `${totals.percentPaid}%`,
                color: C.purple,
              },
              {
                label: "Est. Debt-Free",
                val: totals.estimatedPayoffDate ?? "Not enough data",
                color: C.text,
                small: !totals.estimatedPayoffDate,
              },
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
                    fontSize: k.small ? 13 : 20,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    color: k.color,
                    lineHeight: 1.2,
                  }}
                >
                  {k.val}
                </div>
              </div>
            ))}
          </div>

          {/* Account Table */}
          <div style={{ ...card, marginBottom: 20, padding: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                padding: "16px 20px 12px",
                borderBottom: `1px solid ${C.borderL}`,
              }}
            >
              Debt Accounts
            </div>
            <div className="kova-table-scroll">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th style={th}>Account</th>
                    <th style={{ ...th, textAlign: "right" }}>Starting</th>
                    <th style={{ ...th, textAlign: "right" }}>Remaining</th>
                    <th style={{ ...th, textAlign: "right" }}>Total Paid</th>
                    <th style={{ ...th, textAlign: "right" }}>This Month</th>
                    <th style={{ ...th, textAlign: "right" }}>Monthly Plan</th>
                    <th style={{ ...th, textAlign: "right" }}>Progress</th>
                    <th style={{ ...th, textAlign: "right" }}>Last Payment</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.name}>
                      <td
                        style={{
                          ...td,
                          fontWeight: 600,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={acc.name}
                      >
                        {acc.name}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: C.muted }}>
                        {acc.startingBalance !== null
                          ? fmtK(acc.startingBalance)
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          color: C.red,
                          fontWeight: 600,
                        }}
                      >
                        {acc.startingBalance !== null
                          ? fmtK(acc.remaining)
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          color: C.green,
                          fontWeight: 600,
                        }}
                      >
                        {fmtK(acc.totalPaid)}
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        {fmtK(acc.monthlyPaid)}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: C.muted }}>
                        {fmtK(acc.monthlyPlanned)}
                      </td>
                      <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                        {acc.startingBalance !== null
                          ? `${acc.percentPaid}%`
                          : "—"}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: C.subtle }}>
                        {acc.latestPaymentDate ?? "—"}
                      </td>
                      <td style={td}>
                        <StatusBadge status={acc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-account Progress Cards */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 16,
              }}
            >
              Account Progress
            </div>
            <div className="grid grid-cols-1 min-[1024px]:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <AccountProgressCard key={acc.name} acc={acc} />
              ))}
            </div>
          </div>

          {/* Payment History Chart */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                marginBottom: 4,
              }}
            >
              Payment History
            </div>

            {totals.monthlyHistory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 0",
                  color: C.subtle,
                  fontSize: 13.5,
                }}
              >
                No debt payments recorded yet.
              </div>
            ) : (
              <>
                {/* Supporting metrics */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    {
                      label: "Avg Monthly Payment",
                      val: fmtK(totals.avgMonthlyPayment),
                      color: C.accent,
                    },
                    totals.highestPaymentMonth
                      ? {
                          label: "Best Month",
                          val: `${totals.highestPaymentMonth.month} · ${fmtK(totals.highestPaymentMonth.paid)}`,
                          color: C.green,
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((m) => (
                      <div key={m!.label}>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.subtle,
                            textTransform: "uppercase",
                            letterSpacing: 0.4,
                          }}
                        >
                          {m!.label}
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: m!.color,
                          }}
                        >
                          {m!.val}
                        </div>
                      </div>
                    ))}
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={totals.monthlyHistory}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={C.borderL} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: C.subtle, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.subtle, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                    />
                    <Tooltip content={<CT />} />
                    <Bar
                      dataKey="paid"
                      name="Paid"
                      fill={C.accent}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
