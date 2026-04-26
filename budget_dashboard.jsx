import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

const SEED_TRANSACTIONS = [
  { id: 1, date: "2026-04-01", name: "Gas", type: "EXPENSES", amount: 50.55, notes: "" },
  { id: 2, date: "2026-04-01", name: "Other", type: "EXPENSES", amount: 209.00, notes: "Relentless Sub" },
  { id: 3, date: "2026-04-01", name: "Food", type: "EXPENSES", amount: 44.13, notes: "" },
  { id: 4, date: "2026-04-01", name: "Food", type: "EXPENSES", amount: 134.61, notes: "" },
  { id: 5, date: "2026-04-01", name: "Other", type: "EXPENSES", amount: 54.99, notes: "Physiq Annual Fee" },
  { id: 6, date: "2026-04-01", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 180.00, notes: "" },
  { id: 7, date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 325.00, notes: "" },
  { id: 8, date: "2026-04-02", name: "Rich Fun", type: "EXPENSES", amount: 25.98, notes: "Amazon" },
  { id: 9, date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
  { id: 10, date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 559.75, notes: "Global GHLLC" },
  { id: 11, date: "2026-04-02", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
  { id: 12, date: "2026-04-02", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
  { id: 13, date: "2026-04-03", name: "Rich Debt", type: "DEBT PAYMENT", amount: 229.95, notes: "" },
  { id: 14, date: "2026-04-03", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
  { id: 15, date: "2026-04-03", name: "Food", type: "EXPENSES", amount: 1.52, notes: "" },
  { id: 16, date: "2026-04-03", name: "Electric", type: "EXPENSES", amount: 70.00, notes: "" },
  { id: 17, date: "2026-04-03", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 120.77, notes: "" },
  { id: 18, date: "2026-04-03", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 86.68, notes: "" },
  { id: 19, date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 43.17, notes: "Soda" },
  { id: 20, date: "2026-04-06", name: "Rich Debt", type: "DEBT PAYMENT", amount: 125.00, notes: "" },
  { id: 21, date: "2026-04-06", name: "Kaia Fun", type: "EXPENSES", amount: 42.09, notes: "Toxic Burger" },
  { id: 22, date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 7.83, notes: "" },
  { id: 23, date: "2026-04-06", name: "Kaia Fun", type: "EXPENSES", amount: 30.00, notes: "Movie Tickets" },
  { id: 24, date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 49.73, notes: "" },
  { id: 25, date: "2026-04-07", name: "Crunch", type: "INCOME", amount: 270.82, notes: "" },
  { id: 26, date: "2026-04-07", name: "Couch", type: "BILLS", amount: 38.00, notes: "" },
  { id: 27, date: "2026-04-07", name: "Rich Debt", type: "DEBT PAYMENT", amount: 500.00, notes: "" },
  { id: 28, date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 19.95, notes: "Amazon" },
  { id: 29, date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 24.63, notes: "Amazon" },
  { id: 30, date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 12.99, notes: "Amazon" },
  { id: 31, date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 18.99, notes: "" },
  { id: 32, date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 250.00, notes: "" },
  { id: 33, date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 118.00, notes: "" },
  { id: 34, date: "2026-04-08", name: "Gym", type: "SUBSCRIPTIONS", amount: 31.99, notes: "" },
  { id: 35, date: "2026-04-09", name: "Car Payment", type: "BILLS", amount: 355.88, notes: "" },
  { id: 36, date: "2026-04-10", name: "Rich Salary", type: "INCOME", amount: 2732.96, notes: "" },
  { id: 37, date: "2026-04-10", name: "Rich Debt", type: "DEBT PAYMENT", amount: 125.00, notes: "" },
  { id: 38, date: "2026-04-10", name: "Food", type: "EXPENSES", amount: 66.32, notes: "" },
  { id: 39, date: "2026-04-13", name: "Rich Fun", type: "EXPENSES", amount: 17.86, notes: "" },
  { id: 40, date: "2026-04-13", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
  { id: 41, date: "2026-04-13", name: "Gas", type: "EXPENSES", amount: 33.35, notes: "" },
  { id: 42, date: "2026-04-13", name: "Kaia Fun", type: "EXPENSES", amount: 11.50, notes: "Cinemark" },
  { id: 43, date: "2026-04-13", name: "Rich Fun", type: "EXPENSES", amount: 4.75, notes: "Dairy Queen" },
  { id: 44, date: "2026-04-13", name: "Kaia Fun", type: "EXPENSES", amount: 16.08, notes: "Cinemark" },
  { id: 45, date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 30.14, notes: "" },
  { id: 46, date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 16.06, notes: "" },
  { id: 47, date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 21.69, notes: "" },
  { id: 48, date: "2026-04-13", name: "Other", type: "EXPENSES", amount: 9.85, notes: "Chick Fil A" },
  { id: 49, date: "2026-04-13", name: "Other", type: "EXPENSES", amount: 13.56, notes: "Taco Bell" },
  { id: 50, date: "2026-04-13", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
  { id: 51, date: "2026-04-13", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 44.54, notes: "" },
  { id: 52, date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 102.64, notes: "" },
  { id: 53, date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 12.96, notes: "" },
  { id: 54, date: "2026-04-14", name: "Software Eng.", type: "INCOME", amount: 2722.50, notes: "" },
  { id: 55, date: "2026-04-14", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 817.00, notes: "Taxes" },
  { id: 56, date: "2026-04-14", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 80.00, notes: "" },
  { id: 57, date: "2026-04-14", name: "Rent", type: "BILLS", amount: 1100.00, notes: "" },
  { id: 58, date: "2026-04-15", name: "Rich Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
  { id: 59, date: "2026-04-15", name: "Cats", type: "EXPENSES", amount: 47.48, notes: "" },
  { id: 60, date: "2026-04-16", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
  { id: 61, date: "2026-04-16", name: "Rich Debt", type: "DEBT PAYMENT", amount: 325.00, notes: "" },
  { id: 62, date: "2026-04-17", name: "Food", type: "EXPENSES", amount: 66.59, notes: "" },
  { id: 63, date: "2026-04-17", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 120.76, notes: "" },
  { id: 64, date: "2026-04-17", name: "Gym", type: "SUBSCRIPTIONS", amount: 29.99, notes: "" },
  { id: 65, date: "2026-04-17", name: "Rent", type: "BILLS", amount: 468.00, notes: "" },
  { id: 66, date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 225.00, notes: "" },
  { id: 67, date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 70.00, notes: "" },
  { id: 68, date: "2026-04-20", name: "Rich Fun", type: "EXPENSES", amount: 10.00, notes: "Book" },
  { id: 69, date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 150.70, notes: "" },
  { id: 70, date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 160.41, notes: "" },
  { id: 71, date: "2026-04-21", name: "Other", type: "EXPENSES", amount: 15.25, notes: "" },
  { id: 72, date: "2026-04-22", name: "Rich Fun", type: "EXPENSES", amount: 9.99, notes: "Crunchyroll" },
  { id: 73, date: "2026-04-24", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
  { id: 74, date: "2026-04-24", name: "Health", type: "EXPENSES", amount: 23.95, notes: "Creatine" },
  { id: 75, date: "2026-04-24", name: "Rich Salary", type: "INCOME", amount: 2732.97, notes: "" },
  { id: 76, date: "2026-04-24", name: "Other", type: "EXPENSES", amount: 9.99, notes: "Apple subscription" },
  { id: 77, date: "2026-04-24", name: "Food", type: "EXPENSES", amount: 71.55, notes: "" },
  { id: 78, date: "2026-04-24", name: "Cell Phone", type: "BILLS", amount: 200.00, notes: "" },
  { id: 79, date: "2026-04-24", name: "Cats", type: "EXPENSES", amount: 49.96, notes: "" },
  { id: 80, date: "2026-04-24", name: "Food", type: "EXPENSES", amount: 99.65, notes: "" },
];

const DEFAULT_BUDGETS = {
  "Software Eng.": { budget: 4800,    type: "INCOME",        dueDay: null, startingBalance: null },
  "Crunch":        { budget: 200,     type: "INCOME",        dueDay: null, startingBalance: null },
  "Rich Salary":   { budget: 4300,    type: "INCOME",        dueDay: null, startingBalance: null },
  "Cell Phone":    { budget: 200,     type: "BILLS",         dueDay: 24,   startingBalance: null },
  "Car Insurance": { budget: 238.22,  type: "BILLS",         dueDay: 23,   startingBalance: null },
  "Car Payment":   { budget: 355,     type: "BILLS",         dueDay: 8,    startingBalance: null },
  "Couch":         { budget: 35,      type: "BILLS",         dueDay: 7,    startingBalance: null },
  "Rent":          { budget: 2125,    type: "BILLS",         dueDay: 1,    startingBalance: null },
  "Food":          { budget: 500,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Cats":          { budget: 120,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Gas":           { budget: 100,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Electric":      { budget: 65,      type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Rich Fun":      { budget: 100,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Kaia Fun":      { budget: 100,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Health":        { budget: 100,     type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Other":         { budget: 0,       type: "EXPENSES",      dueDay: null, startingBalance: null },
  "Rich Debt":     { budget: 2435,    type: "DEBT PAYMENT",  dueDay: null, startingBalance: 15000 },
  "Kaia Debt":     { budget: 2200.54, type: "DEBT PAYMENT",  dueDay: null, startingBalance: 12000 },
  "Gym":           { budget: 60,      type: "SUBSCRIPTIONS", dueDay: 8,    startingBalance: null },
};

const TYPES = ["INCOME","BILLS","EXPENSES","DEBT PAYMENT","SUBSCRIPTIONS"];
const TYPE_META = {
  "INCOME":        { color:"#16a34a", bg:"#dcfce7", label:"Income" },
  "BILLS":         { color:"#0284c7", bg:"#e0f2fe", label:"Bills" },
  "EXPENSES":      { color:"#7c3aed", bg:"#ede9fe", label:"Expenses" },
  "DEBT PAYMENT":  { color:"#dc2626", bg:"#fee2e2", label:"Debt" },
  "SUBSCRIPTIONS": { color:"#d97706", bg:"#fef3c7", label:"Subscriptions" },
};
const DONUT_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#84cc16","#f97316","#ec4899","#14b8a6","#a855f7","#3b82f6","#22c55e","#eab308"];
const fmt = n => `$${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtK = n => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : fmt(n);

const today = new Date();
const todayStr = today.toISOString().slice(0,10);
const todayDay = today.getDate();
const todayMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
const todayDayOfWeek = today.getDay();

const parseWFDate = str => {
  const clean = str.replace(/"/g,"").trim();
  const [m,d,y] = clean.split("/");
  if (!y) return str;
  return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
};

const parseWFCSV = text => {
  const lines = text.trim().split("\n").filter(l => l.trim());
  return lines.map(line => {
    const cols = line.split(",").map(c => c.replace(/"/g,"").trim());
    const date = parseWFDate(cols[0]);
    const rawAmount = parseFloat(cols[1]);
    const desc = cols[4] || cols[3] || "Unknown";
    const amount = Math.abs(rawAmount);
    const suggestedType = rawAmount >= 0 ? "INCOME" : "EXPENSES";
    return { date, amount, description: desc, suggestedType, rawAmount };
  }).filter(r => !isNaN(r.amount) && r.amount > 0);
};

const CT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}}>
      {label&&<div style={{color:"#6b7280",marginBottom:4,fontWeight:600}}>{label}</div>}
      {payload.map((p,i)=><div key={i} style={{color:p.color||"#374151",display:"flex",gap:12,justifyContent:"space-between"}}><span>{p.name}:</span><span style={{fontWeight:700}}>{fmt(p.value)}</span></div>)}
    </div>
  );
};

export default function App() {
  const [view, setView]              = useState("dashboard");
  const [transactions, setTxns]      = useState([]);
  const [budgets, setBudgets]        = useState(DEFAULT_BUDGETS);
  const [loaded, setLoaded]          = useState(false);
  const [filterMonth, setFMonth]     = useState(todayMonth);
  const [filterType, setFType]       = useState("ALL");
  const [delConfirm, setDelConfirm]  = useState(null);
  const [editingTxn, setEditingTxn]  = useState(null); // {id, date, name, type, amount, notes}
  const [editBudget, setEditBudget]  = useState({});
  const [batch, setBatch]            = useState([]);
  const [form, setForm]              = useState({ date: todayStr, name:"", type:"", amount:"", notes:"" });
  const [txnTab, setTxnTab]          = useState("manual");
  const [settingsTab, setSettingsTab]= useState("budgets");
  const [merchantMap, setMerchantMap]= useState({});
  const [csvRows, setCsvRows]        = useState([]);
  const [newCat, setNewCat]          = useState({ name:"", type:"EXPENSES", budget:"0" });
  const [catDelConfirm, setCatDelConfirm] = useState(null);
  const [calMonth, setCalMonth]      = useState(todayMonth);
  const [weeklyDismissed, setWeeklyDismissed] = useState(null);
  const [showWeekly, setShowWeekly]  = useState(false);
  const [weeklyNotes, setWeeklyNotes]= useState("");
  const [monthlyNotes, setMonthlyNotes] = useState({});
  const [checkins, setCheckins]      = useState([]);
  const [checkinDay, setCheckinDay]  = useState(0); // 0=Sunday default
  const fileRef = useRef();

  useEffect(()=>{
    (async()=>{
      try {
        const t  = await window.storage.get("txns_v5");
        const b  = await window.storage.get("bdg_v5");
        const m  = await window.storage.get("merchant_v5");
        const wd = await window.storage.get("weekly_dismissed");
        const mn = await window.storage.get("monthly_notes");
        const ci = await window.storage.get("checkins_v1");
        const cd = await window.storage.get("checkin_day");
        setTxns(t  ? JSON.parse(t.value)  : SEED_TRANSACTIONS);
        setBudgets(b ? JSON.parse(b.value) : DEFAULT_BUDGETS);
        setMerchantMap(m ? JSON.parse(m.value) : {});
        setWeeklyDismissed(wd ? wd.value : null);
        setMonthlyNotes(mn ? JSON.parse(mn.value) : {});
        setCheckins(ci ? JSON.parse(ci.value) : []);
        setCheckinDay(cd ? parseInt(cd.value) : 0);
      } catch {
        setTxns(SEED_TRANSACTIONS);
        setBudgets(DEFAULT_BUDGETS);
      }
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{ if(loaded) window.storage.set("txns_v5",JSON.stringify(transactions)).catch(()=>{}); },[transactions,loaded]);
  useEffect(()=>{ if(loaded) window.storage.set("bdg_v5",JSON.stringify(budgets)).catch(()=>{}); },[budgets,loaded]);
  useEffect(()=>{ if(loaded) window.storage.set("merchant_v5",JSON.stringify(merchantMap)).catch(()=>{}); },[merchantMap,loaded]);
  useEffect(()=>{ if(loaded) window.storage.set("monthly_notes",JSON.stringify(monthlyNotes)).catch(()=>{}); },[monthlyNotes,loaded]);
  useEffect(()=>{ if(loaded) window.storage.set("checkins_v1",JSON.stringify(checkins)).catch(()=>{}); },[checkins,loaded]);
  useEffect(()=>{ if(loaded) window.storage.set("checkin_day",String(checkinDay)).catch(()=>{}); },[checkinDay,loaded]);

  // Show check-in on scheduled day if not dismissed this week
  useEffect(()=>{
    if(!loaded) return;
    const isCheckinDay = todayDayOfWeek === checkinDay;
    const thisWeekKey = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0,10);
    })();
    if(isCheckinDay && weeklyDismissed !== thisWeekKey) {
      setTimeout(() => setShowWeekly(true), 800);
    }
  },[loaded, checkinDay]);

  const closeWeekly = () => {
    setShowWeekly(false);
    setWeeklyNotes("");
  };

  const dismissWeekly = (saveNotes=false) => {
    const thisWeekSunday = (() => {
      const d = new Date(today);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0,10);
    })();
    setWeeklyDismissed(thisWeekSunday);
    window.storage.set("weekly_dismissed", thisWeekSunday).catch(()=>{});
    const record = {
      id: Date.now(),
      date: todayStr,
      weekSpend: weeklyData.weekSpend,
      weekDebt: weeklyData.weekDebt,
      topCat: weeklyData.topCat,
      notes: saveNotes ? weeklyNotes : "",
    };
    setCheckins(prev => [record, ...prev]);
    if(saveNotes && weeklyNotes) {
      setMonthlyNotes(n=>({...n,[filterMonth]:(n[filterMonth]||"")+(n[filterMonth]?"\n":"")+weeklyNotes}));
    }
    setWeeklyNotes("");
    setShowWeekly(false);
  };

  const pickName = name => setForm(f=>({...f, name, type: budgets[name]?.type||""}));

  const monthTxns = useMemo(()=>transactions.filter(t=>t.date.startsWith(filterMonth)),[transactions,filterMonth]);

  const stats = useMemo(()=>{
    const inc = monthTxns.filter(t=>t.type==="INCOME").reduce((s,t)=>s+t.amount,0);
    const out = monthTxns.filter(t=>t.type!=="INCOME").reduce((s,t)=>s+t.amount,0);
    const bud = Object.values(budgets).filter(b=>b.type!=="INCOME").reduce((s,b)=>s+b.budget,0);
    return { inc, out, bud, left:bud-out, net:inc-out };
  },[monthTxns,budgets]);

  const catTotals = useMemo(()=>{
    const m={};
    monthTxns.filter(t=>t.type!=="INCOME").forEach(t=>{m[t.name]=(m[t.name]||0)+t.amount;});
    return m;
  },[monthTxns]);

  const donutData = useMemo(()=>Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value})),[catTotals]);

  const bva = useMemo(()=>{
    const g={};
    Object.entries(budgets).filter(([,v])=>v.type!=="INCOME").forEach(([n,v])=>{
      if(!g[v.type]) g[v.type]={budget:0,actual:0};
      g[v.type].budget+=v.budget; g[v.type].actual+=catTotals[n]||0;
    });
    return Object.entries(g).map(([k,v])=>({name:k==="DEBT PAYMENT"?"Debt":k, budget:Math.round(v.budget), actual:Math.round(v.actual)}));
  },[budgets,catTotals]);

  const trendLine = useMemo(()=>{
    const sorted=[...monthTxns].sort((a,b)=>a.date.localeCompare(b.date));
    let bal=4104.75; const pts=[];
    sorted.forEach(t=>{
      if(t.type==="INCOME") bal+=t.amount; else bal-=t.amount;
      const day=parseInt(t.date.slice(8));
      const ex=pts.find(p=>p.day===day);
      if(ex) ex.balance=Math.round(bal*100)/100; else pts.push({day,balance:Math.round(bal*100)/100});
    });
    return pts;
  },[monthTxns]);

  const typeGroups = useMemo(()=>{
    const g={};
    TYPES.forEach(t=>{ g[t]=Object.entries(budgets).filter(([,v])=>v.type===t).map(([name,v])=>({name,budget:v.budget,actual:monthTxns.filter(tx=>tx.name===name).reduce((s,tx)=>s+tx.amount,0)})); });
    return g;
  },[budgets,monthTxns]);

  const months = useMemo(()=>[...new Set(transactions.map(t=>t.date.slice(0,7)))].sort().reverse(),[transactions]);

  // Due soon — bills due within 7 days of today
  const dueSoon = useMemo(()=>{
    const results = [];
    const year = today.getFullYear();
    const month = today.getMonth();
    Object.entries(budgets).filter(([,v])=>v.type==="BILLS"&&v.dueDay).forEach(([name,v])=>{
      const dueDate = new Date(year, month, v.dueDay);
      const diffDays = Math.ceil((dueDate - today) / (1000*60*60*24));
      const paidThisMonth = transactions.filter(t=>t.name===name&&t.date.startsWith(todayMonth)).reduce((s,t)=>s+t.amount,0);
      const isPaid = paidThisMonth >= v.budget * 0.9;
      if(diffDays >= -3 && diffDays <= 10) {
        results.push({ name, amount: v.budget, dueDay: v.dueDay, diffDays, isPaid });
      }
    });
    return results.sort((a,b)=>a.diffDays-b.diffDays);
  },[budgets,transactions,todayMonth]);

  // Debt payoff tracker
  const debtStats = useMemo(()=>{
    return Object.entries(budgets)
      .filter(([,v])=>v.type==="DEBT PAYMENT"&&v.startingBalance)
      .map(([name,v])=>{
        const totalPaid = transactions.filter(t=>t.name===name&&t.type==="DEBT PAYMENT").reduce((s,t)=>s+t.amount,0);
        const remaining = Math.max(0, v.startingBalance - totalPaid);
        const pct = Math.min(100, Math.round((totalPaid/v.startingBalance)*100));
        const monthlyPaid = monthTxns.filter(t=>t.name===name).reduce((s,t)=>s+t.amount,0);
        return { name, startingBalance: v.startingBalance, totalPaid, remaining, pct, monthlyPaid };
      });
  },[budgets,transactions,monthTxns]);

  // Weekly check-in data
  const weeklyData = useMemo(()=>{
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const weekStartStr = weekStart.toISOString().slice(0,10);
    const weekTxns = transactions.filter(t=>t.date>=weekStartStr&&t.date<=todayStr);
    const weekSpend = weekTxns.filter(t=>t.type!=="INCOME").reduce((s,t)=>s+t.amount,0);
    const weekIncome = weekTxns.filter(t=>t.type==="INCOME").reduce((s,t)=>s+t.amount,0);
    const weekDebt = weekTxns.filter(t=>t.type==="DEBT PAYMENT").reduce((s,t)=>s+t.amount,0);
    const weeklyPace = stats.bud / 4.33;
    const catMap = {};
    weekTxns.filter(t=>t.type!=="INCOME").forEach(t=>{catMap[t.name]=(catMap[t.name]||0)+t.amount;});
    const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];
    return { weekSpend, weekIncome, weekDebt, weeklyPace, topCat, weekTxns: weekTxns.length };
  },[transactions,stats]);

  // Calendar helpers
  const calData = useMemo(()=>{
    const [yr, mo] = calMonth.split("-").map(Number);
    const firstDay = new Date(yr, mo-1, 1).getDay();
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const txnsByDay = {};
    transactions.filter(t=>t.date.startsWith(calMonth)).forEach(t=>{
      const d = parseInt(t.date.slice(8));
      if(!txnsByDay[d]) txnsByDay[d] = { count:0, amount:0 };
      if(t.type!=="INCOME") { txnsByDay[d].count++; txnsByDay[d].amount+=t.amount; }
    });
    const billsByDay = {};
    Object.entries(budgets).filter(([,v])=>v.type==="BILLS"&&v.dueDay).forEach(([name,v])=>{
      const d = v.dueDay;
      if(!billsByDay[d]) billsByDay[d] = [];
      billsByDay[d].push({ name, amount: v.budget });
    });
    return { firstDay, daysInMonth, txnsByDay, billsByDay };
  },[calMonth,transactions,budgets]);

  // Manual batch
  const addToBatch = ()=>{
    if(!form.name||!form.amount||!form.date||!form.type) return;
    setBatch(b=>[...b,{...form,amount:parseFloat(form.amount),id:Date.now()+Math.random()}]);
    setForm(f=>({...f,name:"",type:"",amount:"",notes:""}));
  };
  const commitBatch = ()=>{ if(!batch.length) return; setTxns(t=>[...t,...batch]); setBatch([]); };

  // CSV
  const handleCSVFile = e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseWFCSV(ev.target.result);
      const existingKeys = new Set(transactions.map(t=>`${t.date}|${t.amount}|${t.notes}`));
      const mapped = rows.map((r,i)=>{
        const isDuplicate = existingKeys.has(`${r.date}|${r.amount}|${r.description}`);
        return {
          ...r, id:`csv_${Date.now()}_${i}`,
          category: merchantMap[r.description]||"",
          type: merchantMap[r.description]?(budgets[merchantMap[r.description]]?.type||r.suggestedType):r.suggestedType,
          notes: r.description, isDuplicate, selected:!isDuplicate,
        };
      });
      setCsvRows(mapped);
    };
    reader.readAsText(file); e.target.value="";
  };
  const updateCsvRow = (id,field,value)=>{
    setCsvRows(rows=>rows.map(r=>{
      if(r.id!==id) return r;
      const u={...r,[field]:value};
      if(field==="category") u.type=budgets[value]?.type||r.suggestedType;
      return u;
    }));
  };
  const applyToAllMatching = (desc,cat)=>{
    setCsvRows(rows=>rows.map(r=>r.description!==desc?r:{...r,category:cat,type:budgets[cat]?.type||r.suggestedType}));
  };
  const commitCSV = ()=>{
    const toImport=csvRows.filter(r=>r.selected&&r.category); if(!toImport.length) return;
    const newMap={...merchantMap}; toImport.forEach(r=>{newMap[r.description]=r.category;});
    setMerchantMap(newMap);
    setTxns(t=>[...t,...toImport.map(r=>({id:Date.now()+Math.random(),date:r.date,name:r.category,type:r.type,amount:r.amount,notes:r.description}))]);
    setCsvRows([]);
  };

  // Categories
  const addCategory = ()=>{
    if(!newCat.name.trim()) return;
    setBudgets(b=>({...b,[newCat.name.trim()]:{budget:parseFloat(newCat.budget)||0,type:newCat.type,dueDay:null,startingBalance:null}}));
    setNewCat({name:"",type:"EXPENSES",budget:"0"});
  };
  const removeCategory = name=>{ const u={...budgets}; delete u[name]; setBudgets(u); setCatDelConfirm(null); };

  if(!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f8fafc",fontFamily:"system-ui",color:"#64748b"}}>Loading…</div>;

  const C={bg:"#f8fafc",surf:"#ffffff",border:"#e2e8f0",borderL:"#f1f5f9",text:"#0f172a",muted:"#64748b",subtle:"#94a3b8",green:"#16a34a",red:"#dc2626",accent:"#2563eb",amber:"#d97706"};
  const card={background:C.surf,border:`1px solid ${C.border}`,borderRadius:12,padding:22,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"};
  const inp={background:C.surf,border:`1px solid ${C.border}`,color:C.text,padding:"9px 12px",borderRadius:8,fontSize:13.5,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"};
  const sel={...inp,cursor:"pointer"};
  const btn=(v="primary")=>({padding:"9px 20px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13.5,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.12s",
    background:v==="primary"?C.accent:v==="danger"?"#fef2f2":v==="ghost"?"transparent":"#f1f5f9",
    color:v==="primary"?"#fff":v==="danger"?C.red:C.muted});
  const th={textAlign:"left",padding:"8px 12px",color:C.subtle,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,borderBottom:`1px solid ${C.borderL}`};
  const td={padding:"9px 12px",borderBottom:`1px solid ${C.borderL}`,color:C.text,verticalAlign:"middle"};
  const badge=type=>({display:"inline-block",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:TYPE_META[type]?.bg||"#f1f5f9",color:TYPE_META[type]?.color||C.muted});
  const tabBtn=active=>({padding:"8px 18px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13.5,fontWeight:500,fontFamily:"inherit",transition:"all 0.12s",background:active?"#eff6ff":"transparent",color:active?C.accent:C.muted});

  const sectionHead = (type) => (
    <div style={{fontSize:12,fontWeight:700,color:TYPE_META[type].color,textTransform:"uppercase",letterSpacing:0.6,marginBottom:12,display:"flex",alignItems:"center",gap:6,paddingBottom:10,borderBottom:`2px solid ${TYPE_META[type].bg}`}}>
      <span style={{width:8,height:8,borderRadius:"50%",background:TYPE_META[type].color,display:"inline-block"}}/>{TYPE_META[type].label}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:C.text}}>

      {/* ── WEEKLY CHECK-IN MODAL ── */}
      {showWeekly&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:C.surf,borderRadius:16,padding:32,maxWidth:560,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.5}}>Kova Check-in</div>
                <div style={{fontSize:13.5,color:C.muted,marginTop:4}}>Here's your weekly recap from Kova.</div>
              </div>
              <button style={{...btn("ghost"),padding:"4px 8px",fontSize:18,color:C.subtle}} onClick={closeWeekly}>✕</button>
            </div>

            {/* AI Summary stub */}
            <div style={{background:"linear-gradient(135deg,#eff6ff,#f0fdf4)",border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:0.6,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14}}>
                  <svg width="14" height="14" viewBox="0 0 48 48" fill="none" style={{display:"inline",verticalAlign:"middle"}}>
                    <polygon points="24,4 36,16 24,22 12,16" fill={C.accent} opacity="0.9"/>
                    <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
                    <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
                    <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
                  </svg>
                </span> Kova
                <span style={{marginLeft:"auto",fontSize:10,color:C.subtle,fontWeight:500,background:"#f1f5f9",padding:"2px 8px",borderRadius:20}}>AI coming soon</span>
              </div>
              <div style={{fontSize:13.5,color:C.muted,lineHeight:1.6}}>
                {weeklyData.weekSpend > weeklyData.weeklyPace
                  ? `You spent ${fmt(weeklyData.weekSpend)} this week — about ${fmt(weeklyData.weekSpend - weeklyData.weeklyPace)} over your weekly pace.`
                  : `You spent ${fmt(weeklyData.weekSpend)} this week — ${fmt(weeklyData.weeklyPace - weeklyData.weekSpend)} under your weekly pace.`}
                {weeklyData.topCat&&` Your biggest category was ${weeklyData.topCat[0]} at ${fmt(weeklyData.topCat[1])}.`}
                {weeklyData.weekDebt > 0 && ` You put ${fmt(weeklyData.weekDebt)} toward debt this week — keep it up.`}
                <span style={{display:"block",marginTop:6,fontSize:12,color:C.subtle}}>Kova will generate personalized insights here once the Claude API is connected.</span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {label:"Spent this week",   val:fmt(weeklyData.weekSpend),  sub:`Pace: ${fmt(weeklyData.weeklyPace)}/wk`, ok: weeklyData.weekSpend<=weeklyData.weeklyPace},
                {label:"Debt paid",         val:fmt(weeklyData.weekDebt),   sub:"This week",                               ok: weeklyData.weekDebt>0},
                {label:"Transactions",      val:weeklyData.weekTxns,        sub:"This week",                               ok: true},
              ].map(s=>(
                <div key={s.label} style={{background:C.bg,borderRadius:8,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4,marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.ok?C.green:C.red}}>{s.val}</div>
                  <div style={{fontSize:11,color:C.subtle,marginTop:2}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Upcoming bills */}
            {dueSoon.filter(b=>b.diffDays>=0).length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Coming up this week</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {dueSoon.filter(b=>b.diffDays>=0&&b.diffDays<=7).map(b=>(
                    <div key={b.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg,borderRadius:7,padding:"8px 12px",border:`1px solid ${C.border}`}}>
                      <span style={{fontSize:13.5,fontWeight:500}}>{b.name}</span>
                      <span style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.subtle}}>Due the {b.dueDay}{b.dueDay===1?"st":b.dueDay===2?"nd":b.dueDay===3?"rd":"th"}</span>
                        <span style={{fontWeight:700,fontSize:13.5}}>{fmt(b.amount)}</span>
                        {b.isPaid&&<span style={{fontSize:10,fontWeight:700,background:"#dcfce7",color:C.green,padding:"2px 7px",borderRadius:20}}>Paid</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Notes from this week</div>
              <textarea style={{...inp,height:72,resize:"vertical",lineHeight:1.5}} placeholder="Anything worth remembering about this week's spending?" value={weeklyNotes} onChange={e=>setWeeklyNotes(e.target.value)}/>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button style={btn("secondary")} onClick={()=>dismissWeekly(true)}>Save & Close</button>
              <button style={btn()} onClick={()=>dismissWeekly(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 28px",height:60,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginRight:36}}>
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="24,4 36,16 24,22 12,16" fill="#2563eb" opacity="0.9"/>
            <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
            <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
            <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
            <line x1="24" y1="4" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.9"/>
          </svg>
          <span style={{fontSize:17,fontWeight:800,color:C.accent,letterSpacing:-0.5}}>Kova</span>
        </div>
        <div style={{display:"flex",gap:2}}>
          {[["dashboard","Overview"],["transactions","Transactions"],["calendar","Calendar"],["trends","Trends"],["checkin","Check-in"],["settings","Settings"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",borderRadius:7,border:"none",cursor:"pointer",fontSize:13.5,fontWeight:500,fontFamily:"inherit",transition:"all 0.12s",background:view===v?"#eff6ff":"transparent",color:view===v?C.accent:C.muted}}>{l}</button>
          ))}
        </div>
        <button onClick={()=>setShowWeekly(true)} style={{marginLeft:"auto",...btn("secondary"),padding:"6px 14px",fontSize:12.5,background:"#eff6ff",color:C.accent,display:"flex",alignItems:"center",gap:7,border:"0.5px solid #bfdbfe"}}>
          <svg width="13" height="13" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 36,16 24,22 12,16" fill={C.accent} opacity="0.9"/>
            <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
            <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
            <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
          </svg>
          Kova check-in
        </button>
      </div>

      <div style={{maxWidth:1120,margin:"0 auto",padding:"28px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.5}}>
            {{"dashboard":"Overview","transactions":"Transactions","calendar":"Calendar","trends":"Trends","checkin":"Check-in","settings":"Settings"}[view]}
          </div>
          {["dashboard","transactions"].includes(view)&&(
            <select style={{background:C.surf,border:`1px solid ${C.border}`,color:C.text,padding:"7px 12px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"inherit"}} value={filterMonth} onChange={e=>setFMonth(e.target.value)}>
              {months.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>

        {/* ── DASHBOARD ── */}
        {view==="dashboard"&&(<>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:20}}>
            {[
              {label:"Money In",     val:stats.inc,  pos:null},
              {label:"Money Out",    val:stats.out,  pos:null},
              {label:"Total Budget", val:stats.bud,  pos:null},
              {label:"Left to Spend",val:stats.left, pos:stats.left>=0},
              {label:"Net Savings",  val:stats.net,  pos:stats.net>=0},
            ].map(k=>(
              <div key={k.label} style={card}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>{k.label}</div>
                <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.5,color:k.pos===null?C.text:k.pos?C.green:C.red}}>{fmt(k.val)}</div>
              </div>
            ))}
          </div>

          {/* Due Soon strip */}
          {dueSoon.length>0&&(
            <div style={{...card,marginBottom:16,padding:"14px 20px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:12}}>Bills Due Soon</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {dueSoon.map(b=>{
                  const color = b.isPaid ? C.green : b.diffDays < 0 ? C.red : b.diffDays <= 3 ? C.amber : C.accent;
                  const bg    = b.isPaid ? "#dcfce7" : b.diffDays < 0 ? "#fee2e2" : b.diffDays <= 3 ? "#fef3c7" : "#eff6ff";
                  const label = b.isPaid ? "Paid" : b.diffDays < 0 ? `${Math.abs(b.diffDays)}d overdue` : b.diffDays === 0 ? "Due today" : `Due in ${b.diffDays}d`;
                  return (
                    <div key={b.name} style={{background:bg,border:`1px solid ${color}30`,borderRadius:8,padding:"8px 14px",display:"flex",flexDirection:"column",gap:2,minWidth:130}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{b.name}</div>
                      <div style={{fontSize:12,fontWeight:700,color}}>{label}</div>
                      <div style={{fontSize:12,color:C.muted}}>{fmt(b.amount)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Charts */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Money Out by Category</div>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                <div style={{flexShrink:0,width:170,height:170}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={82} dataKey="value" paddingAngle={2}>
                        {donutData.map((_,i)=><Cell key={i} fill={DONUT_COLORS[i%DONUT_COLORS.length]}/>)}
                      </Pie>
                      <Tooltip content={<CT/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:5,minWidth:0}}>
                  {donutData.slice(0,10).map((d,i)=>(
                    <div key={d.name} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
                      <div style={{width:9,height:9,borderRadius:2,background:DONUT_COLORS[i%DONUT_COLORS.length],flexShrink:0}}/>
                      <span style={{flex:1,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                      <span style={{fontWeight:700,color:C.text,flexShrink:0,fontSize:12}}>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Budget vs Actual</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={bva} barCategoryGap="35%" barGap={3}>
                  <XAxis dataKey="name" tick={{fill:C.muted,fontSize:12}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.subtle,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip content={<CT/>}/>
                  <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4,4,0,0]}/>
                  <Bar dataKey="actual" name="Actual" fill={C.accent} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{...card,marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Balance Trend — {filterMonth}</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={trendLine}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.borderL}/>
                <XAxis dataKey="day" tick={{fill:C.subtle,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.subtle,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`}/>
                <Tooltip content={<CT/>}/>
                <Line type="monotone" dataKey="balance" name="Balance" stroke={C.accent} strokeWidth={2.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category tables */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
            {TYPES.map(type=>(
              <div key={type} style={card}>
                {sectionHead(type)}
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>
                    <th style={th}>Category</th>
                    <th style={{...th,textAlign:"right"}}>Budget</th>
                    <th style={{...th,textAlign:"right"}}>Actual</th>
                    <th style={{...th,textAlign:"right"}}>Diff</th>
                  </tr></thead>
                  <tbody>
                    {typeGroups[type].map(row=>{
                      const d=type==="INCOME"?row.actual-row.budget:row.budget-row.actual;
                      return (
                        <tr key={row.name}>
                          <td style={td}>{row.name}</td>
                          <td style={{...td,textAlign:"right",color:C.muted}}>{fmt(row.budget)}</td>
                          <td style={{...td,textAlign:"right",fontWeight:600}}>{fmt(row.actual)}</td>
                          <td style={{...td,textAlign:"right"}}><span style={{color:d>=0?C.green:C.red,fontWeight:700}}>{d>=0?"+":""}{fmt(d)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Debt payoff tracker */}
          {debtStats.length>0&&(
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Debt Payoff Progress</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {debtStats.map(d=>(
                  <div key={d.name} style={{background:C.bg,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                      <div style={{fontWeight:700,fontSize:14}}>{d.name}</div>
                      <div style={{fontSize:12,color:C.muted}}>{d.pct}% paid off</div>
                    </div>
                    <div style={{background:C.border,borderRadius:99,height:8,marginBottom:10,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${C.green},#4ade80)`,width:`${d.pct}%`,transition:"width 0.5s"}}/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {label:"Remaining",  val:fmtK(d.remaining),  color:C.red},
                        {label:"Total Paid", val:fmtK(d.totalPaid),  color:C.green},
                        {label:"This Month", val:fmtK(d.monthlyPaid),color:C.accent},
                      ].map(s=>(
                        <div key={s.label} style={{textAlign:"center"}}>
                          <div style={{fontSize:15,fontWeight:800,color:s.color}}>{s.val}</div>
                          <div style={{fontSize:10,color:C.subtle,textTransform:"uppercase",letterSpacing:0.4,marginTop:2}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly notes */}
          <div style={{...card,marginTop:14}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:10}}>Month Notes — {filterMonth}</div>
            <textarea style={{...inp,height:64,resize:"vertical",lineHeight:1.5,fontSize:13.5}} placeholder="Add context about this month…" value={monthlyNotes[filterMonth]||""} onChange={e=>setMonthlyNotes(n=>({...n,[filterMonth]:e.target.value}))}/>
          </div>
        </>)}

        {/* ── TRANSACTIONS ── */}
        {view==="transactions"&&(<>
          <div style={{display:"flex",gap:4,marginBottom:20,background:C.surf,border:`1px solid ${C.border}`,borderRadius:10,padding:4,width:"fit-content"}}>
            <button style={tabBtn(txnTab==="manual")} onClick={()=>setTxnTab("manual")}>Manual Entry</button>
            <button style={tabBtn(txnTab==="csv")} onClick={()=>setTxnTab("csv")}>CSV Import</button>
          </div>

          {txnTab==="manual"&&(
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Add Transactions</div>
              <div style={{display:"grid",gridTemplateColumns:"150px 190px auto 130px 1fr auto",gap:10,marginBottom:batch.length?14:0}}>
                <input style={inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                <select style={sel} value={form.name} onChange={e=>pickName(e.target.value)}>
                  <option value="">— Category —</option>
                  {TYPES.map(type=>(
                    <optgroup key={type} label={type}>
                      {Object.entries(budgets).filter(([,v])=>v.type===type).map(([n])=><option key={n} value={n}>{n}</option>)}
                    </optgroup>
                  ))}
                </select>
                <div style={{display:"flex",alignItems:"center",padding:"9px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:form.type?TYPE_META[form.type]?.bg:"#f8fafc",color:form.type?TYPE_META[form.type]?.color:C.subtle,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>
                  {form.type?TYPE_META[form.type]?.label:"Auto-fills →"}
                </div>
                <input style={inp} type="number" placeholder="Amount" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} step="0.01" min="0"/>
                <input style={inp} type="text" placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                <button style={btn()} onClick={addToBatch}>+ Add</button>
              </div>
              {batch.length>0&&(<>
                <div style={{fontSize:12.5,color:C.muted,fontWeight:500,marginBottom:8}}>{batch.length} pending — review before saving</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:14}}>
                  <tbody>{batch.map((b,i)=>(
                    <tr key={b.id} style={{background:"#f8fafc"}}>
                      <td style={td}>{b.date}</td>
                      <td style={{...td,fontWeight:600}}>{b.name}</td>
                      <td style={td}><span style={badge(b.type)}>{TYPE_META[b.type]?.label||b.type}</span></td>
                      <td style={{...td,textAlign:"right",fontWeight:700}}>{fmt(b.amount)}</td>
                      <td style={{...td,color:C.muted,fontSize:12.5}}>{b.notes}</td>
                      <td style={td}><button style={{...btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={()=>setBatch(p=>p.filter((_,j)=>j!==i))}>Remove</button></td>
                    </tr>
                  ))}</tbody>
                </table>
                <button style={btn()} onClick={commitBatch}>Save {batch.length} Transaction{batch.length>1?"s":""}</button>
              </>)}
            </div>
          )}

          {txnTab==="csv"&&(<>
            {csvRows.length===0&&(
              <div style={{...card,textAlign:"center",padding:48}}>
                <div style={{fontSize:32,marginBottom:12}}>📄</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6,color:C.text}}>Import from Wells Fargo</div>
                <div style={{fontSize:13.5,color:C.muted,marginBottom:20}}>Download your transaction history as a CSV then upload it here.</div>
                <div style={{fontSize:12,color:C.subtle,marginBottom:20,background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 16px",display:"inline-block",textAlign:"left"}}>
                  <strong>How to export:</strong> Sign in → Account Activity → Download Account Activity → CSV
                </div>
                <br/>
                <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={handleCSVFile}/>
                <button style={btn()} onClick={()=>fileRef.current?.click()}>Upload CSV File</button>
              </div>
            )}
            {csvRows.length>0&&(
              <div style={{...card,marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700}}>{csvRows.length} transactions parsed</div>
                    <div style={{fontSize:12.5,color:C.muted,marginTop:2}}>
                      Assign categories below. Known merchants are auto-filled.
                      {csvRows.filter(r=>r.isDuplicate).length>0&&<span style={{marginLeft:8,color:C.amber,fontWeight:600}}>{csvRows.filter(r=>r.isDuplicate).length} possible duplicate{csvRows.filter(r=>r.isDuplicate).length>1?"s":""} unchecked</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button style={btn("secondary")} onClick={()=>setCsvRows([])}>Cancel</button>
                    <button style={btn()} onClick={commitCSV}>Import {csvRows.filter(r=>r.selected&&r.category).length} Transactions</button>
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr>
                    <th style={{...th,width:32}}><input type="checkbox" checked={csvRows.every(r=>r.selected)} onChange={e=>setCsvRows(rows=>rows.map(r=>({...r,selected:e.target.checked})))}/></th>
                    <th style={th}>Date</th><th style={th}>Description</th>
                    <th style={{...th,textAlign:"right"}}>Amount</th>
                    <th style={th}>Category</th><th style={th}>Type</th><th style={th}></th>
                  </tr></thead>
                  <tbody>
                    {csvRows.map(row=>(
                      <tr key={row.id} style={{background:row.isDuplicate?"#fffbeb":row.selected?"#fff":"#f8fafc",opacity:row.selected?1:0.5}}>
                        <td style={td}><input type="checkbox" checked={row.selected} onChange={e=>updateCsvRow(row.id,"selected",e.target.checked)}/></td>
                        <td style={{...td,color:C.muted,fontSize:12.5}}>{row.date}</td>
                        <td style={{...td,fontSize:12.5,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {row.description}
                          {row.isDuplicate&&<span style={{marginLeft:6,padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:700,background:"#fef3c7",color:C.amber}}>Duplicate</span>}
                        </td>
                        <td style={{...td,textAlign:"right",fontWeight:600}}>{fmt(row.amount)}</td>
                        <td style={td}>
                          <select style={{...sel,width:150,padding:"5px 8px",fontSize:12.5}} value={row.category} onChange={e=>updateCsvRow(row.id,"category",e.target.value)}>
                            <option value="">— Assign —</option>
                            {TYPES.map(type=>(
                              <optgroup key={type} label={type}>
                                {Object.entries(budgets).filter(([,v])=>v.type===type).map(([n])=><option key={n} value={n}>{n}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td style={td}>{row.type&&<span style={badge(row.type)}>{TYPE_META[row.type]?.label||row.type}</span>}</td>
                        <td style={td}>{row.category&&<button style={{...btn("ghost"),padding:"3px 8px",fontSize:11,color:C.accent,whiteSpace:"nowrap"}} onClick={()=>applyToAllMatching(row.description,row.category)}>Apply to all</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>)}

          {/* Transaction log */}
          <div style={{marginTop:20}}>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              {["ALL",...TYPES].map(t=>(
                <button key={t} style={{...btn("ghost"),padding:"5px 14px",fontSize:12.5,background:filterType===t?C.accent:"#f1f5f9",color:filterType===t?"#fff":C.muted}} onClick={()=>setFType(t)}>
                  {t==="ALL"?"All":TYPE_META[t]?.label||t}
                </button>
              ))}
            </div>
            <div style={card}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                <thead><tr>
                  <th style={th}>Date</th><th style={th}>Category</th><th style={th}>Type</th>
                  <th style={{...th,textAlign:"right"}}>Amount</th><th style={th}>Notes</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {[...monthTxns].filter(t=>filterType==="ALL"||t.type===filterType).sort((a,b)=>b.date.localeCompare(a.date)).map(t=>(
                    editingTxn?.id===t.id
                      /* ── EDIT ROW ── */
                      ? <tr key={t.id} style={{background:"#f8faff"}}>
                          <td style={td}><input style={{...inp,padding:"5px 8px",width:130}} type="date" value={editingTxn.date} onChange={e=>setEditingTxn(x=>({...x,date:e.target.value}))}/></td>
                          <td style={td}>
                            <select style={{...sel,padding:"5px 8px",width:150}} value={editingTxn.name} onChange={e=>{const type=budgets[e.target.value]?.type||editingTxn.type;setEditingTxn(x=>({...x,name:e.target.value,type}));}}>
                              {TYPES.map(type=>(
                                <optgroup key={type} label={type}>
                                  {Object.entries(budgets).filter(([,v])=>v.type===type).map(([n])=><option key={n} value={n}>{n}</option>)}
                                </optgroup>
                              ))}
                            </select>
                          </td>
                          <td style={td}><span style={badge(editingTxn.type)}>{TYPE_META[editingTxn.type]?.label||editingTxn.type}</span></td>
                          <td style={{...td,textAlign:"right"}}><input style={{...inp,padding:"5px 8px",width:90,textAlign:"right"}} type="number" step="0.01" value={editingTxn.amount} onChange={e=>setEditingTxn(x=>({...x,amount:e.target.value}))}/></td>
                          <td style={td}><input style={{...inp,padding:"5px 8px"}} type="text" value={editingTxn.notes} onChange={e=>setEditingTxn(x=>({...x,notes:e.target.value}))}/></td>
                          <td style={td}>
                            <span style={{display:"flex",gap:6}}>
                              <button style={{...btn(),padding:"4px 12px",fontSize:12}} onClick={()=>{
                                setTxns(p=>p.map(x=>x.id===editingTxn.id?{...editingTxn,amount:parseFloat(editingTxn.amount)||0}:x));
                                setEditingTxn(null);
                              }}>Save</button>
                              <button style={{...btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={()=>setEditingTxn(null)}>Cancel</button>
                            </span>
                          </td>
                        </tr>
                      /* ── VIEW ROW ── */
                      : <tr key={t.id}>
                          <td style={{...td,color:C.muted,fontSize:12.5}}>{t.date}</td>
                          <td style={{...td,fontWeight:600}}>{t.name}</td>
                          <td style={td}><span style={badge(t.type)}>{TYPE_META[t.type]?.label||t.type}</span></td>
                          <td style={{...td,textAlign:"right",fontWeight:700,color:t.type==="INCOME"?C.green:C.text}}>{fmt(t.amount)}</td>
                          <td style={{...td,color:C.muted,fontSize:12.5}}>{t.notes}</td>
                          <td style={td}>
                            {delConfirm===t.id
                              ?<span style={{display:"flex",gap:6}}>
                                  <button style={{...btn("danger"),padding:"4px 10px",fontSize:12}} onClick={()=>{setTxns(p=>p.filter(x=>x.id!==t.id));setDelConfirm(null);}}>Delete</button>
                                  <button style={{...btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={()=>setDelConfirm(null)}>Cancel</button>
                                </span>
                              :<span style={{display:"flex",gap:4}}>
                                  <button style={{...btn("ghost"),padding:"4px 8px",fontSize:12,color:C.subtle}} title="Edit" onClick={()=>setEditingTxn({...t})}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>
                                  <button style={{...btn("ghost"),padding:"4px 8px",fontSize:12,color:C.subtle}} onClick={()=>setDelConfirm(t.id)}>✕</button>
                                </span>
                            }
                          </td>
                        </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ── CALENDAR ── */}
        {view==="calendar"&&(<>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button style={{...btn("secondary"),padding:"7px 14px"}} onClick={()=>{const [y,m]=calMonth.split("-").map(Number);const d=new Date(y,m-2,1);setCalMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)}}>‹</button>
            <div style={{fontSize:16,fontWeight:700,minWidth:120,textAlign:"center"}}>{calMonth}</div>
            <button style={{...btn("secondary"),padding:"7px 14px"}} onClick={()=>{const [y,m]=calMonth.split("-").map(Number);const d=new Date(y,m,1);setCalMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)}}>›</button>
          </div>

          <div style={card}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:1}}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                <div key={d} style={{textAlign:"center",padding:"8px 4px",fontSize:11,fontWeight:700,color:C.subtle,textTransform:"uppercase",letterSpacing:0.5}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {Array.from({length:calData.firstDay}).map((_,i)=><div key={`empty-${i}`}/>)}
              {Array.from({length:calData.daysInMonth},(_,i)=>i+1).map(day=>{
                const isToday = calMonth===todayMonth && day===todayDay;
                const hasTxns = calData.txnsByDay[day];
                const bills   = calData.billsByDay[day]||[];
                return (
                  <div key={day} style={{minHeight:72,background:isToday?"#eff6ff":C.bg,borderRadius:8,padding:"6px 8px",border:`1px solid ${isToday?C.accent:C.borderL}`,position:"relative"}}>
                    <div style={{fontSize:12,fontWeight:isToday?800:500,color:isToday?C.accent:C.text,marginBottom:4}}>{day}</div>
                    {bills.map(b=>(
                      <div key={b.name} style={{fontSize:10,fontWeight:600,background:"#e0f2fe",color:"#0284c7",borderRadius:4,padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name} {fmtK(b.amount)}</div>
                    ))}
                    {hasTxns&&(
                      <div style={{fontSize:10,color:C.muted,marginTop:2}}>
                        <span style={{fontWeight:600,color:C.text}}>{hasTxns.count}</span> txn{hasTxns.count>1?"s":""} · {fmtK(hasTxns.amount)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{display:"flex",gap:16,marginTop:14,flexWrap:"wrap"}}>
            {[
              {color:"#e0f2fe",text:"#0284c7",label:"Bill due"},
              {color:"#eff6ff",text:C.accent,label:"Today"},
            ].map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:C.muted}}>
                <div style={{width:12,height:12,borderRadius:3,background:l.color,border:`1px solid ${l.text}40`}}/>
                {l.label}
              </div>
            ))}
          </div>
        </>)}

        {/* ── TRENDS ── */}
        {view==="trends"&&(
          months.length<2
            ?<div style={{...card,textAlign:"center",padding:60,color:C.muted}}>
                <div style={{fontSize:36,marginBottom:12}}>📈</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6,color:C.text}}>Trends appear with 2+ months</div>
                <div style={{fontSize:13.5}}>Keep logging and this view populates automatically.</div>
              </div>
            :(()=>{
              const data=months.slice().reverse().map(m=>{
                const mt=transactions.filter(t=>t.date.startsWith(m));
                return { month:m,
                  "Income":    Math.round(mt.filter(t=>t.type==="INCOME").reduce((s,t)=>s+t.amount,0)),
                  "Money Out": Math.round(mt.filter(t=>t.type!=="INCOME").reduce((s,t)=>s+t.amount,0)),
                  "Debt":      Math.round(mt.filter(t=>t.type==="DEBT PAYMENT").reduce((s,t)=>s+t.amount,0)),
                };
              });
              return (
                <div style={card}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Month-over-Month</div>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.borderL}/>
                      <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:C.subtle,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(1)}k`}/>
                      <Tooltip content={<CT/>}/>
                      <Legend wrapperStyle={{fontSize:13,color:C.muted}}/>
                      <Line type="monotone" dataKey="Income"    stroke={C.green}  strokeWidth={2.5} dot={{r:4}}/>
                      <Line type="monotone" dataKey="Money Out" stroke={C.red}    strokeWidth={2.5} dot={{r:4}}/>
                      <Line type="monotone" dataKey="Debt"      stroke="#7c3aed"  strokeWidth={2.5} dot={{r:4}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()
        )}

        {/* ── CHECK-IN ── */}
        {view==="checkin"&&(()=>{
          const nextScheduled = (() => {
            const d = new Date(today);
            const daysUntil = (checkinDay - d.getDay() + 7) % 7 || 7;
            d.setDate(d.getDate() + daysUntil);
            return d;
          })();
          const daysUntilNext = Math.ceil((nextScheduled - today) / (1000*60*60*24));
          const isScheduledToday = todayDayOfWeek === checkinDay;
          return (<>
            {/* Next check-in card */}
            <div style={{...card,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{background:"#eff6ff",borderRadius:12,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                      <polygon points="24,4 36,16 24,22 12,16" fill={C.accent} opacity="0.9"/>
                      <polygon points="24,22 36,16 38,32 24,44" fill="#1d4ed8" opacity="0.75"/>
                      <polygon points="24,22 12,16 10,32 24,44" fill="#3b82f6" opacity="0.85"/>
                      <polygon points="24,44 10,32 38,32" fill="#1e40af" opacity="0.6"/>
                      <line x1="24" y1="4" x2="24" y2="22" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.9"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>
                      {isScheduledToday ? "Check-in available today" : `Next check-in: ${nextScheduled.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}`}
                    </div>
                    <div style={{fontSize:13,color:C.muted}}>
                      {isScheduledToday
                        ? "Your Kova check-in is scheduled for today."
                        : `In ${daysUntilNext} day${daysUntilNext===1?"":"s"} — auto-opens on ${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][checkinDay]}s`}
                    </div>
                  </div>
                </div>
                <button style={{...btn(),display:"flex",alignItems:"center",gap:8}} onClick={()=>setShowWeekly(true)}>
                  <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                    <polygon points="24,4 36,16 24,22 12,16" fill="white" opacity="0.95"/>
                    <polygon points="24,22 36,16 38,32 24,44" fill="white" opacity="0.7"/>
                    <polygon points="24,22 12,16 10,32 24,44" fill="white" opacity="0.85"/>
                    <polygon points="24,44 10,32 38,32" fill="white" opacity="0.55"/>
                  </svg>
                  Start now
                </button>
              </div>
            </div>

            {/* Past check-ins */}
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Past check-ins</div>
              {checkins.length===0
                ? <div style={{textAlign:"center",padding:"40px 0",color:C.subtle}}>
                    <div style={{fontSize:32,marginBottom:10}}>
                      <svg width="36" height="36" viewBox="0 0 48 48" fill="none" style={{display:"inline"}}>
                        <polygon points="24,4 36,16 24,22 12,16" fill={C.border} opacity="0.9"/>
                        <polygon points="24,22 36,16 38,32 24,44" fill={C.border} opacity="0.75"/>
                        <polygon points="24,22 12,16 10,32 24,44" fill={C.border} opacity="0.85"/>
                        <polygon points="24,44 10,32 38,32" fill={C.border} opacity="0.6"/>
                      </svg>
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:C.muted,marginBottom:4}}>No check-ins yet</div>
                    <div style={{fontSize:13}}>Complete your first check-in to see your history here.</div>
                  </div>
                : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {checkins.map(ci=>(
                      <div key={ci.id} style={{background:C.bg,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ci.notes?10:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{new Date(ci.date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:12,background:"#eff6ff",color:C.accent,borderRadius:20,padding:"2px 9px",fontWeight:600}}>Spent {fmt(ci.weekSpend)}</span>
                              {ci.weekDebt>0&&<span style={{fontSize:12,background:"#dcfce7",color:C.green,borderRadius:20,padding:"2px 9px",fontWeight:600}}>Debt {fmt(ci.weekDebt)}</span>}
                              {ci.topCat&&<span style={{fontSize:12,background:C.borderL,color:C.muted,borderRadius:20,padding:"2px 9px",fontWeight:500}}>Top: {ci.topCat[0]}</span>}
                            </div>
                          </div>
                          <button style={{...btn("ghost"),padding:"4px 10px",fontSize:12,color:C.subtle,flexShrink:0}} onClick={()=>setCheckins(prev=>prev.filter(c=>c.id!==ci.id))}>✕</button>
                        </div>
                        {ci.notes&&<div style={{fontSize:13,color:C.muted,lineHeight:1.5,borderTop:`1px solid ${C.borderL}`,paddingTop:8,marginTop:2}}>{ci.notes}</div>}
                      </div>
                    ))}
                  </div>
              }
            </div>
          </>);
        })()}

        {/* ── SETTINGS ── */}
        {view==="settings"&&(<>
          <div style={{display:"flex",gap:4,marginBottom:24,background:C.surf,border:`1px solid ${C.border}`,borderRadius:10,padding:4,width:"fit-content"}}>
            <button style={tabBtn(settingsTab==="budgets")} onClick={()=>setSettingsTab("budgets")}>Budget Targets</button>
            <button style={tabBtn(settingsTab==="categories")} onClick={()=>setSettingsTab("categories")}>Categories</button>
            <button style={tabBtn(settingsTab==="debt")} onClick={()=>setSettingsTab("debt")}>Debt Balances</button>
            <button style={tabBtn(settingsTab==="checkinday")} onClick={()=>setSettingsTab("checkinday")}>Check-in Day</button>
          </div>

          {settingsTab==="budgets"&&(<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {TYPES.map(type=>(
                <div key={type} style={card}>
                  {sectionHead(type)}
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                    <thead><tr>
                      <th style={th}>Category</th>
                      <th style={{...th,textAlign:"right"}}>Monthly Target</th>
                      {type==="BILLS"&&<th style={{...th,textAlign:"center"}}>Due Day</th>}
                    </tr></thead>
                    <tbody>
                      {Object.entries(budgets).filter(([,v])=>v.type===type).map(([name,v])=>(
                        <tr key={name}>
                          <td style={td}>{name}</td>
                          <td style={{...td,textAlign:"right"}}>
                            <input style={{...inp,width:110,textAlign:"right",padding:"5px 8px"}} type="number" value={editBudget[name]?.budget!==undefined?editBudget[name].budget:v.budget} onChange={e=>setEditBudget(eb=>({...eb,[name]:{...eb[name],budget:e.target.value}}))} step="0.01"/>
                          </td>
                          {type==="BILLS"&&(
                            <td style={{...td,textAlign:"center"}}>
                              <input style={{...inp,width:60,textAlign:"center",padding:"5px 8px"}} type="number" placeholder="Day" min="1" max="31" value={editBudget[name]?.dueDay!==undefined?editBudget[name].dueDay:(v.dueDay||"")} onChange={e=>setEditBudget(eb=>({...eb,[name]:{...eb[name],dueDay:e.target.value}}))}/>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
              <button style={btn()} onClick={()=>{
                const u={...budgets};
                Object.entries(editBudget).forEach(([k,v])=>{
                  if(u[k]) u[k]={...u[k],
                    budget: v.budget!==undefined?parseFloat(v.budget)||0:u[k].budget,
                    dueDay: v.dueDay!==undefined?(v.dueDay?parseInt(v.dueDay):null):u[k].dueDay,
                  };
                });
                setBudgets(u); setEditBudget({});
              }}>Save Budget Targets</button>
            </div>
          </>)}

          {settingsTab==="categories"&&(<>
            <div style={{...card,marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:16}}>Add New Category</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 200px 140px auto",gap:10}}>
                <input style={inp} type="text" placeholder="Category name" value={newCat.name} onChange={e=>setNewCat(c=>({...c,name:e.target.value}))}/>
                <select style={sel} value={newCat.type} onChange={e=>setNewCat(c=>({...c,type:e.target.value}))}>
                  {TYPES.map(t=><option key={t} value={t}>{TYPE_META[t].label}</option>)}
                </select>
                <input style={inp} type="number" placeholder="Monthly budget" value={newCat.budget} onChange={e=>setNewCat(c=>({...c,budget:e.target.value}))} step="0.01" min="0"/>
                <button style={btn()} onClick={addCategory}>Add</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {TYPES.map(type=>(
                <div key={type} style={card}>
                  {sectionHead(type)}
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                    <thead><tr><th style={th}>Name</th><th style={{...th,textAlign:"right"}}>Budget</th><th style={th}></th></tr></thead>
                    <tbody>
                      {Object.entries(budgets).filter(([,v])=>v.type===type).map(([name,v])=>(
                        <tr key={name}>
                          <td style={td}>{name}</td>
                          <td style={{...td,textAlign:"right",color:C.muted}}>{fmt(v.budget)}</td>
                          <td style={td}>
                            {catDelConfirm===name
                              ?<span style={{display:"flex",gap:6}}>
                                  <button style={{...btn("danger"),padding:"4px 10px",fontSize:12}} onClick={()=>removeCategory(name)}>Remove</button>
                                  <button style={{...btn("ghost"),padding:"4px 10px",fontSize:12}} onClick={()=>setCatDelConfirm(null)}>Cancel</button>
                                </span>
                              :<button style={{...btn("ghost"),padding:"4px 10px",fontSize:12,color:C.subtle}} onClick={()=>setCatDelConfirm(name)}>✕</button>
                            }
                          </td>
                        </tr>
                      ))}
                      {Object.entries(budgets).filter(([,v])=>v.type===type).length===0&&(
                        <tr><td colSpan={3} style={{...td,color:C.subtle,textAlign:"center",padding:"16px 12px",fontSize:12.5}}>No categories</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>)}

          {settingsTab==="debt"&&(
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>Starting Balances</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Set the original balance for each debt to track payoff progress on the Overview.</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                <thead><tr><th style={th}>Debt</th><th style={{...th,textAlign:"right"}}>Starting Balance</th></tr></thead>
                <tbody>
                  {Object.entries(budgets).filter(([,v])=>v.type==="DEBT PAYMENT").map(([name,v])=>(
                    <tr key={name}>
                      <td style={td}>{name}</td>
                      <td style={{...td,textAlign:"right"}}>
                        <input style={{...inp,width:140,textAlign:"right",padding:"5px 8px"}} type="number" placeholder="e.g. 15000" value={editBudget[name]?.startingBalance!==undefined?editBudget[name].startingBalance:(v.startingBalance||"")} onChange={e=>setEditBudget(eb=>({...eb,[name]:{...eb[name],startingBalance:e.target.value}}))} step="1"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
                <button style={btn()} onClick={()=>{
                  const u={...budgets};
                  Object.entries(editBudget).forEach(([k,v])=>{ if(u[k]&&v.startingBalance!==undefined) u[k]={...u[k],startingBalance:v.startingBalance?parseFloat(v.startingBalance):null}; });
                  setBudgets(u); setEditBudget({});
                }}>Save Starting Balances</button>
              </div>
            </div>
          )}

          {settingsTab==="checkinday"&&(
            <div style={card}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.6,marginBottom:6}}>Check-in Day</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Choose which day of the week your Kova check-in auto-opens. You can always start it manually from the Check-in tab.</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day,i)=>(
                  <button key={day} onClick={()=>setCheckinDay(i)} style={{
                    padding:"10px 20px",borderRadius:8,border:`1.5px solid ${checkinDay===i?C.accent:C.border}`,
                    cursor:"pointer",fontSize:13.5,fontWeight:checkinDay===i?700:400,fontFamily:"inherit",
                    background:checkinDay===i?"#eff6ff":C.surf,
                    color:checkinDay===i?C.accent:C.text,
                    transition:"all 0.12s",
                  }}>{day}</button>
                ))}
              </div>
              <div style={{marginTop:20,fontSize:13,color:C.muted,background:C.bg,borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                Currently set to <strong style={{color:C.text}}>{"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[checkinDay]}</strong>s — check-in auto-opens on this day each week if not already completed.
              </div>
            </div>
          )}
        </>)}
      </div>
    </div>
  );
}
