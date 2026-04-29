"use client";
import { useMemo, useState } from "react";
import { SelectPicker } from "@/components/select-picker";
import { useBudget } from "@/lib/budget-context";
import { TRANSACTION_TYPES, TYPE_META as TYPE_META_STRICT } from "@/lib/transaction-types";
const TYPE_META: Record<string, { color: string; bg: string; label: string }> = TYPE_META_STRICT;

const C = {
  bg: "#f8fafc", surf: "#ffffff", border: "#e2e8f0", borderL: "#f1f5f9",
  text: "#0f172a", muted: "#64748b", subtle: "#94a3b8",
  green: "#16a34a", red: "#dc2626", accent: "#2563eb", amber: "#d97706",
};

const card = {
  background: C.surf, border: `1px solid ${C.border}`,
  borderRadius: 12, padding: 22, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
};
const inp = {
  background: C.surf, border: `1px solid ${C.border}`, color: C.text,
  padding: "9px 12px", borderRadius: 8, fontSize: 13.5, width: "100%",
  boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit",
};
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
const tabBtn = (active: boolean) => ({
  padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer",
  fontSize: 13.5, fontWeight: 500 as const, fontFamily: "inherit",
  transition: "all 0.12s",
  background: active ? "#eff6ff" : "transparent",
  color: active ? C.accent : C.muted,
});

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const sectionHead = (type: string) => (
  <div style={{
    fontSize: 12, fontWeight: 700, color: TYPE_META[type].color,
    textTransform: "uppercase" as const, letterSpacing: 0.6, marginBottom: 12,
    display: "flex", alignItems: "center", gap: 6, paddingBottom: 10,
    borderBottom: `2px solid ${TYPE_META[type].bg}`,
  }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_META[type].color, display: "inline-block", flexShrink: 0 }} />
    {TYPE_META[type].label}
  </div>
);

function SavedBadge() {
  return (
    <span style={{ marginLeft: 10, fontSize: 12, color: C.green, fontWeight: 600, background: "#dcfce7", borderRadius: 20, padding: "2px 10px" }}>
      Saved
    </span>
  );
}

type TargetRow = { name: string; type: string; budgetAmount: string; dueDay: number | null; startingBalance: string | null };

