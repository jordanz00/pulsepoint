/**
 * Resolve the signed-in portal user to an org Member record.
 */
import { assertPortalOrgAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { getDemoSession, isDemoModeEnabled } from "@/lib/demo-mode";
import { getOrgDb, prisma } from "@/lib/db";
import { tryAutoLinkPortalMember } from "@/lib/portal/link-portal-member";
import { isStandalonePrototype } from "@/lib/standalone-prototype";
import type { Member, Organization } from "@/app/generated/prisma/client";

export type PortalMemberContext =
  | { ok: true; org: Organization; member: Member; userId: string }
  | { ok: false; error: string };

async function portalAuth(): Promise<{ userId: string; orgId: string | null } | null> {
  if (isDemoModeEnabled()) {
    const demo = await getDemoSession();
    if (demo) return { userId: demo.userId, orgId: demo.orgId };
    if (isStandalonePrototype()) return null;
  }
  const { auth } = await import("@clerk/nextjs/server");
  const session = await auth();
  if (!session.userId) return null;
  return { userId: session.userId, orgId: session.orgId ?? null };
}

export async function resolvePortalMember(orgSlug: string): Promise<PortalMemberContext> {
  const session = await portalAuth();
  if (!session) return { ok: false, error: "Sign in required" };

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false, error: "Organization not found" };

  try {
    assertPortalOrgAccess(session.orgId, org.id);
  } catch {
    return { ok: false, error: "Organization mismatch" };
  }

  const db = getOrgDb(org.id);
  let member = await db.member.findFirst({
    where: { clerkUserId: session.userId },
  });

  if (!member) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });
    if (user?.email) {
      const linked = await tryAutoLinkPortalMember(
        db,
        org.id,
        session.userId,
        user.email,
      );
      if (linked.ok) {
        member = linked.member;
        await writeAuditLog({
          orgId: org.id,
          userId: session.userId,
          action: "portal.member.linked.auto",
          entity: "Member",
          entityId: member.id,
          diff: { clerkUserId: session.userId, email: user.email },
        });
      }
    }
  }

  if (!member && isDemoModeEnabled()) {
    const demo = await getDemoSession();
    if (demo && session.userId === demo.userId) {
      member = await db.member.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { joinedAt: "asc" },
      });
    }
  }

  if (!member) {
    return {
      ok: false,
      error:
        "No member profile linked to this account. Use the same email as your roster record or ask staff to link your account.",
    };
  }

  return { ok: true, org, member, userId: session.userId };
}
