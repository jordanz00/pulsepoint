import { describe, expect, it } from "vitest";
import {
  buildComplianceApprovalQueue,
  buildComplianceOpsCards,
  formatAuditAction,
} from "@/lib/compliance-ops";

const snapshot = {
  dataAsOf: new Date("2026-06-11T12:00:00Z"),
  pendingImportBatches: 2,
  openExceptions: 1,
  auditEntriesLast7Days: 14,
  recentAudit: [
    {
      id: "a1",
      action: "advocacy.campaign.launch",
      entity: "AdvocacyCampaign",
      entityId: "c1",
      createdAt: new Date("2026-06-11T10:00:00Z"),
    },
  ],
  adOps: {
    campaignsTotal: 5,
    campaignsInQa: 1,
    pendingQaGates: 2,
    pendingAudienceQa: 0,
    pendingBudgetQa: 1,
    pendingCreativeQa: 2,
    recentAudit: [],
  },
};

describe("compliance-ops", () => {
  it("flags attention when imports or MLR pending", () => {
    const cards = buildComplianceOpsCards(snapshot, "demo-healthcare");
    expect(cards.find((c) => c.id === "attention")?.tone).toBe("attention");
  });

  it("builds approval queue with import action status", () => {
    const panels = buildComplianceApprovalQueue(snapshot, "demo-healthcare");
    expect(panels.find((p) => p.id === "imports")?.status).toBe("action");
    expect(panels.find((p) => p.id === "mlr")?.status).toBe("watch");
  });

  it("formats audit actions for display", () => {
    expect(formatAuditAction("member.import.approved")).toContain("import");
  });
});
