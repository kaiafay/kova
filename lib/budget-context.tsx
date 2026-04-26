"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useOrganization } from "@clerk/nextjs";

const TODAY = new Date();
const TODAY_STR = TODAY.toISOString().slice(0, 10);
const TODAY_MONTH = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}`;

export interface Transaction {
  id: number;
  orgId: string;
  createdBy: string;
  date: string;
  name: string;
  type: string;
  amount: string;
  notes: string;
}

export interface Budget {
  id: number;
  orgId: string;
  name: string;
  type: string;
  budgetAmount: string;
  dueDay: number | null;
  startingBalance: string | null;
}

export interface Checkin {
  id: number;
  orgId: string;
  createdBy: string;
  date: string;
  weekSpend: string | null;
  weekDebt: string | null;
  topCatName: string | null;
  topCatAmount: string | null;
  notes: string;
}

export interface Settings {
  checkinDay: number;
  merchantMap: Record<string, string>;
  monthlyNotes: Record<string, string>;
}

interface BudgetContextValue {
  transactions: Transaction[];
  budgets: Budget[];
  checkins: Checkin[];
  settings: Settings;
  loaded: boolean;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  addTransactions: (txns: Omit<Transaction, "id" | "orgId" | "createdBy">[]) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  upsertBudget: (b: Omit<Budget, "id" | "orgId">) => Promise<void>;
  addCheckin: (c: { date: string; weekSpend: number; weekDebt: number; topCat?: [string, number]; notes: string }) => Promise<void>;
  deleteCheckin: (id: number) => Promise<void>;
  saveSettings: (s: Partial<Settings>) => Promise<void>;
  refetch: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [settings, setSettings] = useState<Settings>({ checkinDay: 0, merchantMap: {}, monthlyNotes: {} });
  const [loaded, setLoaded] = useState(false);
  const [filterMonth, setFilterMonth] = useState(TODAY_MONTH);

  const fetchAll = useCallback(async () => {
    try {
      const [txRes, bdRes, ciRes, stRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/checkins"),
        fetch("/api/settings"),
      ]);
      if (txRes.ok) setTransactions(await txRes.json());
      if (bdRes.ok) setBudgets(await bdRes.json());
      if (ciRes.ok) setCheckins(await ciRes.json());
      if (stRes.ok) {
        const s = await stRes.json();
        setSettings({ checkinDay: s.checkinDay ?? 0, merchantMap: s.merchantMap ?? {}, monthlyNotes: s.monthlyNotes ?? {} });
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (organization) {
      setLoaded(false);
      fetchAll();
    }
  }, [organization?.id, fetchAll]);

  const addTransactions = async (txns: Omit<Transaction, "id" | "orgId" | "createdBy">[]) => {
    const res = await fetch("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(txns) });
    const inserted = await res.json();
    setTransactions(t => [...t, ...(Array.isArray(inserted) ? inserted : [inserted])]);
  };

  const deleteTransaction = async (id: number) => {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions(t => t.filter(x => x.id !== id));
  };

  const updateTransaction = async (id: number, data: Partial<Transaction>) => {
    const res = await fetch(`/api/transactions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const updated = await res.json();
    setTransactions(t => t.map(x => x.id === id ? updated : x));
  };

  const upsertBudget = async (b: Omit<Budget, "id" | "orgId">) => {
    const res = await fetch("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    const saved = await res.json();
    setBudgets(prev => {
      const idx = prev.findIndex(x => x.name === b.name);
      if (idx >= 0) return prev.map((x, i) => i === idx ? saved : x);
      return [...prev, saved];
    });
  };

  const addCheckin = async (c: { date: string; weekSpend: number; weekDebt: number; topCat?: [string, number]; notes: string }) => {
    const res = await fetch("/api/checkins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });
    const inserted = await res.json();
    setCheckins(prev => [inserted, ...prev]);
  };

  const deleteCheckin = async (id: number) => {
    await fetch(`/api/checkins/${id}`, { method: "DELETE" });
    setCheckins(prev => prev.filter(x => x.id !== id));
  };

  const saveSettings = async (s: Partial<Settings>) => {
    const merged = { ...settings, ...s };
    const res = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(merged) });
    const saved = await res.json();
    setSettings({ checkinDay: saved.checkinDay ?? 0, merchantMap: saved.merchantMap ?? {}, monthlyNotes: saved.monthlyNotes ?? {} });
  };

  return (
    <BudgetContext.Provider value={{ transactions, budgets, checkins, settings, loaded, filterMonth, setFilterMonth, addTransactions, deleteTransaction, updateTransaction, upsertBudget, addCheckin, deleteCheckin, saveSettings, refetch: fetchAll }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}

export { TODAY, TODAY_STR, TODAY_MONTH };
