import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = req.nextUrl.searchParams.get("month");
  let rows;
  if (month) {
    rows = await db.select().from(transactions).where(and(eq(transactions.orgId, orgId), like(transactions.date, `${month}%`)));
  } else {
    rows = await db.select().from(transactions).where(eq(transactions.orgId, orgId));
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const inserted = await db.insert(transactions).values(
    items.map(t => ({
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
