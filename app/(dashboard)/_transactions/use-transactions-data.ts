"use client";
import { useMemo } from "react";
import { useBudget } from "@/lib/budget-context";

export function useTransactionsData() {
  const {
    transactions, budgets, settings,
    filterMonth, setFilterMonth,
    addTransactions, deleteTransaction, updateTransaction, saveSettings,
  } = useBudget();

  const budgetMap = useMemo(() => {
    const m: Record<string, { budget: number; type: string }> = {};
    budgets.forEach(b => { m[b.name] = { budget: parseFloat(b.budgetAmount), type: b.type }; });
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

  return {
    transactions, budgets, settings,
    filterMonth, setFilterMonth,
    addTransactions, deleteTransaction, updateTransaction, saveSettings,
    budgetMap, months, monthTxns,
  };
}
