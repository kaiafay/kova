import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const CheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  weekSpend: z.number().min(0).finite().nullable().optional(),
  weekDebt: z.number().min(0).finite().nullable().optional(),
  topCat: z.tuple([z.string().max(200), z.number().min(0).finite()]).optional(),
  notes: z.string().max(2000).optional().default(""),
});

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(checkins).where(eq(checkins.orgId, orgId));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const raw = await req.json();
  const parsed = CheckinSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const body = parsed.data;
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
