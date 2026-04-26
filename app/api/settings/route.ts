import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(settings).where(eq(settings.orgId, orgId));
  return NextResponse.json(rows[0] ?? { checkinDay: 0, merchantMap: {}, monthlyNotes: {} });
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
