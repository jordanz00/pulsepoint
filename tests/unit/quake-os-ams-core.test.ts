import { describe, expect, it } from "vitest";
import { listAmsModules, getDomainCoverage, AMS_CORE_DOMAINS } from "@/quake-os/ams/core/modules";
import { getAmsPlatformSummary } from "@/quake-os/ams/core/services";

describe("AMS core services", () => {
  it("lists enterprise modules", () => {
    const modules = listAmsModules();
    expect(modules.length).toBeGreaterThan(5);
    expect(modules.some((m) => m.id === "membership_crm")).toBe(true);
  });

  it("maps core domains", () => {
    expect(AMS_CORE_DOMAINS).toContain("advocacy");
    const coverage = getDomainCoverage();
    expect(coverage.length).toBe(AMS_CORE_DOMAINS.length);
  });

  it("returns platform summary", () => {
    const summary = getAmsPlatformSummary();
    expect(summary.totalModules).toBeGreaterThan(0);
    expect(summary.domains.length).toBe(10);
  });
});
