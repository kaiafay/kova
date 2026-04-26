import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, checkins, budgets, settings } from "@/lib/db/schema";
import { eq, max, count, sum } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [[txResult], [ciResult], [bdResult], [stResult]] = await Promise.all([
    db.select({ n: count(), latest: max(transactions.createdAt) }).from(transactions).where(eq(transactions.orgId, orgId)),
    db.select({ n: count(), latest: max(checkins.createdAt) }).from(checkins).where(eq(checkins.orgId, orgId)),
    db.select({ n: count(), total: sum(budgets.budgetAmount) }).from(budgets).where(eq(budgets.orgId, orgId)),
    db.select({ checkinDay: settings.checkinDay, merchantMap: settings.merchantMap, monthlyNotes: settings.monthlyNotes }).from(settings).where(eq(settings.orgId, orgId)),
  ]);

  const fingerprint = JSON.stringify({
    txN: txResult?.n ?? 0,
    txLatest: txResult?.latest?.getTime() ?? 0,
    ciN: ciResult?.n ?? 0,
    ciLatest: ciResult?.latest?.getTime() ?? 0,
    bdN: bdResult?.n ?? 0,
    bdTotal: bdResult?.total ?? "0",
    checkinDay: stResult?.checkinDay ?? 0,
    merchantMap: stResult?.merchantMap ?? {},
    monthlyNotes: stResult?.monthlyNotes ?? {},
  });

  return NextResponse.json({ fingerprint });
}
