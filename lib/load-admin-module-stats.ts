/**
 * Live module stat lines for admin glance — one parallel batch per org (React cache).
 */

import { cache } from "react";
import { getOrgDb } from "@/lib/db";
import { loadHospitalAssociationSnapshot } from "@/lib/hospital-association-snapshot";
import { buildAdminModuleStats } from "@/lib/platform-glance";
import type { ProductId } from "@/lib/products";

export const loadAdminModuleStats = cache(async (orgId: string): Promise<Partial<Record<ProductId, string>>> => {
  const db = getOrgDb(orgId);

  const [
    members,
    events,
    courses,
    campaigns,
    products,
    templates,
    dealCount,
    committees,
    ha,
  ] = await Promise.all([
    db.member.count({ where: { status: "ACTIVE" } }),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.course.count(),
    db.campaign.count({ where: { status: "ACTIVE" } }),
    db.commerceProduct.count({ where: { active: true } }),
    db.emailTemplate.count({ where: { approved: true } }),
    db.deal.count(),
    db.committee.count({ where: { isActive: true } }),
    loadHospitalAssociationSnapshot(orgId),
  ]);

  return buildAdminModuleStats({
    memberCount: members,
    eventCount: events,
    courseCount: courses,
    campaignCount: campaigns,
    productCount: products,
    templateCount: templates,
    dealCount,
    committeeCount: committees,
    ha,
  });
});
