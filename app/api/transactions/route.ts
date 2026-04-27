import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";

const TransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  name: z.string().min(1).max(200),
  type: z.enum(["INCOME", "BILLS", "EXPENSES", "DEBT PAYMENT", "SUBSCRIPTIONS"]),
  amount: z.coerce.number().positive().finite().max(10_000_000),
  notes: z.string().max(1000).optional().default(""),
});

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const monthParam = req.nextUrl.searchParams.get("month");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "1000", 10) || 1000, 5000);
  const offset = Math.max(0, parseInt(req.nextUrl.searchParams.get("offset") ?? "0", 10) || 0);
  if (monthParam !== null && !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
    return NextResponse.json({ error: "Invalid month format" }, { status: 400 });
  }
  let rows;
  if (monthParam) {
    rows = await db.select().from(transactions).where(and(eq(transactions.orgId, orgId), like(transactions.date, `${monthParam}%`))).limit(limit).offset(offset);
  } else {
    rows = await db.select().from(transactions).where(eq(transactions.orgId, orgId)).limit(limit).offset(offset);
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const parsed = z.array(TransactionSchema).safeParse(items);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const inserted = await db.insert(transactions).values(
    parsed.data.map(t => ({
      orgId,
      createdBy: userId,
      date: t.date,
      name: t.name,
      type: t.type,
      amount: String(t.amount),
      notes: t.notes ?? "",
    }))
  ).returning();
  return NextResponse.json(inserted);
}
