/**
 * Map Entra user to PulsePoint User + OrgMembership on first login.
 */

import type { OrgRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getEntraConfig } from "@/lib/entra-config";

export type EntraProfile = {
  oid: string;
  email: string;
  name: string | null;
};

function mapEntraGroupsToRole(groups: string[]): OrgRole {
  const adminGroup = process.env.ENTRA_ADMIN_GROUP_ID?.trim();
  const ownerGroup = process.env.ENTRA_OWNER_GROUP_ID?.trim();
  if (ownerGroup && groups.includes(ownerGroup)) return "OWNER";
  if (adminGroup && groups.includes(adminGroup)) return "ADMIN";
  return "STAFF";
}

/**
 * Resolve or create staff session fields for an Entra-authenticated user.
 */
export async function provisionEntraStaff(
  profile: EntraProfile,
  groupIds: string[] = [],
): Promise<{
  userId: string;
  orgId: string;
  orgSlug: string;
  role: OrgRole;
}> {
  const cfg = getEntraConfig();
  if (!cfg) throw new Error("ENTRA_NOT_CONFIGURED");

  const org = await prisma.organization.findUnique({
    where: { slug: cfg.defaultOrgSlug },
  });
  if (!org) {
    throw new Error(`ENTRA_DEFAULT_ORG_NOT_FOUND:${cfg.defaultOrgSlug}`);
  }

  const userId = `entra_${profile.oid}`;
  const role = mapEntraGroupsToRole(groupIds);

  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: profile.email,
      name: profile.name,
    },
    update: {
      email: profile.email,
      name: profile.name ?? undefined,
    },
  });

  await prisma.orgMembership.upsert({
    where: { orgId_userId: { orgId: org.id, userId } },
    create: { orgId: org.id, userId, role },
    update: { role },
  });

  return {
    userId,
    orgId: org.id,
    orgSlug: org.slug,
    role,
  };
}
