/**
 * Platform Glance — shared config for marketing + admin suite explorer.
 * Single source: PULSE_PRODUCTS + glance views (honest Live / Preview labels).
 */

import type { ProductId } from "@/lib/products";
import type { HospitalAssociationSnapshot } from "@/lib/hospital-association-snapshot";

export {
  GLANCE_SUITE_METRICS,
  GLANCE_VIEWS,
  GLANCE_AUDIENCES,
  GLANCE_FOUNDATIONS,
  GLANCE_LAYER_ORDER,
  PULSE_PRODUCTS,
  PRODUCT_LAYER_LABEL,
  type GlanceViewId,
} from "@/lib/glance-marketing-preview";

/** Live module subtitles for admin glance (from org database — no invented stats). */
export function buildAdminModuleStats(input: {
  memberCount: number;
  eventCount: number;
  courseCount: number;
  campaignCount: number;
  productCount: number;
  templateCount: number;
  dealCount: number;
  committeeCount: number;
  ha: HospitalAssociationSnapshot;
}): Partial<Record<ProductId, string>> {
  const { memberCount, eventCount, courseCount, campaignCount, productCount, templateCount, dealCount, committeeCount, ha } =
    input;

  return {
    work: "Executive briefing & tasks",
    members: `${memberCount} members · ${ha.hospitalAccounts} hospitals`,
    crm: "Contacts & workflows",
    deals: `${dealCount} open opportunities`,
    events: `${eventCount} published events`,
    advertising: "Campaign sync preview",
    learn: `${courseCount} courses in catalog`,
    giving: `${campaignCount} active campaigns`,
    commerce: `${productCount} products live`,
    engage: `${templateCount} approved templates`,
    insights: "Board KPIs from your database",
    advocacy: `${ha.activeAdvocacyIssues} issues · ${ha.activeCampaigns} campaigns`,
  };
}
