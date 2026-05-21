/**
 * Clerk auth helpers — PulseCore staff/admin routes
 */

import { auth } from "@clerk/nextjs/server";
import type { OrgRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type StaffSession = {
  userId: string;
  orgId: string;
  orgSlug: string;
  role: OrgRole;
};

const ROLE_RANK: Record<OrgRole, number> = {
  STAFF: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasMinRole(role: OrgRole, minimum: OrgRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/**
 * Requires signed-in user with active Clerk organization.
 */
export async function requireStaffSession(): Promise<StaffSession> {
  const session = await auth();
  const userId = session.userId;
  const orgId = session.orgId;
  const orgSlug = session.orgSlug;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  if (!orgId || !orgSlug) {
    throw new Error("NO_ACTIVE_ORG");
  }

  const membership = await prisma.orgMembership.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });

  if (!membership) {
    throw new Error("NOT_ORG_MEMBER");
  }

  return {
    userId,
    orgId,
    orgSlug,
    role: membership.role,
  };
}

export async function requireRole(minimum: OrgRole): Promise<StaffSession> {
  const staff = await requireStaffSession();
  if (!hasMinRole(staff.role, minimum)) {
    throw new Error("FORBIDDEN");
  }
  return staff;
}
