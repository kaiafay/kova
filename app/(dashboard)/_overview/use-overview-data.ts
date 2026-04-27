"use client";
import { useMemo } from "react";
import { useBudget } from "@/lib/budget-context";

const todayObj = new Date();
const todayMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}`;

export interface DueSoonItem {
  name: string;
  amount: number;
  dueDay: number;
  diffDays: number;
  isPaid: boolean;
}

export function useOverviewData() {
  const { transactions, budgets, settings, filterMonth, setFilterMonth, saveSettings } = useBudget();

  const budgetMap = useMemo(() => {
    const m: Record<string, { budget: number; type: string; dueDay: number | null; startingBalance: number | null }> = {};
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

  const months = useMemo(
    () => [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse(),
    [transactions],
  );

  const monthTxns = useMemo(
    () => transactions.filter(t => t.date.startsWith(filterMonth)),
    [transactions, filterMonth],
  );

  const stats = useMemo(() => {
    const inc = monthTxns.filter(t => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
    const out = monthTxns.filter(t => t.type !== "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
    const bud = Object.values(budgetMap).filter(b => b.type !== "INCOME").reduce((s, b) => s + b.budget, 0);
    return { inc, out, bud, left: bud - out, net: inc - out };
  }, [monthTxns, budgetMap]);

  const catTotals = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxns.filter(t => t.type !== "INCOME").forEach(t => {
      m[t.name] = (m[t.name] || 0) + parseFloat(t.amount);
    });
    return m;
  }, [monthTxns]);

  const donutData = useMemo(
    () => Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    [catTotals],
  );

  const dueSoon = useMemo((): DueSoonItem[] => {
    const results: DueSoonItem[] = [];
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

  return {
    transactions, budgets, settings,
    filterMonth, setFilterMonth, saveSettings,
    budgetMap, months, monthTxns,
    stats, catTotals, donutData, dueSoon,
  };
}
