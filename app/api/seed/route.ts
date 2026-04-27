import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { budgets, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_BUDGETS = [
  { name: "Primary Salary",     type: "INCOME",        budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Side Income",        type: "INCOME",        budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Rent / Mortgage",    type: "BILLS",         budgetAmount: 0, dueDay: 1,    startingBalance: null },
  { name: "Electric",           type: "BILLS",         budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Internet",           type: "BILLS",         budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Cell Phone",         type: "BILLS",         budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Car Payment",        type: "BILLS",         budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Car Insurance",      type: "BILLS",         budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Groceries",          type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Gas",                type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Dining Out",         type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Entertainment",      type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Health",             type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Personal Care",      type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Other",              type: "EXPENSES",      budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Streaming Services", type: "SUBSCRIPTIONS", budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Gym",                type: "SUBSCRIPTIONS", budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Credit Card",        type: "DEBT PAYMENT",  budgetAmount: 0, dueDay: null, startingBalance: null },
  { name: "Student Loans",      type: "DEBT PAYMENT",  budgetAmount: 0, dueDay: null, startingBalance: null },
];

export async function POST() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Skip if already seeded
  const existing = await db.select().from(budgets).where(eq(budgets.orgId, orgId));
  if (existing.length > 0) return NextResponse.json({ ok: true, skipped: true });

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
    creatorId: userId,
    checkinDay: 0,
    merchantMap: {},
    monthlyNotes: {},
  });

  return NextResponse.json({ ok: true });
}
