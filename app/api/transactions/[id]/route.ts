import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)));
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  const body = await req.json();
  const updated = await db.update(transactions)
    .set({ date: body.date, name: body.name, type: body.type, amount: String(body.amount), notes: body.notes ?? "" })
    .where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)))
    .returning();
  return NextResponse.json(updated[0]);
}
