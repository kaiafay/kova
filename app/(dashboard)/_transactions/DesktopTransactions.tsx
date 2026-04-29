"use client";
import { useMemo, useState, useRef } from "react";
import { DatePickerField } from "@/components/date-picker-field";
import { MonthPicker } from "@/components/month-picker";
import { SelectPicker } from "@/components/select-picker";
import { useTransactionsData } from "./use-transactions-data";
import { TRANSACTION_TYPES, TYPE_META as TYPE_META_STRICT } from "@/lib/transaction-types";
const TYPE_META: Record<string, { color: string; bg: string; label: string }> = TYPE_META_STRICT;

const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};
const card = { background: C.surf, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const inp = { background: C.surf, border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%", boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit" };
const btn = (v = "primary") => ({
  padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 600 as const, fontFamily: "inherit",
  whiteSpace: "nowrap" as const, transition: "all 0.12s",
  background: v === "primary" ? C.accent : v === "danger" ? "#fef2f2" : v === "ghost" ? "transparent" : "#f1f5f9",
  color: v === "primary" ? "#fff" : v === "danger" ? C.red : C.muted,
});
const th = { textAlign: "left" as const, padding: "8px 12px", color: C.subtle, fontSize: 11, fontWeight: 700 as const, textTransform: "uppercase" as const, letterSpacing: 0.5, borderBottom: `1px solid ${C.borderL}` };
const td = { padding: "9px 12px", borderBottom: `1px solid ${C.borderL}`, color: C.text, verticalAlign: "middle" as const };
const tabBtn = (active: boolean) => ({ padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 500 as const, fontFamily: "inherit", transition: "all 0.12s", background: active ? "#eff6ff" : "transparent", color: active ? C.accent : C.muted });

const fmt = (n: number) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const badge = (type: string) => ({ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 as const, background: TYPE_META[type]?.bg || "#f1f5f9", color: TYPE_META[type]?.color || C.muted });

const todayStr = new Date().toISOString().slice(0, 10);
const MAX_CSV_BYTES = 5 * 1024 * 1024;

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

const parseFlexDate = (str: string): string | null => {
  const clean = str.replace(/"/g, "").trim();
  const mdy = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const mo = parseInt(mdy[1], 10), dy = parseInt(mdy[2], 10), yr = parseInt(mdy[3], 10);
    if (mo >= 1 && mo <= 12 && dy >= 1 && dy <= 31 && yr >= 2000 && yr <= 2100)
      return `${yr}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;
  }
  const ymd = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const yr = parseInt(ymd[1], 10), mo = parseInt(ymd[2], 10), dy = parseInt(ymd[3], 10);
    if (mo >= 1 && mo <= 12 && dy >= 1 && dy <= 31 && yr >= 2000 && yr <= 2100)
      return `${yr}-${String(mo).padStart(2, "0")}-${String(dy).padStart(2, "0")}`;
  }
  return null;
};

const DATE_HEADERS = ["date", "transaction date", "posted date", "post date"];
const AMOUNT_HEADERS = ["amount"];
const DEBIT_HEADERS = ["debit"];
const CREDIT_HEADERS = ["credit"];
const DESC_HEADERS = ["description", "merchant", "payee", "memo", "name"];

interface ColMap { dateIdx: number; descIdx: number; amountIdx: number; debitIdx: number; creditIdx: number }

const detectColumns = (headers: string[]): ColMap | null => {
  const norm = headers.map(h => h.toLowerCase().trim());
  const find = (names: string[]) => { for (const n of names) { const i = norm.indexOf(n); if (i !== -1) return i; } return -1; };
  const dateIdx = find(DATE_HEADERS);
  const descIdx = find(DESC_HEADERS);
  if (dateIdx === -1 || descIdx === -1) return null;
  const amountIdx = find(AMOUNT_HEADERS);
  const debitIdx = find(DEBIT_HEADERS);
  const creditIdx = find(CREDIT_HEADERS);
  if (amountIdx === -1 && (debitIdx === -1 || creditIdx === -1)) return null;
  return { dateIdx, descIdx, amountIdx, debitIdx, creditIdx };
};

type ParsedRow = { date: string; amount: number; description: string; suggestedType: string; rawAmount: number };
type ParseResult = ParsedRow[] | { error: string };

const parseBankCSV = (text: string): ParseResult => {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return { error: "CSV file appears empty or has only one row." };
  const headers = parseCSVLine(lines[0]);
  const colMap = detectColumns(headers);
  if (!colMap) return { error: "Could not detect required columns. Supported formats: Wells Fargo, Chase, Bank of America, Capital One. Ensure your CSV has a header row with recognizable column names (Date, Amount/Debit/Credit, Description)." };
  const results: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const date = parseFlexDate(cols[colMap.dateIdx] || "");
    if (!date) continue;
    let rawAmount: number;
    if (colMap.amountIdx !== -1) {
      rawAmount = parseFloat((cols[colMap.amountIdx] || "0").replace(/[$,]/g, ""));
    } else {
      const debit = parseFloat((cols[colMap.debitIdx] || "0").replace(/[$,]/g, "")) || 0;
      const credit = parseFloat((cols[colMap.creditIdx] || "0").replace(/[$,]/g, "")) || 0;
      rawAmount = credit - debit;
    }
    if (isNaN(rawAmount)) continue;
    const amount = Math.abs(rawAmount);
    if (amount <= 0) continue;
    const description = cols[colMap.descIdx] || "Unknown";
    results.push({ date, amount, description, suggestedType: rawAmount >= 0 ? "INCOME" : "EXPENSES", rawAmount });
  }
  return results;
};

interface CsvRow { id: string; date: string; amount: number; description: string; suggestedType: string; rawAmount: number; category: string; type: string; notes: string; isDuplicate: boolean; selected: boolean }
interface BatchItem { id: string; date: string; name: string; type: string; amount: number; notes: string }
interface EditState { id: number; date: string; name: string; type: string; amount: string; notes: string }

export function DesktopTransactions() {
  const {
    transactions, budgets, settings,
    filterMonth, setFilterMonth, months, monthTxns,
    addTransactions, deleteTransaction, updateTransaction, saveSettings,
  } = useTransactionsData();

  const budgetMap = useMemo(() => {
    const m: Record<string, { budget: number; type: string }> = {};
    budgets.forEach(b => { m[b.name] = { budget: parseFloat(b.budgetAmount), type: b.type }; });
    return m;
  }, [budgets]);

  const categoryGroups = useMemo(
    () =>
      TRANSACTION_TYPES.map(type => ({
        label: TYPE_META[type]?.label ?? type,
        options: budgets
          .filter(b => b.type === type)
          .map(b => ({ value: b.name, label: b.name })),
      })),
    [budgets],
  );

  const [txnTab, setTxnTab] = useState<"manual" | "csv">("manual");
  const [form, setForm] = useState({ date: todayStr, name: "", type: "", amount: "", notes: "" });
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const pickName = (name: string) => { setForm(f => ({ ...f, name, type: budgetMap[name]?.type || "" })); setFormError(null); };
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

  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) { setCsvError(`File too large (max 5 MB). This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`); e.target.value = ""; return; }
    setCsvError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseBankCSV(text);
      if ("error" in parsed) { setCsvError(parsed.error); return; }
      const rows = parsed;
      const existingKeys = new Set(transactions.map(t => `${t.date}|${t.notes}|${t.amount}`));
      setCsvRows(rows.map((r, i) => {
        const isDuplicate = existingKeys.has(`${r.date}|${r.description}|${r.amount}`);
        const category = settings.merchantMap[r.description] || "Uncategorized";
        const type = budgetMap[category]?.type || r.suggestedType;
        return { ...r, id: `csv_${Date.now()}_${i}`, category, type, notes: r.description, isDuplicate, selected: !isDuplicate };
      }));
    };
    reader.onerror = () => setCsvError("Failed to read file. Ensure it's a valid CSV.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const updateCsvRow = (id: string, field: string, value: string | boolean) => {
    setCsvRows(rows => rows.map(r => {
      if (r.id !== id) return r;
      const u = { ...r, [field]: value };
      if (field === "category") u.type = budgetMap[value as string]?.type || r.suggestedType;
      return u;
    }));
  };
  const applyToAllMatching = (desc: string, cat: string) => {
    setCsvRows(rows => rows.map(r => r.description !== desc ? r : { ...r, category: cat, type: budgetMap[cat]?.type || r.suggestedType }));
  };
  const commitCSV = async () => {
    const toImport = csvRows.filter(r => r.selected);
    if (!toImport.length) return;
    const newMap = { ...settings.merchantMap };
    toImport.forEach(r => { newMap[r.description] = r.category; });
    await saveSettings({ merchantMap: newMap });
    await addTransactions(toImport.map(r => ({ date: r.date, name: r.category, type: r.type, amount: String(r.amount), notes: r.description })));
    setCsvRows([]);
  };

  const [filterType, setFilterType] = useState("ALL");
  const [editingTxn, setEditingTxn] = useState<EditState | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);

  const filteredTxns = useMemo(
    () => [...monthTxns].filter(t => filterType === "ALL" || t.type === filterType).sort((a, b) => b.date.localeCompare(a.date)),
    [monthTxns, filterType],
  );

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Transactions</div>
        <MonthPicker months={months} value={filterMonth} onChange={setFilterMonth} menuAlign="end" />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.surf, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
        <button style={tabBtn(txnTab === "manual")} onClick={() => setTxnTab("manual")}>Manual Entry</button>
        <button style={tabBtn(txnTab === "csv")} onClick={() => setTxnTab("csv")}>CSV Import</button>
      </div>

      {txnTab === "manual" && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>Add Transactions</div>
          <div className="kova-txn-form-grid" style={{ gap: 10, marginBottom: batch.length ? 14 : 0 }}>
            <DatePickerField value={form.date} onChange={d => setForm(f => ({ ...f, date: d }))} menuAlign="end" style={{ flex: "0 0 150px", minWidth: 130 }} />
            <SelectPicker
              value={form.name}
              onChange={v => pickName(v)}
              groups={categoryGroups}
              allowEmpty
              emptyLabel="— Category —"
              menuAlign="start"
              style={{ flex: "0 0 190px", minWidth: 160 }}
            />
            <div style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: form.type ? TYPE_META[form.type]?.bg : "#f8fafc", color: form.type ? TYPE_META[form.type]?.color : C.subtle, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flex: "0 0 auto" }}>
              {form.type ? TYPE_META[form.type]?.label : "Auto-fills →"}
            </div>
            <input style={{ ...inp, flex: "0 0 130px", minWidth: 110 }} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} step="0.01" min="0" />
            <input style={{ ...inp, flex: "1 1 200px", minWidth: 160 }} type="text" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <button style={{ ...btn(), flex: "0 0 auto" }} onClick={addToBatch}>+ Add</button>
          </div>
          {formError && <div style={{ marginTop: 8, padding: "8px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{formError}</div>}
          {batch.length > 0 && (
            <>
              <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 500, marginBottom: 8 }}>{batch.length} pending — review before saving</div>
              <div className="kova-table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                  <tbody>
                    {batch.map((b, i) => (
                      <tr key={b.id} style={{ background: "#f8fafc" }}>
                        <td style={td}>{b.date}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{b.name}</td>
                        <td style={td}><span style={badge(b.type)}>{TYPE_META[b.type]?.label || b.type}</span></td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{fmt(b.amount)}</td>
                        <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{b.notes}</td>
                        <td style={td}><button style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => setBatch(p => p.filter((_, j) => j !== i))}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={btn()} onClick={commitBatch}>Save {batch.length} Transaction{batch.length > 1 ? "s" : ""}</button>
            </>
          )}
        </div>
      )}

      {txnTab === "csv" && (
        <>
          {csvError && <div style={{ marginBottom: 12, padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{csvError}</div>}
          {csvRows.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: C.text }}>Import Bank Transactions</div>
              <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 20 }}>Upload a CSV export from your bank. Supported: Wells Fargo, Chase, Bank of America, Capital One, and others with standard headers.</div>
              <br />
              <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVFile} />
              <button style={btn()} onClick={() => fileRef.current?.click()}>Upload CSV File</button>
            </div>
          )}
          {csvRows.length > 0 && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{csvRows.length} transactions parsed</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                    Assign categories below. Known merchants are auto-filled.
                    {csvRows.filter(r => r.isDuplicate).length > 0 && <span style={{ marginLeft: 8, color: C.amber, fontWeight: 600 }}>{csvRows.filter(r => r.isDuplicate).length} possible duplicate{csvRows.filter(r => r.isDuplicate).length > 1 ? "s" : ""} unchecked</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn("secondary")} onClick={() => setCsvRows([])}>Cancel</button>
                  <button style={btn()} onClick={commitCSV}>Import {csvRows.filter(r => r.selected).length} Transactions</button>
                </div>
              </div>
              <div className="kova-table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: 32 }}><input type="checkbox" checked={csvRows.every(r => r.selected)} onChange={e => setCsvRows(rows => rows.map(r => ({ ...r, selected: e.target.checked })))} /></th>
                      <th style={th}>Date</th><th style={th}>Description</th><th style={{ ...th, textAlign: "right" }}>Amount</th><th style={th}>Category</th><th style={th}>Type</th><th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map(row => (
                      <tr key={row.id} style={{ background: row.isDuplicate ? "#fffbeb" : row.selected ? "#fff" : "#f8fafc", opacity: row.selected ? 1 : 0.5 }}>
                        <td style={td}><input type="checkbox" checked={row.selected} onChange={e => updateCsvRow(row.id, "selected", e.target.checked)} /></td>
                        <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{row.date}</td>
                        <td style={{ ...td, fontSize: 12.5, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.description}
                          {row.isDuplicate && <span style={{ marginLeft: 6, padding: "1px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fef3c7", color: C.amber }}>Duplicate</span>}
                        </td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{fmt(row.amount)}</td>
                        <td style={td}>
                          <SelectPicker
                            value={row.category}
                            onChange={v => updateCsvRow(row.id, "category", v)}
                            groups={categoryGroups}
                            allowEmpty
                            emptyLabel="— Assign —"
                            size="sm"
                            menuAlign="start"
                            style={{ width: 150 }}
                          />
                        </td>
                        <td style={td}>{row.type && <span style={badge(row.type)}>{TYPE_META[row.type]?.label || row.type}</span>}</td>
                        <td style={td}>{row.category && csvRows.some(r => r.description === row.description && r.id !== row.id && r.category !== row.category) && (
                          <button style={{ ...btn("ghost"), padding: "3px 8px", fontSize: 11, color: C.accent, whiteSpace: "nowrap" }} onClick={() => applyToAllMatching(row.description, row.category)}>Apply to all</button>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["ALL", ...TRANSACTION_TYPES].map(t => (
            <button key={t} style={{ ...btn("ghost"), padding: "5px 14px", fontSize: 12.5, background: filterType === t ? C.accent : "#f1f5f9", color: filterType === t ? "#fff" : C.muted }} onClick={() => setFilterType(t)}>
              {t === "ALL" ? "All" : TYPE_META[t]?.label || t}
            </button>
          ))}
        </div>
        <div style={card}>
          <div className="kova-table-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead><tr><th style={th}>Date</th><th style={th}>Category</th><th style={th}>Type</th><th style={{ ...th, textAlign: "right" }}>Amount</th><th style={th}>Notes</th><th style={th}></th></tr></thead>
              <tbody>
                {filteredTxns.map(t => {
                  if (editingTxn?.id === t.id) {
                    return (
                      <tr key={t.id} style={{ background: "#f8faff" }}>
                        <td style={td}><DatePickerField size="sm" value={editingTxn.date} onChange={d => setEditingTxn(x => x ? { ...x, date: d } : x)} menuAlign="end" style={{ width: 130 }} /></td>
                        <td style={td}>
                          <SelectPicker
                            value={editingTxn.name}
                            onChange={v => {
                              const type = budgetMap[v]?.type || editingTxn.type;
                              setEditingTxn(x => x ? { ...x, name: v, type } : x);
                            }}
                            groups={categoryGroups}
                            size="sm"
                            menuAlign="start"
                            style={{ width: 150 }}
                          />
                        </td>
                        <td style={td}><span style={badge(editingTxn.type)}>{TYPE_META[editingTxn.type]?.label || editingTxn.type}</span></td>
                        <td style={{ ...td, textAlign: "right" }}><input style={{ ...inp, padding: "5px 8px", width: 90, textAlign: "right" }} type="number" step="0.01" value={editingTxn.amount} onChange={e => setEditingTxn(x => x ? { ...x, amount: e.target.value } : x)} /></td>
                        <td style={td}><input style={{ ...inp, padding: "5px 8px" }} type="text" value={editingTxn.notes} onChange={e => setEditingTxn(x => x ? { ...x, notes: e.target.value } : x)} /></td>
                        <td style={td}>
                          <span style={{ display: "flex", gap: 6 }}>
                            <button style={{ ...btn(), padding: "4px 12px", fontSize: 12 }} onClick={async () => { if (!editingTxn) return; await updateTransaction(editingTxn.id, { date: editingTxn.date, name: editingTxn.name, type: editingTxn.type, amount: String(parseFloat(editingTxn.amount) || 0), notes: editingTxn.notes }); setEditingTxn(null); }}>Save</button>
                            <button style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => setEditingTxn(null)}>Cancel</button>
                          </span>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={t.id}>
                      <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{t.date}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{t.name}</td>
                      <td style={td}><span style={badge(t.type)}>{TYPE_META[t.type]?.label || t.type}</span></td>
                      <td style={{ ...td, textAlign: "right", fontWeight: 700, color: t.type === "INCOME" ? C.green : C.text }}>{fmt(parseFloat(t.amount))}</td>
                      <td style={{ ...td, color: C.muted, fontSize: 12.5 }}>{t.notes}</td>
                      <td style={td}>
                        {delConfirm === t.id ? (
                          <span style={{ display: "flex", gap: 6 }}>
                            <button style={{ ...btn("danger"), padding: "4px 10px", fontSize: 12 }} onClick={async () => { await deleteTransaction(t.id); setDelConfirm(null); }}>Delete</button>
                            <button style={{ ...btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => setDelConfirm(null)}>Cancel</button>
                          </span>
                        ) : (
                          <span style={{ display: "flex", gap: 4 }}>
                            <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.subtle }} title="Edit" onClick={() => setEditingTxn({ id: t.id, date: t.date, name: t.name, type: t.type, amount: t.amount, notes: t.notes })}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button style={{ ...btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.subtle }} onClick={() => setDelConfirm(t.id)}>✕</button>
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
  );
}
