import { describe, expect, it } from "vitest";
import {
  buildAdvocacyCampaignOpsCards,
  buildAdvocacyCampaignWorkflowSteps,
  deriveAdvocacyCampaignLifecycle,
  participationPct,
} from "@/lib/advocacy-campaign-ops";

const base = {
  id: "c1",
  name: "Spring hospital sign-on",
  isActive: true,
  audienceId: null as string | null,
  responseCount: 0,
  targetCount: 50,
  startsAt: null,
  endsAt: null,
  createdAt: new Date("2026-06-01"),
  issue: { title: "340B protections", billNumber: "H.B. 1234", status: "ACTIVE" },
};

describe("advocacy-campaign-ops", () => {
  it("derives draft when not launched", () => {
    expect(deriveAdvocacyCampaignLifecycle(base)).toBe("draft");
  });

  it("derives collecting when launched with responses", () => {
    expect(
      deriveAdvocacyCampaignLifecycle({
        ...base,
        audienceId: "aud_1",
        responseCount: 12,
      }),
    ).toBe("collecting");
  });

  it("derives goal_met at target", () => {
    expect(
      deriveAdvocacyCampaignLifecycle({
        ...base,
        audienceId: "aud_1",
        responseCount: 50,
      }),
    ).toBe("goal_met");
  });

  it("builds workflow with current launch step for draft", () => {
    const steps = buildAdvocacyCampaignWorkflowSteps(base);
    expect(steps.find((s) => s.id === "launch")?.current).toBe(true);
    expect(steps.find((s) => s.id === "launch")?.complete).toBe(false);
  });

  it("computes participation pct", () => {
    expect(participationPct(25, 50)).toBe(50);
  });

  it("flags attention when draft in ops cards", () => {
    const cards = buildAdvocacyCampaignOpsCards(base, 0);
    expect(cards.find((c) => c.id === "attention")?.tone).toBe("attention");
  });
});
