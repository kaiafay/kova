"use client";
import { useMemo, useState, useRef } from "react";
import { useBudget } from "@/lib/budget-context";

// ── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};

// ── Style helpers ──────────────────────────────────────────────────────────
const card = {
  background: C.surf, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const inp = {
  background: C.surf, border: `1px solid ${C.border}`, color: C.text,
  padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%",
  boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit",
};
const sel = { ...inp, cursor: "pointer" };
const btn = (v = "primary") => ({
  padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 600 as const, fontFamily: "inherit",
  whiteSpace: "nowrap" as const, transition: "all 0.12s",
  background: v === "primary" ? C.accent : v === "danger" ? "#fef2f2" : v === "ghost" ? "transparent" : "#f1f5f9",
  color: v === "primary" ? "#fff" : v === "danger" ? C.red : C.muted,
});
const th = {
  textAlign: "left" as const, padding: "8px 12px", color: C.subtle,
  fontSize: 11, fontWeight: 700 as const, textTransform: "uppercase" as const,
  letterSpacing: 0.5, borderBottom: `1px solid ${C.borderL}`,
};
const td = {
  padding: "9px 12px", borderBottom: `1px solid ${C.borderL}`,
  color: C.text, verticalAlign: "middle" as const,
};
const badge = (type: string) => ({
  display: "inline-block", padding: "2px 9px", borderRadius: 20,
  fontSize: 11, fontWeight: 700 as const,
  background: TYPE_META[type]?.bg || "#f1f5f9",
  color: TYPE_META[type]?.color || C.muted,
});
const tabBtn = (active: boolean) => ({
  padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 500 as const, fontFamily: "inherit",
  transition: "all 0.12s",
  background: active ? "#eff6ff" : "transparent",
  color: active ? C.accent : C.muted,
});

// ── Constants ──────────────────────────────────────────────────────────────
const TYPES = ["INCOME", "BILLS", "EXPENSES", "DEBT PAYMENT", "SUBSCRIPTIONS"];
const TYPE_META: Record<string, { color: string; bg: string; label: string }> = {
  "INCOME":        { color: "#16a34a", bg: "#dcfce7", label: "Income" },
  "BILLS":         { color: "#0284c7", bg: "#e0f2fe", label: "Bills" },
  "EXPENSES":      { color: "#7c3aed", bg: "#ede9fe", label: "Expenses" },
  "DEBT PAYMENT":  { color: "#dc2626", bg: "#fee2e2", label: "Debt" },
  "SUBSCRIPTIONS": { color: "#d97706", bg: "#fef3c7", label: "Subscriptions" },
};
const fmt = (n: number) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const todayStr = new Date().toISOString().slice(0, 10);

// ── CSV helpers ────────────────────────────────────────────────────────────
const MAX_CSV_BYTES = 5 * 1024 * 1024;

const parseWFDate = (str: string): string | null => {
  const clean = str.replace(/"/g, "").trim();
  const parts = clean.split("/");
  if (parts.length !== 3) return null;
  const mo = parseInt(parts[0], 10);
  const dy = parseInt(parts[1], 10);
  const yr = parseInt(parts[2], 10);
  if (isNaN(mo) || isNaN(dy) || isNaN(yr)) return null;
  if (mo < 1 || mo > 12 || dy < 1 || dy > 31 || yr < 2000 || yr > 2100) return null;
  return `${yr}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;
};
const parseWFCSV = (text: string) => {
  const lines = text.trim().split("\n").filter(l => l.trim());
  return lines.flatMap(line => {
    const cols = line.split(",").map(c => c.replace(/"/g, "").trim());
    const date = parseWFDate(cols[0]);
    if (!date) return [];
    const rawAmount = parseFloat(cols[1]);
    const desc = cols[4] || cols[3] || "Unknown";
    const amount = Math.abs(rawAmount);
    const suggestedType = rawAmount >= 0 ? "INCOME" : "EXPENSES";
    if (isNaN(amount) || amount <= 0) return [];
    return [{ date, amount, description: desc, suggestedType, rawAmount }];
  });
};

// ── Types ──────────────────────────────────────────────────────────────────
interface CsvRow {
  id: string;
  date: string;
  amount: number;
  description: string;
  suggestedType: string;
  rawAmount: number;
  category: string;
  type: string;
  notes: string;
  isDuplicate: boolean;
  selected: boolean;
}

interface BatchItem {
  id: string;
  date: string;
  name: string;
  type: string;
  amount: number;
  notes: string;
}

interface EditState {
  id: number;
  date: string;
  name: string;
  type: string;
  amount: string;
  notes: string;
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const {
    transactions, budgets, settings,
    filterMonth, setFilterMonth,
    addTransactions, deleteTransaction, updateTransaction, saveSettings,
  } = useBudget();

  // Build budgetMap from array
  const budgetMap = useMemo(() => {
    const m: Record<string, { budget: number; type: string }> = {};
    budgets.forEach(b => { m[b.name] = { budget: parseFloat(b.budgetAmount), type: b.type }; });
    return m;
  }, [budgets]);

  // Months available
  const months = useMemo(
    () => [...new Set(transactions.map(t => t.date.slice(0, 7)))].sort().reverse(),
    [transactions],
  );

  // Month-filtered transactions
  const monthTxns = useMemo(
    () => transactions.filter(t => t.date.startsWith(filterMonth)),
    [transactions, filterMonth],
  );

  // ── Manual entry state ───────────────────────────────────────────────────
  const [txnTab, setTxnTab] = useState<"manual" | "csv">("manual");
  const [form, setForm] = useState({ date: todayStr, name: "", type: "", amount: "", notes: "" });
  const [batch, setBatch] = useState<BatchItem[]>([]);

  const pickName = (name: string) => {
    setForm(f => ({ ...f, name, type: budgetMap[name]?.type || "" }));
  };

  const addToBatch = () => {
    if (!form.name || !form.amount || !form.date || !form.type) return;
    setBatch(b => [
      ...b,
      { ...form, amount: parseFloat(form.amount), id: `${Date.now()}-${Math.random()}` },
    ]);
    setForm(f => ({ ...f, name: "", type: "", amount: "", notes: "" }));
  };

  const commitBatch = async () => {
    if (!batch.length) return;
    await addTransactions(batch.map(b => ({
      date: b.date, name: b.name, type: b.type,
      amount: String(b.amount), notes: b.notes,
    })));
    setBatch([]);
  };

  // ── CSV state ────────────────────────────────────────────────────────────
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) {
      setCsvError(`File too large (max 5 MB). This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      e.target.value = "";
      return;
    }
    setCsvError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseWFCSV(text);
      const existingKeys = new Set(transactions.map(t => `${t.date}|${t.name}|${t.amount}`));
      const mapped: CsvRow[] = rows.map((r, i) => {
        const isDuplicate = existingKeys.has(`${r.date}|${r.description}|${r.amount}`);
        const category = settings.merchantMap[r.description] || "";
        const type = category
          ? (budgetMap[category]?.type || r.suggestedType)
          : r.suggestedType;
        return {
          ...r,
          id: `csv_${Date.now()}_${i}`,
          category,
          type,
          notes: r.description,
          isDuplicate,
          selected: !isDuplicate,
        };
      });
      setCsvRows(mapped);
    };
    reader.onerror = () => setCsvError("Failed to read file. Ensure it's a valid CSV.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const updateCsvRow = (id: string, field: string, value: string | boolean) => {
    setCsvRows(rows => rows.map(r => {
      if (r.id !== id) return r;
      const u = { ...r, [field]: value };
      if (field === "category") {
        u.type = budgetMap[value as string]?.type || r.suggestedType;
      }
      return u;
    }));
  };

  const applyToAllMatching = (desc: string, cat: string) => {
    setCsvRows(rows => rows.map(r =>
      r.description !== desc ? r : { ...r, category: cat, type: budgetMap[cat]?.type || r.suggestedType },
    ));
  };

  const commitCSV = async () => {
    const toImport = csvRows.filter(r => r.selected && r.category);
    if (!toImport.length) return;
    const newMap = { ...settings.merchantMap };
    toImport.forEach(r => { newMap[r.description] = r.category; });
    await saveSettings({ merchantMap: newMap });
    await addTransactions(toImport.map(r => ({
      date: r.date, name: r.category, type: r.type,
      amount: String(r.amount), notes: r.description,
    })));
    setCsvRows([]);
  };

  // ── Transaction log state ────────────────────────────────────────────────
  const [filterType, setFilterType] = useState("ALL");
  const [editingTxn, setEditingTxn] = useState<EditState | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);

  const filteredTxns = useMemo(
    () => [...monthTxns]
      .filter(t => filterType === "ALL" || t.type === filterType)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [monthTxns, filterType],
  );
  const latestTxns = useMemo(
    () => [...monthTxns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [monthTxns],
  );

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div className="kova-mobile-only">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Transactions</div>
          <select
            style={{
              background: C.surf, border: `1px solid ${C.border}`, color: C.text,
              padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
          }}>
            Quick Add
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            <input
              style={inp}
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
            <select style={sel} value={form.name} onChange={e => pickName(e.target.value)}>
              <option value="">— Category —</option>
              {TYPES.map(type => (
                <optgroup key={type} label={type}>
                  {budgets.filter(b => b.type === type).map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <input
              style={inp}
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              step="0.01"
              min="0"
            />
            <input
              style={inp}
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
            <button style={btn()} onClick={addToBatch}>+ Add</button>
          </div>

          {batch.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 8 }}>
                {batch.length} pending transaction{batch.length > 1 ? "s" : ""}
              </div>
              <button style={btn()} onClick={commitBatch}>
                Save {batch.length}
              </button>
            </div>
          )}
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
          }}>
            Latest Transactions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {latestTxns.map(t => (
              <div key={t.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: t.type === "INCOME" ? C.green : C.text }}>
                      {fmt(parseFloat(t.amount))}
                    </div>
                    <span style={badge(t.type)}>{TYPE_META[t.type]?.label || t.type}</span>
                  </div>
                </div>
              </div>
            ))}
            {latestTxns.length === 0 && (
              <div style={{ fontSize: 13, color: C.muted }}>No transactions in this month yet.</div>
            )}
          </div>
        </div>

        <div style={{ ...card, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Desktop has full transaction tools</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            CSV import, transaction editing, filters, and deeper review are available on desktop.
          </div>
        </div>
      </div>

      <div className="kova-desktop-only">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Transactions</div>
        <select
          style={{
            background: C.surf, border: `1px solid ${C.border}`, color: C.text,
            padding: "7px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* ── Tab switcher ────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: C.surf, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 4, width: "fit-content",
      }}>
        <button style={tabBtn(txnTab === "manual")} onClick={() => setTxnTab("manual")}>Manual Entry</button>
        <button style={tabBtn(txnTab === "csv")}    onClick={() => setTxnTab("csv")}>CSV Import</button>
      </div>

      {/* ── Manual Entry tab ────────────────────────────────────────────── */}
      {txnTab === "manual" && (
        <div style={card}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: C.muted,
            textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16,
          }}>
            Add Transactions
          </div>
          <div className="kova-txn-form-grid" style={{ gap: 10, marginBottom: batch.length ? 14 : 0 }}>
            <input
              style={inp}
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
            <select style={sel} value={form.name} onChange={e => pickName(e.target.value)}>
              <option value="">— Category —</option>
              {TYPES.map(type => (
                <optgroup key={type} label={type}>
                  {budgets.filter(b => b.type === type).map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div style={{
              display: "flex", alignItems: "center",
              padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: form.type ? TYPE_META[form.type]?.bg : "#f8fafc",
              color: form.type ? TYPE_META[form.type]?.color : C.subtle,
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            }}>
              {form.type ? TYPE_META[form.type]?.label : "Auto-fills →"}
            </div>
            <input
              style={inp}
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              step="0.01"
              min="0"
            />
            <input
              style={inp}
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
            <button style={btn()} onClick={addToBatch}>+ Add</button>
          </div>

          {batch.length > 0 && (
            <>
              <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 500, marginBottom: 8 }}>
                {batch.length} pending — review before saving
              </div>
              <div className="kova-table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                  <tbody>
                    {batch.map((b, i) => (
                      <tr key={b.id} style={{ background: "#f8fafc" }}>
                        <td style={td}>{b.date}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{b.name}</td>
                        <td style={td}>
                          <span style={badge(b.type)}>{TYPE_META[b.type]?.label || b.type}</span>
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{fmt(b.amount)}</td>
                        <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{b.notes}</td>
                        <td style={td}>
                          <button
                            style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setBatch(p => p.filter((_, j) => j !== i))}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={btn()} onClick={commitBatch}>
                Save {batch.length} Transaction{batch.length > 1 ? "s" : ""}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── CSV Import tab ───────────────────────────────────────────────── */}
      {txnTab === "csv" && (
        <>
          {csvError && (
            <div style={{ marginBottom: 12, padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
              {csvError}
            </div>
          )}
          {csvRows.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: C.text }}>
                Import from Wells Fargo
              </div>
              <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 20 }}>
                Download your transaction history as a CSV then upload it here.
              </div>
              <div style={{
                fontSize: 12, color: C.subtle, marginBottom: 20,
                background: "#f8fafc", border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 16px", display: "inline-block", textAlign: "left",
              }}>
                <strong>How to export:</strong> Sign in → Account Activity → Download Account Activity → CSV
              </div>
              <br />
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleCSVFile}
              />
              <button style={btn()} onClick={() => fileRef.current?.click()}>Upload CSV File</button>
            </div>
          )}

          {csvRows.length > 0 && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>
                    {csvRows.length} transactions parsed
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                    Assign categories below. Known merchants are auto-filled.
                    {csvRows.filter(r => r.isDuplicate).length > 0 && (
                      <span style={{ marginLeft: 8, color: C.amber, fontWeight: 600 }}>
                        {csvRows.filter(r => r.isDuplicate).length} possible duplicate
                        {csvRows.filter(r => r.isDuplicate).length > 1 ? "s" : ""} unchecked
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn("secondary")} onClick={() => setCsvRows([])}>Cancel</button>
                  <button style={btn()} onClick={commitCSV}>
                    Import {csvRows.filter(r => r.selected && r.category).length} Transactions
                  </button>
                </div>
              </div>

              <div className="kova-table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: 32 }}>
                        <input
                          type="checkbox"
                          checked={csvRows.every(r => r.selected)}
                          onChange={e => setCsvRows(rows => rows.map(r => ({ ...r, selected: e.target.checked })))}
                        />
                      </th>
                      <th style={th}>Date</th>
                      <th style={th}>Description</th>
                      <th style={{ ...th, textAlign: "right" }}>Amount</th>
                      <th style={th}>Category</th>
                      <th style={th}>Type</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map(row => (
                      <tr
                        key={row.id}
                        style={{
                          background: row.isDuplicate ? "#fffbeb" : row.selected ? "#fff" : "#f8fafc",
                          opacity: row.selected ? 1 : 0.5,
                        }}
                      >
                        <td style={td}>
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={e => updateCsvRow(row.id, "selected", e.target.checked)}
                          />
                        </td>
                        <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{row.date}</td>
                        <td style={{
                          ...td, fontSize: 12.5,
                          maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {row.description}
                          {row.isDuplicate && (
                            <span style={{
                              marginLeft: 6, padding: "1px 7px", borderRadius: 20,
                              fontSize: 10, fontWeight: 700,
                              background: "#fef3c7", color: C.amber,
                            }}>
                              Duplicate
                            </span>
                          )}
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(row.amount)}</td>
                        <td style={td}>
                          <select
                            style={{ ...sel, width: 150, padding: "5px 8px", fontSize: 12.5 }}
                            value={row.category}
                            onChange={e => updateCsvRow(row.id, "category", e.target.value)}
                          >
                            <option value="">— Assign —</option>
                            {TYPES.map(type => (
                              <optgroup key={type} label={type}>
                                {budgets.filter(b => b.type === type).map(b => (
                                  <option key={b.name} value={b.name}>{b.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td style={td}>
                          {row.type && (
                            <span style={badge(row.type)}>
                              {TYPE_META[row.type]?.label || row.type}
                            </span>
                          )}
                        </td>
                        <td style={td}>
                          {row.category && (
                            <button
                              style={{ ...btn("ghost"), padding: "3px 8px", fontSize: 11, color: C.accent, whiteSpace: "nowrap" }}
                              onClick={() => applyToAllMatching(row.description, row.category)}
                            >
                              Apply to all
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Transaction log (always shown) ──────────────────────────────── */}
      <div style={{ marginTop: 20 }}>
        {/* Type filter buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["ALL", ...TYPES].map(t => (
            <button
              key={t}
              style={{
                ...btn("ghost"), padding: "5px 14px", fontSize: 12.5,
                background: filterType === t ? C.accent : "#f1f5f9",
                color: filterType === t ? "#fff" : C.muted,
              }}
              onClick={() => setFilterType(t)}
            >
              {t === "ALL" ? "All" : TYPE_META[t]?.label || t}
            </button>
          ))}
        </div>

        <div style={card}>
          <div className="kova-table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Category</th>
                <th style={th}>Type</th>
                <th style={{ ...th, textAlign: "right" }}>Amount</th>
                <th style={th}>Notes</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.map(t => {
                if (editingTxn?.id === t.id) {
                  // ── Edit row ────────────────────────────────────────────
                  return (
                    <tr key={t.id} style={{ background: "#f8faff" }}>
                      <td style={td}>
                        <input
                          style={{ ...inp, padding: "5px 8px", width: 130 }}
                          type="date"
                          value={editingTxn.date}
                          onChange={e => setEditingTxn(x => x ? { ...x, date: e.target.value } : x)}
                        />
                      </td>
                      <td style={td}>
                        <select
                          style={{ ...sel, padding: "5px 8px", width: 150 }}
                          value={editingTxn.name}
                          onChange={e => {
                            const type = budgetMap[e.target.value]?.type || editingTxn.type;
                            setEditingTxn(x => x ? { ...x, name: e.target.value, type } : x);
                          }}
                        >
                          {TYPES.map(type => (
                            <optgroup key={type} label={type}>
                              {budgets.filter(b => b.type === type).map(b => (
                                <option key={b.name} value={b.name}>{b.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td style={td}>
                        <span style={badge(editingTxn.type)}>
                          {TYPE_META[editingTxn.type]?.label || editingTxn.type}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <input
                          style={{ ...inp, padding: "5px 8px", width: 90, textAlign: "right" }}
                          type="number"
                          step="0.01"
                          value={editingTxn.amount}
                          onChange={e => setEditingTxn(x => x ? { ...x, amount: e.target.value } : x)}
                        />
                      </td>
                      <td style={td}>
                        <input
                          style={{ ...inp, padding: "5px 8px" }}
                          type="text"
                          value={editingTxn.notes}
                          onChange={e => setEditingTxn(x => x ? { ...x, notes: e.target.value } : x)}
                        />
                      </td>
                      <td style={td}>
                        <span style={{ display: "flex", gap: 6 }}>
                          <button
                            style={{ ...btn(), padding: "4px 12px", fontSize: 12 }}
                            onClick={async () => {
                              if (!editingTxn) return;
                              await updateTransaction(editingTxn.id, {
                                date: editingTxn.date,
                                name: editingTxn.name,
                                type: editingTxn.type,
                                amount: String(parseFloat(editingTxn.amount) || 0),
                                notes: editingTxn.notes,
                              });
                              setEditingTxn(null);
                            }}
                          >
                            Save
                          </button>
                          <button
                            style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setEditingTxn(null)}
                          >
                            Cancel
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                }

                // ── View row ──────────────────────────────────────────────
                return (
                  <tr key={t.id}>
                    <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{t.date}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{t.name}</td>
                    <td style={td}>
                      <span style={badge(t.type)}>{TYPE_META[t.type]?.label || t.type}</span>
                    </td>
                    <td style={{
                      ...td, textAlign: "right", fontWeight: 700,
                      color: t.type === "INCOME" ? C.green : C.text,
                    }}>
                      {fmt(parseFloat(t.amount))}
                    </td>
                    <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{t.notes}</td>
                    <td style={td}>
                      {delConfirm === t.id ? (
                        <span style={{ display: "flex", gap: 6 }}>
                          <button
                            style={{ ...btn("danger"), padding: "4px 10px", fontSize: 12 }}
                            onClick={async () => {
                              await deleteTransaction(t.id);
                              setDelConfirm(null);
                            }}
                          >
                            Delete
                          </button>
                          <button
                            style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }}
                            onClick={() => setDelConfirm(null)}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span style={{ display: "flex", gap: 4 }}>
                          <button
                            style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.subtle }}
                            title="Edit"
                            onClick={() => setEditingTxn({
                              id: t.id,
                              date: t.date,
                              name: t.name,
                              type: t.type,
                              amount: t.amount,
                              notes: t.notes,
                            })}
                          >
                            <svg
                              width="13" height="13" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.subtle }}
                            onClick={() => setDelConfirm(t.id)}
                          >
                            ✕
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
