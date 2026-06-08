import { describe, expect, it } from "vitest";
import {
  ASSOCIATION_DEPARTMENT_IDS,
  ASSOCIATION_DEPARTMENTS,
  ENTERPRISE_MODULES,
  INTEGRATION_REGISTRY,
  DEPARTMENT_DEFAULT_CAPABILITIES,
} from "@/lib/association";

describe("association departments", () => {
  it("defines 16 HAP-style departments", () => {
    expect(ASSOCIATION_DEPARTMENT_IDS).toHaveLength(16);
    expect(ASSOCIATION_DEPARTMENTS.advocacy.name).toContain("Advocacy");
  });

  it("maps every department to default capabilities", () => {
    for (const id of ASSOCIATION_DEPARTMENT_IDS) {
      expect(DEPARTMENT_DEFAULT_CAPABILITIES[id].length).toBeGreaterThan(0);
    }
  });
});

describe("enterprise modules", () => {
  it("covers requirements 1-14", () => {
    const areas = new Set(ENTERPRISE_MODULES.map((m) => m.requirementArea));
    for (let i = 1; i <= 14; i++) {
      expect(areas.has(i)).toBe(true);
    }
  });
});

describe("integration registry", () => {
  it("includes workspace identity and executive dashboards", () => {
    const ids = INTEGRATION_REGISTRY.map((i) => i.id);
    expect(ids).toContain("microsoft_365");
    expect(ids).toContain("power_bi");
  });
});
