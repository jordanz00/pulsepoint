/**
 * Load AMS Intelligence for an organization by slug.
 */
import { prisma } from "@/lib/prisma";
import { buildOrgInsights } from "@/lib/intelligence/build-org-insights";
import type { OrgInsightsResult } from "@/lib/intelligence/types";

export async function loadOrgInsights(
  orgSlug: string,
): Promise<OrgInsightsResult | null> {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;
  return buildOrgInsights(org.id, orgSlug);
}
