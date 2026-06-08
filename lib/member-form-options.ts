import { getOrgDb } from "@/lib/db";

export type MemberFormTier = { id: string; name: string; priceCents: number };
export type MemberFormOrg = { id: string; name: string; type: string };

export async function loadMemberFormOptions(orgId: string) {
  const db = getOrgDb(orgId);
  const [tiers, organizations] = await Promise.all([
    db.memberTier.findMany({
      where: { orgId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, priceCents: true },
    }),
    db.memberOrganization.findMany({
      where: { orgId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, type: true },
    }),
  ]);
  return { tiers, organizations };
}
