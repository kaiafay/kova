"use client";
import { useMemo } from "react";
import { useBudget } from "@/lib/budget-context";
import type { Transaction, Budget } from "@/lib/budget-context";

export type DebtStatus =
  | "missing-balance"
  | "no-payments"
  | "paid-off"
  | "on-track"
  | "under-target";

export interface DebtAccount {
  name: string;
  startingBalance: number | null;
  monthlyPlanned: number;
  totalPaid: number;
  remaining: number;
  percentPaid: number;
  monthlyPaid: number;
  latestPaymentDate: string | null;
  estimatedMonthsRemaining: number | null;
  status: DebtStatus;
  monthlyHistory: { month: string; paid: number }[];
  daysSinceLastPayment: number | null;
  isStale: boolean;
}

export interface DebtTotals {
  totalStarting: number;
  totalRemaining: number;
  totalPaid: number;
  monthlyPaid: number;
  monthlyPlanned: number;
  percentPaid: number;
  estimatedPayoffDate: string | null;
  monthlyHistory: { month: string; paid: number }[];
  avgMonthlyPayment: number;
  highestPaymentMonth: { month: string; paid: number } | null;
}

export interface DebtWarning {
  type:
    | "missing-starting-balance"
    | "no-payments"
    | "unmatched-transactions"
    | "overpaid"
    | "zero-planned-payment"
    | "stale-payments";
  accountName?: string;
  message: string;
}

// ── pure helpers ─────────────────────────────────────────────────────────────

export function calculateDebtAccounts(
  budgets: Budget[],
  transactions: Transaction[],
  filterMonth: string,
): DebtAccount[] {
  const debtBudgets = budgets.filter((b) => b.type === "DEBT PAYMENT");

  return debtBudgets.map((b) => {
    const raw = b.startingBalance;
    const startingBalance =
      raw !== null && raw !== undefined && raw !== "" ? parseFloat(raw) : null;
    const monthlyPlanned = parseFloat(b.budgetAmount);

    const payments = transactions.filter(
      (t) => t.type === "DEBT PAYMENT" && t.name === b.name,
    );

    const totalPaid = payments.reduce((s, t) => s + parseFloat(t.amount), 0);

    const remaining =
      startingBalance !== null ? Math.max(0, startingBalance - totalPaid) : 0;

    const percentPaid =
      startingBalance !== null && startingBalance > 0
        ? Math.min(100, Math.round((totalPaid / startingBalance) * 100))
        : 0;

    const monthlyPaid = payments
      .filter((t) => t.date.startsWith(filterMonth))
      .reduce((s, t) => s + parseFloat(t.amount), 0);

    const sorted = [...payments].sort((a, b) => b.date.localeCompare(a.date));
    const latestPaymentDate = sorted.length > 0 ? sorted[0].date : null;

    const monthlyHistory = buildMonthlyHistory(payments);

    const today = new Date();
    const daysSinceLastPayment = latestPaymentDate
      ? Math.floor(
          (today.getTime() - new Date(latestPaymentDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
    const isStale =
      daysSinceLastPayment !== null && daysSinceLastPayment > 60 && remaining > 0;

    const avgPayment =
      monthlyHistory.length > 0
        ? monthlyHistory.reduce((s, m) => s + m.paid, 0) / monthlyHistory.length
        : 0;

    const estimatedMonthsRemaining =
      avgPayment > 0 && remaining > 0
        ? Math.ceil(remaining / avgPayment)
        : remaining === 0 && totalPaid > 0
          ? 0
          : null;

    const status = deriveStatus(
      startingBalance,
      totalPaid,
      monthlyPaid,
      monthlyPlanned,
      remaining,
    );

    return {
      name: b.name,
      startingBalance,
      monthlyPlanned,
      totalPaid,
      remaining,
      percentPaid,
      monthlyPaid,
      latestPaymentDate,
      estimatedMonthsRemaining,
      status,
      monthlyHistory,
      daysSinceLastPayment,
      isStale,
    };
  });
}

function deriveStatus(
  startingBalance: number | null,
  totalPaid: number,
  monthlyPaid: number,
  monthlyPlanned: number,
  remaining: number,
): DebtStatus {
  if (startingBalance === null) return "missing-balance";
  if (startingBalance === 0) return "paid-off";
  if (remaining === 0 && totalPaid > 0) return "paid-off";
  if (totalPaid === 0) return "no-payments";
  if (monthlyPlanned > 0 && monthlyPaid >= monthlyPlanned) return "on-track";
  return "under-target";
}

export function buildMonthlyHistory(
  payments: Transaction[],
): { month: string; paid: number }[] {
  const byMonth: Record<string, number> = {};
  for (const t of payments) {
    const month = t.date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + parseFloat(t.amount);
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, paid]) => ({ month, paid }));
}

function mergeMonthlyHistories(
  accounts: DebtAccount[],
): { month: string; paid: number }[] {
  const byMonth: Record<string, number> = {};
  for (const acc of accounts) {
    for (const { month, paid } of acc.monthlyHistory) {
      byMonth[month] = (byMonth[month] || 0) + paid;
    }
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, paid]) => ({ month, paid }));
}

