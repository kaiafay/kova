"use client";
import { useState } from "react";
import Link from "next/link";
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

export default function DesktopDebt() {
  const { accounts, totals } = useDebtData();
  const [_tab] = useState("table");

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
        </>
      )}
    </div>
  );
}
