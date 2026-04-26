import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const clerk = await clerkClient();
  const org = await clerk.organizations.createOrganization({ name: name.trim(), createdBy: userId });

  // Seed via internal fetch — set active org first
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // We can't set the org in the session here, so we seed directly
  const { db } = await import("@/lib/db");
  const { transactions, budgets, settings } = await import("@/lib/db/schema");

  const SEED_TRANSACTIONS = [
    { date: "2026-04-01", name: "Gas", type: "EXPENSES", amount: 50.55, notes: "" },
    { date: "2026-04-01", name: "Other", type: "EXPENSES", amount: 209.00, notes: "Relentless Sub" },
    { date: "2026-04-01", name: "Food", type: "EXPENSES", amount: 44.13, notes: "" },
    { date: "2026-04-01", name: "Food", type: "EXPENSES", amount: 134.61, notes: "" },
    { date: "2026-04-01", name: "Other", type: "EXPENSES", amount: 54.99, notes: "Physiq Annual Fee" },
    { date: "2026-04-01", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 180.00, notes: "" },
    { date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 325.00, notes: "" },
    { date: "2026-04-02", name: "Rich Fun", type: "EXPENSES", amount: 25.98, notes: "Amazon" },
    { date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
    { date: "2026-04-02", name: "Rich Debt", type: "DEBT PAYMENT", amount: 559.75, notes: "Global GHLLC" },
    { date: "2026-04-02", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
    { date: "2026-04-02", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
    { date: "2026-04-03", name: "Rich Debt", type: "DEBT PAYMENT", amount: 229.95, notes: "" },
    { date: "2026-04-03", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
    { date: "2026-04-03", name: "Food", type: "EXPENSES", amount: 1.52, notes: "" },
    { date: "2026-04-03", name: "Electric", type: "EXPENSES", amount: 70.00, notes: "" },
    { date: "2026-04-03", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 120.77, notes: "" },
    { date: "2026-04-03", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 86.68, notes: "" },
    { date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 43.17, notes: "Soda" },
    { date: "2026-04-06", name: "Rich Debt", type: "DEBT PAYMENT", amount: 125.00, notes: "" },
    { date: "2026-04-06", name: "Kaia Fun", type: "EXPENSES", amount: 42.09, notes: "Toxic Burger" },
    { date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 7.83, notes: "" },
    { date: "2026-04-06", name: "Kaia Fun", type: "EXPENSES", amount: 30.00, notes: "Movie Tickets" },
    { date: "2026-04-06", name: "Food", type: "EXPENSES", amount: 49.73, notes: "" },
    { date: "2026-04-07", name: "Crunch", type: "INCOME", amount: 270.82, notes: "" },
    { date: "2026-04-07", name: "Couch", type: "BILLS", amount: 38.00, notes: "" },
    { date: "2026-04-07", name: "Rich Debt", type: "DEBT PAYMENT", amount: 500.00, notes: "" },
    { date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 19.95, notes: "Amazon" },
    { date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 24.63, notes: "Amazon" },
    { date: "2026-04-08", name: "Rich Fun", type: "EXPENSES", amount: 12.99, notes: "Amazon" },
    { date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 18.99, notes: "" },
    { date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 250.00, notes: "" },
    { date: "2026-04-08", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 118.00, notes: "" },
    { date: "2026-04-08", name: "Gym", type: "SUBSCRIPTIONS", amount: 31.99, notes: "" },
    { date: "2026-04-09", name: "Car Payment", type: "BILLS", amount: 355.88, notes: "" },
    { date: "2026-04-10", name: "Rich Salary", type: "INCOME", amount: 2732.96, notes: "" },
    { date: "2026-04-10", name: "Rich Debt", type: "DEBT PAYMENT", amount: 125.00, notes: "" },
    { date: "2026-04-10", name: "Food", type: "EXPENSES", amount: 66.32, notes: "" },
    { date: "2026-04-13", name: "Rich Fun", type: "EXPENSES", amount: 17.86, notes: "" },
    { date: "2026-04-13", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
    { date: "2026-04-13", name: "Gas", type: "EXPENSES", amount: 33.35, notes: "" },
    { date: "2026-04-13", name: "Kaia Fun", type: "EXPENSES", amount: 11.50, notes: "Cinemark" },
    { date: "2026-04-13", name: "Rich Fun", type: "EXPENSES", amount: 4.75, notes: "Dairy Queen" },
    { date: "2026-04-13", name: "Kaia Fun", type: "EXPENSES", amount: 16.08, notes: "Cinemark" },
    { date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 30.14, notes: "" },
    { date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 16.06, notes: "" },
    { date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 21.69, notes: "" },
    { date: "2026-04-13", name: "Other", type: "EXPENSES", amount: 9.85, notes: "Chick Fil A" },
    { date: "2026-04-13", name: "Other", type: "EXPENSES", amount: 13.56, notes: "Taco Bell" },
    { date: "2026-04-13", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
    { date: "2026-04-13", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 44.54, notes: "" },
    { date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 102.64, notes: "" },
    { date: "2026-04-13", name: "Food", type: "EXPENSES", amount: 12.96, notes: "" },
    { date: "2026-04-14", name: "Software Eng.", type: "INCOME", amount: 2722.50, notes: "" },
    { date: "2026-04-14", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 817.00, notes: "Taxes" },
    { date: "2026-04-14", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 80.00, notes: "" },
    { date: "2026-04-14", name: "Rent", type: "BILLS", amount: 1100.00, notes: "" },
    { date: "2026-04-15", name: "Rich Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
    { date: "2026-04-15", name: "Cats", type: "EXPENSES", amount: 47.48, notes: "" },
    { date: "2026-04-16", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 200.00, notes: "" },
    { date: "2026-04-16", name: "Rich Debt", type: "DEBT PAYMENT", amount: 325.00, notes: "" },
    { date: "2026-04-17", name: "Food", type: "EXPENSES", amount: 66.59, notes: "" },
    { date: "2026-04-17", name: "Kaia Debt", type: "DEBT PAYMENT", amount: 120.76, notes: "" },
    { date: "2026-04-17", name: "Gym", type: "SUBSCRIPTIONS", amount: 29.99, notes: "" },
    { date: "2026-04-17", name: "Rent", type: "BILLS", amount: 468.00, notes: "" },
    { date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 225.00, notes: "" },
    { date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 70.00, notes: "" },
    { date: "2026-04-20", name: "Rich Fun", type: "EXPENSES", amount: 10.00, notes: "Book" },
    { date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 150.70, notes: "" },
    { date: "2026-04-20", name: "Rich Debt", type: "DEBT PAYMENT", amount: 160.41, notes: "" },
    { date: "2026-04-21", name: "Other", type: "EXPENSES", amount: 15.25, notes: "" },
    { date: "2026-04-22", name: "Rich Fun", type: "EXPENSES", amount: 9.99, notes: "Crunchyroll" },
    { date: "2026-04-24", name: "Rich Debt", type: "DEBT PAYMENT", amount: 100.00, notes: "" },
    { date: "2026-04-24", name: "Health", type: "EXPENSES", amount: 23.95, notes: "Creatine" },
    { date: "2026-04-24", name: "Rich Salary", type: "INCOME", amount: 2732.97, notes: "" },
    { date: "2026-04-24", name: "Other", type: "EXPENSES", amount: 9.99, notes: "Apple subscription" },
    { date: "2026-04-24", name: "Food", type: "EXPENSES", amount: 71.55, notes: "" },
    { date: "2026-04-24", name: "Cell Phone", type: "BILLS", amount: 200.00, notes: "" },
    { date: "2026-04-24", name: "Cats", type: "EXPENSES", amount: 49.96, notes: "" },
    { date: "2026-04-24", name: "Food", type: "EXPENSES", amount: 99.65, notes: "" },
  ];

  const DEFAULT_BUDGETS = [
    { name: "Software Eng.", type: "INCOME",        budgetAmount: 4800,    dueDay: null, startingBalance: null },
    { name: "Crunch",        type: "INCOME",        budgetAmount: 200,     dueDay: null, startingBalance: null },
    { name: "Rich Salary",   type: "INCOME",        budgetAmount: 4300,    dueDay: null, startingBalance: null },
    { name: "Cell Phone",    type: "BILLS",         budgetAmount: 200,     dueDay: 24,   startingBalance: null },
    { name: "Car Insurance", type: "BILLS",         budgetAmount: 238.22,  dueDay: 23,   startingBalance: null },
    { name: "Car Payment",   type: "BILLS",         budgetAmount: 355,     dueDay: 8,    startingBalance: null },
    { name: "Couch",         type: "BILLS",         budgetAmount: 35,      dueDay: 7,    startingBalance: null },
    { name: "Rent",          type: "BILLS",         budgetAmount: 2125,    dueDay: 1,    startingBalance: null },
    { name: "Food",          type: "EXPENSES",      budgetAmount: 500,     dueDay: null, startingBalance: null },
    { name: "Cats",          type: "EXPENSES",      budgetAmount: 120,     dueDay: null, startingBalance: null },
    { name: "Gas",           type: "EXPENSES",      budgetAmount: 100,     dueDay: null, startingBalance: null },
    { name: "Electric",      type: "EXPENSES",      budgetAmount: 65,      dueDay: null, startingBalance: null },
    { name: "Rich Fun",      type: "EXPENSES",      budgetAmount: 100,     dueDay: null, startingBalance: null },
    { name: "Kaia Fun",      type: "EXPENSES",      budgetAmount: 100,     dueDay: null, startingBalance: null },
    { name: "Health",        type: "EXPENSES",      budgetAmount: 100,     dueDay: null, startingBalance: null },
    { name: "Other",         type: "EXPENSES",      budgetAmount: 0,       dueDay: null, startingBalance: null },
    { name: "Rich Debt",     type: "DEBT PAYMENT",  budgetAmount: 2435,    dueDay: null, startingBalance: 15000 },
    { name: "Kaia Debt",     type: "DEBT PAYMENT",  budgetAmount: 2200.54, dueDay: null, startingBalance: 12000 },
    { name: "Gym",           type: "SUBSCRIPTIONS", budgetAmount: 60,      dueDay: 8,    startingBalance: null },
  ];

  const orgId = org.id;

  await db.insert(transactions).values(
    SEED_TRANSACTIONS.map(t => ({
      orgId,
      createdBy: userId,
      date: t.date,
      name: t.name,
      type: t.type,
      amount: String(t.amount),
      notes: t.notes,
    }))
  );

  await db.insert(budgets).values(
    DEFAULT_BUDGETS.map(b => ({
      orgId,
      name: b.name,
      type: b.type,
      budgetAmount: String(b.budgetAmount),
      dueDay: b.dueDay ?? null,
      startingBalance: b.startingBalance != null ? String(b.startingBalance) : null,
    }))
  );

  await db.insert(settings).values({
    orgId,
    checkinDay: 0,
    merchantMap: {},
    monthlyNotes: {},
  });

  return NextResponse.json({ ok: true, orgId: org.id, orgSlug: org.slug });
}
