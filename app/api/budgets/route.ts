import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { budgets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const BudgetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["INCOME", "BILLS", "EXPENSES", "DEBT PAYMENT", "SUBSCRIPTIONS"]),
  budgetAmount: z.coerce.number().min(0).finite(),
  dueDay: z.coerce.number().int().min(1).max(31).nullable().optional(),
  startingBalance: z.coerce.number().min(0).finite().nullable().optional(),
});

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(budgets).where(eq(budgets.orgId, orgId));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await req.json();
  const parsed = BudgetSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const body = parsed.data;
  const existing = await db.select().from(budgets).where(and(eq(budgets.orgId, orgId), eq(budgets.name, body.name)));
  if (existing.length > 0) {
    const updated = await db.update(budgets)
      .set({
        type: body.type,
        budgetAmount: String(body.budgetAmount),
        dueDay: body.dueDay ?? null,
        startingBalance: body.startingBalance != null ? String(body.startingBalance) : null,
      })
      .where(and(eq(budgets.orgId, orgId), eq(budgets.name, body.name)))
      .returning();
    return NextResponse.json(updated[0]);
  }
  const inserted = await db.insert(budgets).values({
    orgId,
    name: body.name,
    type: body.type,
    budgetAmount: String(body.budgetAmount),
    dueDay: body.dueDay ?? null,
    startingBalance: body.startingBalance != null ? String(body.startingBalance) : null,
  }).returning();
  return NextResponse.json(inserted[0]);
}
