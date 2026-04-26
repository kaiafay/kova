"use client";

import { useEffect, useState, useMemo } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { CheckinModal } from "@/components/checkin-modal";
import { BudgetProvider, useBudget, TODAY, TODAY_STR } from "@/lib/budget-context";

const TODAY_OBJ = new Date();
const TODAY_DOW = TODAY_OBJ.getDay();

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { organization } = useOrganization();
  const router = useRouter();
  const { transactions, budgets, checkins, settings, loaded, filterMonth, addCheckin, saveSettings } = useBudget();
  const [showCheckin, setShowCheckin] = useState(false);
  const [weeklyDismissed, setWeeklyDismissed] = useState<string | null>(null);

  // Redirect to onboarding if no org
  useEffect(() => {
    if (organization === null) {
      router.replace("/onboarding");
    }
  }, [organization, router]);

  // Listen for kova:open-checkin custom event (dispatched by checkin/page.tsx)
  useEffect(() => {
    const handler = () => setShowCheckin(true);
    window.addEventListener("kova:open-checkin", handler);
    return () => window.removeEventListener("kova:open-checkin", handler);
  }, []);

  // Auto-show check-in on scheduled day
  useEffect(() => {
    if (!loaded) return;
    const thisWeekSunday = (() => {
      const d = new Date(TODAY_OBJ);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0, 10);
    })();
    const dismissed = localStorage.getItem("kova_weekly_dismissed");
    setWeeklyDismissed(dismissed);
    const isCheckinDay = TODAY_DOW === settings.checkinDay;
    if (isCheckinDay && dismissed !== thisWeekSunday) {
      setTimeout(() => setShowCheckin(true), 800);
    }
  }, [loaded, settings.checkinDay]);

  const todayMonth = `${TODAY_OBJ.getFullYear()}-${String(TODAY_OBJ.getMonth() + 1).padStart(2, "0")}`;

  const monthTxns = useMemo(() =>
    transactions.filter(t => t.date.startsWith(filterMonth)),
    [transactions, filterMonth]
  );

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

  const totalBudget = useMemo(() =>
    Object.values(budgetMap).filter(b => b.type !== "INCOME").reduce((s, b) => s + b.budget, 0),
    [budgetMap]
  );

  const weeklyData = useMemo(() => {
    const weekStart = new Date(TODAY_OBJ);
    weekStart.setDate(TODAY_OBJ.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekTxns = transactions.filter(t => t.date >= weekStartStr && t.date <= TODAY_STR);
    const weekSpend = weekTxns.filter(t => t.type !== "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
    const weekDebt = weekTxns.filter(t => t.type === "DEBT PAYMENT").reduce((s, t) => s + parseFloat(t.amount), 0);
    const weeklyPace = totalBudget / 4.33;
    const catMap: Record<string, number> = {};
    weekTxns.filter(t => t.type !== "INCOME").forEach(t => { catMap[t.name] = (catMap[t.name] || 0) + parseFloat(t.amount); });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] as [string, number] | undefined;
    return { weekSpend, weekDebt, weeklyPace, topCat, weekTxns: weekTxns.length };
  }, [transactions, totalBudget]);

  const dueSoon = useMemo(() => {
    const results: { name: string; amount: number; dueDay: number; diffDays: number; isPaid: boolean }[] = [];
    const year = TODAY_OBJ.getFullYear();
    const month = TODAY_OBJ.getMonth();
    Object.entries(budgetMap).filter(([, v]) => v.type === "BILLS" && v.dueDay).forEach(([name, v]) => {
      const dueDate = new Date(year, month, v.dueDay!);
      const diffDays = Math.ceil((dueDate.getTime() - TODAY_OBJ.getTime()) / (1000 * 60 * 60 * 24));
      const paidThisMonth = transactions.filter(t => t.name === name && t.date.startsWith(todayMonth)).reduce((s, t) => s + parseFloat(t.amount), 0);
      const isPaid = paidThisMonth >= v.budget * 0.9;
      if (diffDays >= -3 && diffDays <= 10) {
        results.push({ name, amount: v.budget, dueDay: v.dueDay!, diffDays, isPaid });
      }
    });
    return results.sort((a, b) => a.diffDays - b.diffDays);
  }, [budgetMap, transactions, todayMonth]);

  const handleDismiss = async (notes: string, save: boolean) => {
    const thisWeekSunday = (() => {
      const d = new Date(TODAY_OBJ);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0, 10);
    })();
    localStorage.setItem("kova_weekly_dismissed", thisWeekSunday);
    setWeeklyDismissed(thisWeekSunday);

    const monthTxnsFiltered = transactions.filter(t => t.date.startsWith(filterMonth));
    const monthOut = monthTxnsFiltered.filter(t => t.type !== "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);

    await addCheckin({
      date: TODAY_STR,
      weekSpend: weeklyData.weekSpend,
      weekDebt: weeklyData.weekDebt,
      topCat: weeklyData.topCat,
      notes: save ? notes : "",
    });

    if (save && notes) {
      const updated = { ...settings.monthlyNotes, [filterMonth]: (settings.monthlyNotes[filterMonth] || "") + (settings.monthlyNotes[filterMonth] ? "\n" : "") + notes };
      await saveSettings({ monthlyNotes: updated });
    }

    setShowCheckin(false);
  };

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc", fontFamily: "system-ui", color: "#64748b" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#0f172a" }}>
      {showCheckin && (
        <CheckinModal
          weeklyData={weeklyData}
          dueSoon={dueSoon}
          onDismiss={handleDismiss}
          onClose={() => setShowCheckin(false)}
        />
      )}
      <Nav onCheckin={() => setShowCheckin(true)} />
      {children}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BudgetProvider>
      <DashboardInner>{children}</DashboardInner>
    </BudgetProvider>
  );
}