function estimatePayoffDate(
  totalRemaining: number,
  avgMonthly: number,
): string | null {
  if (avgMonthly <= 0 || totalRemaining <= 0) return null;
  const monthsLeft = Math.ceil(totalRemaining / avgMonthly);
  const now = new Date();
  now.setMonth(now.getMonth() + monthsLeft);
  return now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function buildDebtWarnings(
  accounts: DebtAccount[],
  transactions: Transaction[],
  budgets: Budget[],
): DebtWarning[] {
  const warnings: DebtWarning[] = [];
  const debtBudgetNames = new Set(
    budgets.filter((b) => b.type === "DEBT PAYMENT").map((b) => b.name),
  );

  for (const acc of accounts) {
    if (acc.startingBalance === null) {
      warnings.push({
        type: "missing-starting-balance",
        accountName: acc.name,
        message: `"${acc.name}" has no starting balance. Set one in Settings to track payoff progress.`,
      });
    }
    if (acc.totalPaid === 0 && acc.startingBalance !== null && acc.startingBalance > 0) {
      warnings.push({
        type: "no-payments",
        accountName: acc.name,
        message: `"${acc.name}" has a starting balance but no payments recorded.`,
      });
    }
    if (acc.remaining === 0 && acc.totalPaid === 0 && acc.startingBalance === 0) {
      // starting balance of zero may be intentional — skip
    }
    if (
      acc.startingBalance !== null &&
      acc.totalPaid > acc.startingBalance &&
      acc.startingBalance > 0
    ) {
      warnings.push({
        type: "overpaid",
        accountName: acc.name,
        message: `"${acc.name}" appears overpaid. Total payments exceed the starting balance.`,
      });
    }
    if (acc.monthlyPlanned === 0) {
      warnings.push({
        type: "zero-planned-payment",
        accountName: acc.name,
        message: `"${acc.name}" has no planned monthly payment amount set.`,
      });
    }
    if (acc.isStale && acc.daysSinceLastPayment !== null) {
      warnings.push({
        type: "stale-payments",
        accountName: acc.name,
        message: `"${acc.name}" has had no payments in ${acc.daysSinceLastPayment} days.`,
      });
    }
  }

  const unmatchedNames = new Set<string>();
  for (const t of transactions) {
    if (t.type === "DEBT PAYMENT" && !debtBudgetNames.has(t.name)) {
      unmatchedNames.add(t.name);
    }
  }
  for (const name of unmatchedNames) {
    warnings.push({
      type: "unmatched-transactions",
      accountName: name,
      message: `Debt payments exist for "${name}" but no matching debt budget category was found.`,
    });
  }

  return warnings;
}

export function selectDebtTarget(
  accounts: DebtAccount[],
  method: "snowball" | "avalanche" | "custom",
  customTarget: string | null,
): DebtAccount | null {
  const active = accounts.filter((a) => a.remaining > 0);
  if (active.length === 0) return null;

  if (method === "custom" && customTarget) {
    const found = active.find((a) => a.name === customTarget);
    return found ?? active[0];
  }

  // Snowball: lowest remaining balance first
  return [...active].sort((a, b) => a.remaining - b.remaining)[0];
}

// ── hook ──────────────────────────────────────────────────────────────────────

export function useDebtData() {
  const { transactions, budgets, filterMonth } = useBudget();

  const accounts = useMemo(
    () => calculateDebtAccounts(budgets, transactions, filterMonth),
    [budgets, transactions, filterMonth],
  );

  const totals = useMemo((): DebtTotals => {
    const totalStarting = accounts.reduce(
      (s, a) => s + (a.startingBalance ?? 0),
      0,
    );
    const totalRemaining = accounts.reduce((s, a) => s + a.remaining, 0);
    const totalPaid = accounts.reduce((s, a) => s + a.totalPaid, 0);
    const monthlyPaid = accounts.reduce((s, a) => s + a.monthlyPaid, 0);
    const monthlyPlanned = accounts.reduce((s, a) => s + a.monthlyPlanned, 0);
    const percentPaid =
      totalStarting > 0
        ? Math.min(100, Math.round((totalPaid / totalStarting) * 100))
        : 0;

    const monthlyHistory = mergeMonthlyHistories(accounts);
    const avgMonthlyPayment =
      monthlyHistory.length > 0
        ? monthlyHistory.reduce((s, m) => s + m.paid, 0) / monthlyHistory.length
        : 0;

    const highestPaymentMonth =
      monthlyHistory.length > 0
        ? monthlyHistory.reduce((best, m) => (m.paid > best.paid ? m : best))
        : null;

    const estimatedPayoffDate = estimatePayoffDate(totalRemaining, avgMonthlyPayment);

    return {
      totalStarting,
      totalRemaining,
      totalPaid,
      monthlyPaid,
      monthlyPlanned,
      percentPaid,
      estimatedPayoffDate,
      monthlyHistory,
      avgMonthlyPayment,
      highestPaymentMonth,
    };
  }, [accounts]);

  const warnings = useMemo(
    () => buildDebtWarnings(accounts, transactions, budgets),
    [accounts, transactions, budgets],
  );

  return { accounts, totals, warnings, filterMonth };
}
