import { describe, expect, it } from "vitest";
import { buildSyncOpsCards, syncHealthStatus } from "@/lib/sync-ops";

const snapshot = {
  dataAsOf: new Date("2026-06-11T12:00:00Z"),
  openExceptions: 2,
  failedExceptions: 1,
  pendingImportBatches: 1,
  importRowsPending: 24,
  adOpsFailedJobs: 1,
  adOpsTotalJobs: 8,
  recentFailures: [],
};

describe("sync-ops", () => {
  it("marks critical when failed exceptions or ad jobs", () => {
    expect(syncHealthStatus(snapshot)).toBe("critical");
  });

  it("flags attention in ops cards", () => {
    const cards = buildSyncOpsCards(snapshot, "demo-healthcare");
    expect(cards.find((c) => c.id === "attention")?.tone).toBe("attention");
  });

  it("reports healthy when queues clear", () => {
    expect(
      syncHealthStatus({
        ...snapshot,
        openExceptions: 0,
        failedExceptions: 0,
        pendingImportBatches: 0,
        adOpsFailedJobs: 0,
      }),
    ).toBe("healthy");
  });
});
