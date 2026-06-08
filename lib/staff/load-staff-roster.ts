/**
 * Staff roster loader — org staff users and roles for access administration.
 */

import { prisma } from "@/lib/prisma";

export async function loadStaffRoster(orgId: string) {
  const [memberships, ownerCount] = await Promise.all([
    prisma.orgMembership.findMany({
      where: { orgId },
      include: {
        user: {
          select: { id: true, email: true, name: true, imageUrl: true },
        },
      },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    }),
    prisma.orgMembership.count({ where: { orgId, role: "OWNER" } }),
  ]);

  return { memberships, ownerCount };
}