function BudgetTargetsTab() {
  const { budgets, upsertBudget } = useBudget();
  const [rows, setRows] = useState<TargetRow[]>(() =>
    budgets.map(b => ({ name: b.name, type: b.type, budgetAmount: b.budgetAmount, dueDay: b.dueDay, startingBalance: b.startingBalance }))
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const budgetKeys = budgets.map(b => b.name + b.type).join(",");
  useMemo(() => {
    setRows(budgets.map(b => ({ name: b.name, type: b.type, budgetAmount: b.budgetAmount, dueDay: b.dueDay, startingBalance: b.startingBalance })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetKeys]);

  const updateRow = (name: string, field: keyof TargetRow, value: string | number | null) => {
    setRows(prev => prev.map(r => r.name === name ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    try {
      const results = await Promise.allSettled(
        rows.map(r => upsertBudget({ name: r.name, type: r.type, budgetAmount: r.budgetAmount || "0", dueDay: r.dueDay, startingBalance: r.startingBalance }))
      );
      const failures = results.filter(r => r.status === "rejected").length;
      if (failures > 0) setSaveError(`${failures} budget${failures > 1 ? "s" : ""} failed to save. Please try again.`);
      else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Budget Targets</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Set monthly budget amounts for each category. Bills can also have a due day.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {saved && <SavedBadge />}
          <button style={btn()} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Budget Targets"}</button>
        </div>
      </div>
      {saveError && <div style={{ marginBottom: 16, padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{saveError}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {TRANSACTION_TYPES.map(type => {
          const typeRows = rows.filter(r => r.type === type);
          if (typeRows.length === 0) return null;
          return (
            <div key={type} style={card}>
              {sectionHead(type)}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Category</th><th style={th}>Monthly Target</th>{type === "BILLS" && <th style={th}>Due Day</th>}</tr></thead>
                <tbody>
                  {typeRows.map(row => (
                    <tr key={row.name}>
                      <td style={{ ...td, fontWeight: 600 }}>{row.name}</td>
                      <td style={td}>
                        <div style={{ position: "relative", maxWidth: 160 }}>
                          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13.5, pointerEvents: "none" }}>$</span>
                          <input type="number" min={0} step={1} style={{ ...inp, paddingLeft: 22, maxWidth: 160 }} value={row.budgetAmount} onChange={e => updateRow(row.name, "budgetAmount", e.target.value)} />
                        </div>
                      </td>
                      {type === "BILLS" && (
                        <td style={td}>
                          <input type="number" min={1} max={31} step={1} placeholder="e.g. 15" style={{ ...inp, maxWidth: 80 }} value={row.dueDay ?? ""} onChange={e => updateRow(row.name, "dueDay", e.target.value ? parseInt(e.target.value) : null)} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 40px", color: C.muted }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: C.text }}>No categories yet</div>
            <div style={{ fontSize: 13 }}>Add categories in the Categories tab to set budget targets.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { budgets, upsertBudget } = useBudget();
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("EXPENSES");
  const [newAmount, setNewAmount] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) { setAddError("Category name is required."); return; }
    if (!newAmount || isNaN(parseFloat(newAmount))) { setAddError("Enter a valid budget amount."); return; }
    const exists = budgets.some(b => b.name.toLowerCase() === trimmed.toLowerCase() && b.type === newType);
    if (exists) { setAddError("A category with this name and type already exists."); return; }
    setAdding(true); setAddError("");
    try {
      await upsertBudget({ name: trimmed, type: newType, budgetAmount: newAmount, dueDay: null, startingBalance: null });
      setNewName(""); setNewAmount("");
    } finally { setAdding(false); }
  };

  const grouped = useMemo(() => {
    const g: Record<string, typeof budgets> = {};
    TRANSACTION_TYPES.forEach(t => { g[t] = []; });
    budgets.forEach(b => { if (g[b.type]) g[b.type].push(b); });
    return g;
  }, [budgets]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>Categories</div>
        <div style={{ fontSize: 13, color: C.muted }}>Add new categories. To remove a category, set its budget amount to 0 in Budget Targets.</div>
      </div>
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>Add New Category</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "2 1 160px", minWidth: 140 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Name</label>
            <input style={inp} type="text" placeholder="e.g. Netflix" value={newName} onChange={e => { setNewName(e.target.value); setAddError(""); }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
          </div>
          <div style={{ flex: "1 1 140px", minWidth: 130 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Type</label>
            <SelectPicker
              value={newType}
              onChange={setNewType}
              options={TRANSACTION_TYPES.map(t => ({ value: t, label: TYPE_META[t].label }))}
              menuAlign="start"
              triggerStyle={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: "1 1 120px", minWidth: 110 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: "block", marginBottom: 5 }}>Monthly Budget</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13.5, pointerEvents: "none" }}>$</span>
              <input style={{ ...inp, paddingLeft: 22 }} type="number" min={0} step={1} placeholder="0" value={newAmount} onChange={e => { setNewAmount(e.target.value); setAddError(""); }} onKeyDown={e => e.key === "Enter" && handleAdd()} />
            </div>
          </div>
          <div style={{ flexShrink: 0, paddingBottom: 1 }}>
            <button style={btn()} onClick={handleAdd} disabled={adding}>{adding ? "Adding…" : "Add Category"}</button>
          </div>
        </div>
        {addError && <div style={{ fontSize: 12.5, color: C.red, marginTop: 8 }}>{addError}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {TRANSACTION_TYPES.map(type => {
          const cats = grouped[type];
          if (cats.length === 0) return null;
          return (
            <div key={type} style={card}>
              {sectionHead(type)}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={th}>Name</th><th style={th}>Monthly Budget</th>{type === "BILLS" && <th style={th}>Due Day</th>}<th style={{ ...th, textAlign: "right" as const }}>Status</th></tr></thead>
                <tbody>
                  {cats.map(b => (
                    <tr key={b.name}>
                      <td style={{ ...td, fontWeight: 600 }}>{b.name}</td>
                      <td style={td}>${Number(b.budgetAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      {type === "BILLS" && <td style={{ ...td, color: C.muted }}>{b.dueDay ? `Day ${b.dueDay}` : "—"}</td>}
                      <td style={{ ...td, textAlign: "right" as const }}>
                        {parseFloat(b.budgetAmount) === 0
                          ? <span style={{ fontSize: 11, background: "#fef2f2", color: C.red, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>Inactive</span>
                          : <span style={{ fontSize: 11, background: "#dcfce7", color: C.green, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>Active</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 12, color: C.subtle, marginTop: 10 }}>To remove a category, set its budget to $0 in Budget Targets.</div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: "48px 40px", color: C.muted }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No categories yet</div>
            <div style={{ fontSize: 13 }}>Add your first category above.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DebtBalancesTab() {
  const { budgets, upsertBudget } = useBudget();
  const debtBudgets = useMemo(() => budgets.filter(b => b.type === "DEBT PAYMENT"), [budgets]);

  type BalanceRow = { name: string; type: string; budgetAmount: string; dueDay: number | null; startingBalance: string };
  const [rows, setRows] = useState<BalanceRow[]>(() =>
    debtBudgets.map(b => ({ name: b.name, type: b.type, budgetAmount: b.budgetAmount, dueDay: b.dueDay, startingBalance: b.startingBalance ?? "0" }))
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const debtKeys = debtBudgets.map(b => b.name).join(",");
  useMemo(() => {
    setRows(debtBudgets.map(b => ({ name: b.name, type: b.type, budgetAmount: b.budgetAmount, dueDay: b.dueDay, startingBalance: b.startingBalance ?? "0" })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debtKeys]);

  const updateBalance = (name: string, value: string) => {
    setRows(prev => prev.map(r => r.name === name ? { ...r, startingBalance: value } : r));
    setSaved(false);
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    try {
      const results = await Promise.allSettled(
        rows.map(r => upsertBudget({ name: r.name, type: r.type, budgetAmount: r.budgetAmount, dueDay: r.dueDay, startingBalance: r.startingBalance || "0" }))
      );
      const failures = results.filter(r => r.status === "rejected").length;
      if (failures > 0) setSaveError(`${failures} balance${failures > 1 ? "s" : ""} failed to save. Please try again.`);
      else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Debt Balances</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Set the starting balance for each debt account to track payoff progress.</div>
        </div>
        {rows.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saved && <SavedBadge />}
            <button style={btn()} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Starting Balances"}</button>
          </div>
        )}
      </div>
      {saveError && <div style={{ marginBottom: 16, padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>{saveError}</div>}
      {rows.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "48px 40px", color: C.muted }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No debt categories</div>
          <div style={{ fontSize: 13 }}>Add a &ldquo;Debt Payment&rdquo; category in the Categories tab to track balances here.</div>
        </div>
      ) : (
        <div style={card}>
          {sectionHead("DEBT PAYMENT")}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>Account / Category</th><th style={th}>Monthly Payment</th><th style={th}>Starting Balance</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.name}>
                  <td style={{ ...td, fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...td, color: C.muted }}>${Number(row.budgetAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</td>
                  <td style={td}>
                    <div style={{ position: "relative", maxWidth: 180 }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13.5, pointerEvents: "none" }}>$</span>
                      <input type="number" min={0} step={1} style={{ ...inp, paddingLeft: 22, maxWidth: 180 }} value={row.startingBalance} onChange={e => updateBalance(row.name, e.target.value)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#eff6ff", borderRadius: 8, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            <strong style={{ color: C.accent }}>Tip:</strong> The starting balance is the total amount owed at the start of tracking. Kova uses this alongside your debt payments to calculate payoff progress on the dashboard.
          </div>
        </div>
      )}
    </div>
  );
}

function CheckinDayTab() {
  const { settings, saveSettings } = useBudget();
  const [selected, setSelected] = useState(settings.checkinDay);
  const [startingBalanceDraft, setStartingBalanceDraft] = useState(String(settings.startingBalance ?? 0));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({ checkinDay: selected, startingBalance: parseFloat(startingBalanceDraft) || 0 });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>Check-in Day</div>
        <div style={{ fontSize: 13, color: C.muted }}>Choose which day of the week Kova automatically opens the check-in modal.</div>
      </div>
      <div style={{ ...card, maxWidth: 520 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>Select a day</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 20 }}>
          {DAYS_SHORT.map((d, i) => (
            <button key={d} style={{ padding: "10px 0", borderRadius: 8, border: `1.5px solid ${i === selected ? C.accent : "#f1f5f9"}`, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: i === selected ? 700 : 500, transition: "all 0.12s", background: i === selected ? "#eff6ff" : C.bg, color: i === selected ? C.accent : C.muted, textAlign: "center" as const }} onClick={() => { setSelected(i); setSaved(false); }}>
              {d}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 18, padding: "12px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13.5, color: C.text }}>
            <span style={{ fontWeight: 600 }}>Currently set to: </span>
            <span style={{ color: C.accent, fontWeight: 700 }}>{DAYS_FULL[selected]}</span>
          </div>
          {selected !== settings.checkinDay && <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>Unsaved change — was {DAYS_FULL[settings.checkinDay]}.</div>}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Balance Trend — Starting Balance</div>
          <div style={{ position: "relative", maxWidth: 200 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13.5, pointerEvents: "none" }}>$</span>
            <input type="number" min={0} step={0.01} style={{ ...inp, paddingLeft: 22, maxWidth: 200 }} value={startingBalanceDraft} onChange={e => { setStartingBalanceDraft(e.target.value); setSaved(false); }} />
          </div>
          <div style={{ fontSize: 12, color: C.subtle, marginTop: 6 }}>Used as the opening balance for the monthly balance trend chart on the dashboard.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={btn()} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</button>
          {saved && <SavedBadge />}
        </div>
        <div style={{ marginTop: 16, fontSize: 12.5, color: C.subtle, lineHeight: 1.6 }}>
          On {DAYS_FULL[selected]}s, the check-in modal opens automatically when you visit the dashboard (once per week). You can also start a check-in at any time from the header or the Check-in page.
        </div>
      </div>
    </div>
  );
}

type SettingsTab = "targets" | "categories" | "debt" | "checkin";
const TABS: { id: SettingsTab; label: string }[] = [
  { id: "targets", label: "Budget Targets" },
  { id: "categories", label: "Categories" },
  { id: "debt", label: "Debt Balances" },
  { id: "checkin", label: "Check-in Day" },
];

export default function DesktopSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("targets");

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>Settings</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.surf, borderRadius: 10, padding: 4, border: `1px solid ${C.border}`, width: "fit-content", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
        {TABS.map(t => <button key={t.id} style={tabBtn(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>)}
      </div>
      {activeTab === "targets" && <BudgetTargetsTab />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "debt" && <DebtBalancesTab />}
      {activeTab === "checkin" && <CheckinDayTab />}
    </div>
  );
}
