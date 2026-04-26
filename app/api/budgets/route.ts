import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { budgets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(budgets).where(eq(budgets.orgId, orgId));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // Upsert by orgId + name
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
