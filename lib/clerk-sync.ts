/**
 * Mirror Clerk users/orgs into Postgres + seed OWNER membership + audit entry.
 */

import type { OrgRole } from "@/app/generated/prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function upsertUserFromClerk(data: {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}): Promise<void> {
  await prisma.user.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      email: data.email,
      name: data.name ?? null,
      imageUrl: data.imageUrl ?? null,
    },
    update: {
      email: data.email,
      name: data.name ?? null,
      imageUrl: data.imageUrl ?? null,
    },
  });
}

export async function upsertOrganizationFromClerk(data: {
  id: string;
  slug: string;
  name: string;
}): Promise<{ created: boolean }> {
  const existing = await prisma.organization.findUnique({
    where: { id: data.id },
  });

  await prisma.organization.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      slug: data.slug,
      name: data.name,
    },
    update: {
      slug: data.slug,
      name: data.name,
    },
  });

  return { created: !existing };
}

export async function upsertOrgMembership(data: {
  orgId: string;
  userId: string;
  role: OrgRole;
}): Promise<void> {
  await prisma.orgMembership.upsert({
    where: {
      orgId_userId: { orgId: data.orgId, userId: data.userId },
    },
    create: {
      orgId: data.orgId,
      userId: data.userId,
      role: data.role,
    },
    update: {
      role: data.role,
    },
  });
}

export async function recordOrgCreatedAudit(
  orgId: string,
  userId: string | null,
  payload: { slug: string; name: string },
): Promise<void> {
  await writeAuditLog({
    orgId,
    userId,
    action: "organization.created",
    entity: "Organization",
    entityId: orgId,
    diff: payload,
  });
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await prisma.organization.delete({ where: { id: orgId } }).catch(() => {
    /* idempotent */
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } }).catch(() => {
    /* idempotent */
  });
}
