import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: currentUserId, orgId } = await auth();
  if (!currentUserId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: targetUserId } = await params;
  const isSelf = targetUserId === currentUserId;

  if (!isSelf) {
    const [orgSettings] = await db.select().from(settings).where(eq(settings.orgId, orgId));
    if (orgSettings?.creatorId !== currentUserId) {
      return NextResponse.json({ error: "Only the budget creator can remove collaborators" }, { status: 403 });
    }
    if (orgSettings?.creatorId === targetUserId) {
      return NextResponse.json({ error: "Cannot remove the budget creator" }, { status: 403 });
    }
  }

  try {
    const clerk = await clerkClient();
    await clerk.organizations.deleteOrganizationMembership({ organizationId: orgId, userId: targetUserId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
