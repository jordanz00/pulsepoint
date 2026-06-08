import { describe, expect, it } from "vitest";
import { buildAdminModuleStats } from "@/lib/platform-glance";
import { productHref } from "@/lib/products";
import { PULSE_PRODUCTS } from "@/lib/products";

describe("platform glance", () => {
  it("buildAdminModuleStats uses live counts without inventing numbers", () => {
    const stats = buildAdminModuleStats({
      memberCount: 1200,
      eventCount: 8,
      courseCount: 12,
      campaignCount: 3,
      productCount: 5,
      templateCount: 7,
      dealCount: 24,
      committeeCount: 4,
      ha: {
        hospitalAccounts: 235,
        membersOnHospitalRoster: 1200,
        hospitalEngagementPct: 68,
        hospitalsWithTakeActionResponse: 410,
        activeAdvocacyIssues: 6,
        activeCampaigns: 2,
        committeeCount: 4,
        emergencyContactCount: 12,
        integrationCount: 3,
      },
    });
    expect(stats.members).toContain("1200 members");
    expect(stats.members).toContain("235 hospitals");
    expect(stats.advocacy).toBe("6 issues · 2 campaigns");
  });

  it("every product links under org slug for admin navigation", () => {
    for (const product of PULSE_PRODUCTS) {
      const href = productHref("demo-healthcare", product);
      expect(href.startsWith("/demo-healthcare/")).toBe(true);
    }
  });
});
