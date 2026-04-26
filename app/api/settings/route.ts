import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings, transactions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(settings).where(eq(settings.orgId, orgId));
  let row = rows[0];

  if (!row) {
    return NextResponse.json({ checkinDay: 0, merchantMap: {}, monthlyNotes: {}, isOwner: false });
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
    merchantMap: row.merchantMap ?? {},
    monthlyNotes: row.monthlyNotes ?? {},
    isOwner: row.creatorId === userId,
  });
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const existing = await db.select().from(settings).where(eq(settings.orgId, orgId));
  if (existing.length > 0) {
    const updated = await db.update(settings)
      .set({
        checkinDay: body.checkinDay ?? existing[0].checkinDay,
        merchantMap: body.merchantMap ?? existing[0].merchantMap,
        monthlyNotes: body.monthlyNotes ?? existing[0].monthlyNotes,
      })
      .where(eq(settings.orgId, orgId))
      .returning();
    return NextResponse.json(updated[0]);
  }
  const inserted = await db.insert(settings).values({
    orgId,
    checkinDay: body.checkinDay ?? 0,
    merchantMap: body.merchantMap ?? {},
    monthlyNotes: body.monthlyNotes ?? {},
  }).returning();
  return NextResponse.json(inserted[0]);
}
