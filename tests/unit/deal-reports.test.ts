import { describe, expect, it } from "vitest";
import {
  computeDealProgress,
  computeLostByStage,
  computeTeamLeaderboard,
} from "@/lib/deals/reports";

const sampleDeals = [
  {
    id: "1",
    orgId: "o1",
    pipelineId: "p1",
    title: "A",
    amountCents: 100_000,
    stage: "WON" as const,
    lostAtStage: null,
    lossReasonId: null,
    assigneeId: null,
    assigneeName: "Jordan Lee",
    memberId: null,
    expectedCloseAt: null,
    closedAt: new Date("2025-03-01"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "2",
    orgId: "o1",
    pipelineId: "p1",
    title: "B",
    amountCents: 50_000,
    stage: "LOST" as const,
    lostAtStage: "PROPOSAL" as const,
    lossReasonId: "r1",
    assigneeId: null,
    assigneeName: "Alex Morgan",
    memberId: null,
    expectedCloseAt: null,
    closedAt: new Date("2025-02-15"),
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-02-15"),
  },
  {
    id: "3",
    orgId: "o1",
    pipelineId: "p1",
    title: "C",
    amountCents: 75_000,
    stage: "PROPOSAL" as const,
    lostAtStage: null,
    lossReasonId: null,
    assigneeId: null,
    assigneeName: "Jordan Lee",
    memberId: null,
    expectedCloseAt: new Date("2025-06-01"),
    closedAt: null,
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
];

describe("deal reports", () => {
  it("counts deal progress by stage", () => {
    const r = computeDealProgress(sampleDeals, {});
    expect(r.kind).toBe("segments");
    if (r.kind !== "segments") return;
    const won = r.segments.find((s) => s.label === "Won");
    expect(won?.value).toBe(1);
  });

  it("groups lost deals by lost-at stage", () => {
    const r = computeLostByStage(sampleDeals, {});
    expect(r.kind).toBe("segments");
    if (r.kind !== "segments") return;
    expect(r.segments.some((s) => s.label === "Proposal" && s.value === 1)).toBe(true);
  });

  it("builds team leaderboard", () => {
    const r = computeTeamLeaderboard(sampleDeals, {});
    expect(r.kind).toBe("table");
    if (r.kind !== "table") return;
    expect(r.rows.length).toBeGreaterThan(0);
    expect(r.rows[0]![0]).toBe("Jordan Lee");
  });
});
