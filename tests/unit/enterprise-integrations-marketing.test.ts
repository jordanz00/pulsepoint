import { describe, expect, it } from "vitest";
import { ENTERPRISE_INTEGRATIONS_MARKETING } from "@/lib/marketing-home";
import {
  ENTERPRISE_GO_LIVE_STEPS,
  INTEGRATION_PREVIEW_CARDS,
} from "@/lib/enterprise-integrations-marketing-preview";

describe("Enterprise integrations marketing", () => {
  it("defines three IT-focused outcomes", () => {
    expect(ENTERPRISE_INTEGRATIONS_MARKETING.outcomes).toHaveLength(3);
    for (const o of ENTERPRISE_INTEGRATIONS_MARKETING.outcomes) {
      expect(o.features.length).toBeGreaterThanOrEqual(4);
      expect(o.itNote.length).toBeGreaterThan(5);
    }
  });

  it("does not over-claim Power BI embed or automatic backups", () => {
    const text = [
      ENTERPRISE_INTEGRATIONS_MARKETING.disclaimer,
      ...ENTERPRISE_INTEGRATIONS_MARKETING.itReassurances,
    ]
      .join(" ")
      .toLowerCase();
    expect(text).not.toMatch(/automatic backups/);
    expect(text).toMatch(/export|continuity|script/);
    expect(ENTERPRISE_INTEGRATIONS_MARKETING.disclaimer.toLowerCase()).toContain("roadmap");
  });

  it("uses honest integration status labels in preview", () => {
    const powerBi = INTEGRATION_PREVIEW_CARDS.find((c) => c.id === "powerbi");
    expect(powerBi?.statusLabel).toMatch(/export/i);
    expect(powerBi?.statusLabel).not.toBe("Live");
    const entra = INTEGRATION_PREVIEW_CARDS.find((c) => c.id === "entra");
    expect(entra?.statusLabel).toMatch(/pilot/i);
  });

  it("documents four go-live steps for IT handoff", () => {
    expect(ENTERPRISE_GO_LIVE_STEPS).toHaveLength(4);
    expect(ENTERPRISE_GO_LIVE_STEPS.map((s) => s.title).join(" ").toLowerCase()).toMatch(
      /microsoft|easydnn|import|publish/,
    );
  });
});
