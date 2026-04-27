import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const UpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  name: z.string().min(1).max(200),
  type: z.enum(["INCOME", "BILLS", "EXPENSES", "DEBT PAYMENT", "SUBSCRIPTIONS"]),
  amount: z.coerce.number().positive().finite().max(10_000_000),
  notes: z.string().max(1000).optional().default(""),
});

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)));
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const raw = await req.json();
  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const body = parsed.data;
  const updated = await db.update(transactions)
    .set({ date: body.date, name: body.name, type: body.type, amount: String(body.amount), notes: body.notes ?? "" })
    .where(and(eq(transactions.id, id), eq(transactions.orgId, orgId)))
    .returning();
  if (updated.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated[0]);
}
