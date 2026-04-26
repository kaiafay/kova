import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(checkins).where(eq(checkins.orgId, orgId));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const inserted = await db.insert(checkins).values({
    orgId,
    createdBy: userId,
    date: body.date,
    weekSpend: body.weekSpend != null ? String(body.weekSpend) : null,
    weekDebt: body.weekDebt != null ? String(body.weekDebt) : null,
    topCatName: body.topCat?.[0] ?? null,
    topCatAmount: body.topCat?.[1] != null ? String(body.topCat[1]) : null,
    notes: body.notes ?? "",
  }).returning();
  return NextResponse.json(inserted[0]);
}
