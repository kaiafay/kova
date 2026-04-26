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

  const clerk = await clerkClient();
  const { data: memberships } = await clerk.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    limit: 100,
  });

  const members = memberships.map((m) => ({
    userId: m.publicUserData?.userId ?? "",
    firstName: m.publicUserData?.firstName ?? null,
    lastName: m.publicUserData?.lastName ?? null,
    identifier: m.publicUserData?.identifier ?? "",
    isCreator: m.publicUserData?.userId === creatorId,
    isCurrentUser: m.publicUserData?.userId === userId,
  }));

  return NextResponse.json(members);
}
