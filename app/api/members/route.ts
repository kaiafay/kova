import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [orgSettings] = await db.select().from(settings).where(eq(settings.orgId, orgId));
  const creatorId = orgSettings?.creatorId ?? null;

  let allMemberships;
  try {
    const clerk = await clerkClient();
    allMemberships = [];
    let offset = 0;
    const pageSize = 100;
    while (true) {
      const { data, totalCount } = await clerk.organizations.getOrganizationMembershipList({
        organizationId: orgId,
        limit: pageSize,
        offset,
      });
      allMemberships.push(...data);
      offset += pageSize;
      if (allMemberships.length >= totalCount) break;
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch members" }, { status: 500 });
  }

  const members = allMemberships.map((m) => ({
    userId: m.publicUserData?.userId ?? "",
    firstName: m.publicUserData?.firstName ?? null,
    lastName: m.publicUserData?.lastName ?? null,
    identifier: m.publicUserData?.identifier ?? "",
    isCreator: m.publicUserData?.userId === creatorId,
    isCurrentUser: m.publicUserData?.userId === userId,
  }));

  return NextResponse.json(members);
}
