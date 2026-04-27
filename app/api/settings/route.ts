import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { settings, transactions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

const SettingsSchema = z.object({
  checkinDay: z.number().int().min(0).max(6).optional(),
  startingBalance: z.number().finite().min(0).optional(),
  merchantMap: z.record(z.string().max(200), z.string().max(500)).optional().refine(v => !v || Object.keys(v).length <= 500, "Too many merchant map entries"),
  monthlyNotes: z.record(z.string().max(7), z.string().max(2000)).optional().refine(v => !v || Object.keys(v).length <= 120, "Too many monthly notes entries"),
});

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(settings).where(eq(settings.orgId, orgId));
  let row = rows[0];

  if (!row) {
    return NextResponse.json({ checkinDay: 0, startingBalance: "0", merchantMap: {}, monthlyNotes: {}, isOwner: false });
  }

  if (!row.creatorId) {
    const [firstTx] = await db
      .select({ createdBy: transactions.createdBy })
      .from(transactions)
      .where(eq(transactions.orgId, orgId))
      .orderBy(asc(transactions.createdAt))
      .limit(1);
    if (firstTx) {
      await db.update(settings).set({ creatorId: firstTx.createdBy }).where(eq(settings.orgId, orgId));
      row = { ...row, creatorId: firstTx.createdBy };
    }
  }

  return NextResponse.json({
    checkinDay: row.checkinDay ?? 0,
    startingBalance: row.startingBalance ?? "0",
    merchantMap: row.merchantMap ?? {},
    monthlyNotes: row.monthlyNotes ?? {},
    isOwner: row.creatorId === userId,
  });
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await req.json();
  const parsed = SettingsSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const body = parsed.data;

  const existing = await db.select().from(settings).where(eq(settings.orgId, orgId));
  if (existing.length > 0) {
    const updated = await db.update(settings)
      .set({
        checkinDay: body.checkinDay ?? existing[0].checkinDay,
        startingBalance: body.startingBalance != null ? String(body.startingBalance) : existing[0].startingBalance,
        merchantMap: body.merchantMap ?? existing[0].merchantMap,
        monthlyNotes: body.monthlyNotes ?? existing[0].monthlyNotes,
      })
      .where(eq(settings.orgId, orgId))
      .returning();
    return NextResponse.json({ ...updated[0], isOwner: updated[0].creatorId === userId });
  }
  const inserted = await db.insert(settings).values({
    orgId,
    creatorId: userId,
    checkinDay: body.checkinDay ?? 0,
    startingBalance: body.startingBalance != null ? String(body.startingBalance) : "0",
    merchantMap: body.merchantMap ?? {},
    monthlyNotes: body.monthlyNotes ?? {},
  }).returning();
  return NextResponse.json({ ...inserted[0], isOwner: inserted[0].creatorId === userId });
}
