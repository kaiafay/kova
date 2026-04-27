import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  await db.delete(checkins).where(and(eq(checkins.id, id), eq(checkins.orgId, orgId)));
  return NextResponse.json({ ok: true });
}
