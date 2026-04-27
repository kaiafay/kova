"use client";
import { useMemo, useState } from "react";
import { useTransactionsData } from "./use-transactions-data";
import { TRANSACTION_TYPES, TYPE_META as TYPE_META_STRICT } from "@/lib/transaction-types";
const TYPE_META: Record<string, { color: string; bg: string; label: string }> = TYPE_META_STRICT;

const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb",
};
const card = { background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const inp = { background: C.surf, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%", boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit" };
const sel = { ...inp, cursor: "pointer" };
const btn = (v = "primary") => ({
  padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 600 as const, fontFamily: "inherit",
  whiteSpace: "nowrap" as const, transition: "all 0.12s",
  background: v === "primary" ? C.accent : "#f1f5f9",
  color: v === "primary" ? "#fff" : C.muted,
});

const fmt = (n: number) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const badge = (type: string) => ({ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 as const, background: TYPE_META[type]?.bg || "#f1f5f9", color: TYPE_META[type]?.color || C.muted });

const todayStr = new Date().toISOString().slice(0, 10);

interface BatchItem { id: string; date: string; name: string; type: string; amount: number; notes: string }

export function MobileTransactions() {
  const { budgets, filterMonth, setFilterMonth, months, monthTxns, addTransactions } = useTransactionsData();

  const latestTxns = useMemo(
    () => [...monthTxns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [monthTxns],
  );

  const budgetMap = useMemo(() => {
    const m: Record<string, string> = {};
    budgets.forEach(b => { m[b.name] = b.type; });
    return m;
  }, [budgets]);

  const [form, setForm] = useState({ date: todayStr, name: "", type: "", amount: "", notes: "" });
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const pickName = (name: string) => {
    setForm(f => ({ ...f, name, type: budgetMap[name] || "" })); setFormError(null);
  };

  const addToBatch = () => {
    if (!form.name) { setFormError("Select a category."); return; }
    if (!form.type) { setFormError("Category has no type assigned — check your budget settings."); return; }
    if (!form.amount) { setFormError("Enter an amount."); return; }
    if (!form.date) { setFormError("Select a date."); return; }
    setFormError(null);
    setBatch(b => [...b, { ...form, amount: parseFloat(form.amount), id: `${Date.now()}-${Math.random()}` }]);
    setForm(f => ({ ...f, name: "", type: "", amount: "", notes: "" }));
  };

  const commitBatch = async () => {
    const validBatch = batch.filter(b => b.type);
    if (!validBatch.length) return;
    await addTransactions(validBatch.map(b => ({ date: b.date, name: b.name, type: b.type, amount: String(b.amount), notes: b.notes })));
    setBatch([]);
  };

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Transactions</div>
        <select style={{ background: C.surf, border: `1px solid ${C.border}`, color: C.text, padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>Quick Add</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
          <input style={inp} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <select style={sel} value={form.name} onChange={e => pickName(e.target.value)}>
            <option value="">— Category —</option>
            {TRANSACTION_TYPES.map(type => (
              <optgroup key={type} label={type}>
                {budgets.filter(b => b.type === type).map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </optgroup>
            ))}
          </select>
          <input style={inp} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} step="0.01" min="0" />
          <input style={inp} type="text" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          <button style={btn()} onClick={addToBatch}>+ Add</button>
        </div>
        {formError && <div style={{ marginTop: 10, padding: "8px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{formError}</div>}
        {batch.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 8 }}>{batch.length} pending transaction{batch.length > 1 ? "s" : ""}</div>
            <button style={btn()} onClick={commitBatch}>Save {batch.length}</button>
          </div>
        )}
      </div>

      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>Latest Transactions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {latestTxns.map(t => (
            <div key={t.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: t.type === "INCOME" ? C.green : C.text }}>{fmt(parseFloat(t.amount))}</div>
                  <span style={badge(t.type)}>{TYPE_META[t.type]?.label || t.type}</span>
                </div>
              </div>
            </div>
          ))}
          {latestTxns.length === 0 && <div style={{ fontSize: 13, color: C.muted }}>No transactions in this month yet.</div>}
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Desktop has full transaction tools</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>CSV import, transaction editing, filters, and deeper review are available on desktop.</div>
      </div>
    </div>
  );
}
