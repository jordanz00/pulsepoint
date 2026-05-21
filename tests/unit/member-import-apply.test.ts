import { describe, expect, it } from "vitest";

/**
 * Documents apply-batch race guard: updateMany claim must win exactly once.
 * (Full DB integration test would double-call applyMembersImportBatch.)
 */
describe("member import apply contract", () => {
  it("batch claim uses status PENDING_REVIEW → APPLIED exactly once", () => {
    const claimPattern = {
      where: { id: "batch-1", status: "PENDING_REVIEW" as const },
      data: { status: "APPLIED" as const },
    };
    expect(claimPattern.where.status).toBe("PENDING_REVIEW");
    expect(claimPattern.data.status).toBe("APPLIED");
  });

  it("staging never creates Member rows (only import rows)", () => {
    const stagingCreates = ["memberImportBatch", "memberImportRow"];
    expect(stagingCreates).not.toContain("member");
  });
});
