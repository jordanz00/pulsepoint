/**
 * Clerk auth helpers — PulsePoint staff/admin routes.
 *
 * Demo mode short-circuit: if DEMO_MODE=true (non-prod only) and the request
 * carries a valid signed demo cookie, `requireStaffSession` and
 * `requireOrgAccessForSlug` return the seeded demo owner WITHOUT calling
 * Clerk. This is what lets leadership / preview environments click through
 * the prototype without Clerk setup. See lib/demo-mode.ts for the gates.
 */

import type { OrgRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEMO_ORG_SLUG,
  getDemoSession,
  isDemoModeEnabled,
} from "@/lib/demo-mode";
import { isStandalonePrototype } from "@/lib/standalone-prototype";

async function clerkAuth() {
  const { auth } = await import("@clerk/nextjs/server");
  return auth();
}

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
 *
 * In demo mode (non-prod + DEMO_MODE=true + valid demo cookie) this returns
 * the seeded demo owner instead of consulting Clerk.
 */
export async function requireStaffSession(): Promise<StaffSession> {
  if (isDemoModeEnabled()) {
    const demo = await getDemoSession();
    if (demo) {
      return {
        userId: demo.userId,
        orgId: demo.orgId,
        orgSlug: demo.orgSlug,
        role: demo.role,
      };
    }
    if (isStandalonePrototype()) {
      throw new Error("UNAUTHORIZED");
    }
  }

  const session = await clerkAuth();
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

/**
 * Admin RSC routes: user must be a member of the org in the URL (not only Clerk active org).
 *
 * In demo mode the demo owner is only honored when `orgSlug` matches the
 * fixed demo org slug — visiting any other org URL still requires Clerk.
 */
export async function requireOrgAccessForSlug(orgSlug: string): Promise<StaffSession> {
  if (isDemoModeEnabled()) {
    const demo = await getDemoSession();
    if (demo) {
      if (orgSlug !== DEMO_ORG_SLUG) {
        throw new Error("NOT_ORG_MEMBER");
      }
      return {
        userId: demo.userId,
        orgId: demo.orgId,
        orgSlug: demo.orgSlug,
        role: demo.role,
      };
    }
    if (isStandalonePrototype()) {
      throw new Error("UNAUTHORIZED");
    }
  }

  const session = await clerkAuth();
  const userId = session.userId;
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });
  if (!org) {
    throw new Error("ORG_NOT_FOUND");
  }

  const membership = await prisma.orgMembership.findUnique({
    where: { orgId_userId: { orgId: org.id, userId } },
  });
  if (!membership) {
    throw new Error("NOT_ORG_MEMBER");
  }

  return {
    userId,
    orgId: org.id,
    orgSlug: org.slug,
    role: membership.role,
  };
}

/**
 * Prevents Org A staff from invoking actions while viewing Org B bookmark URL.
 */
export function assertOrgSlugForStaff(
  staff: StaffSession,
  orgSlugFromClient: string | undefined,
): void {
  if (!orgSlugFromClient) return;
  if (orgSlugFromClient !== staff.orgSlug) {
    throw new Error("ORG_MISMATCH");
  }
}

/**
 * Portal: signed-in Clerk user must not use staff org session against another org's portal.
 */
export function assertPortalOrgAccess(
  sessionOrgId: string | null | undefined,
  targetOrgId: string,
): void {
  if (sessionOrgId && sessionOrgId !== targetOrgId) {
    throw new Error("ORG_MISMATCH");
  }
}
