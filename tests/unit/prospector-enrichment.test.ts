import { describe, expect, it } from "vitest";
import { enrichProspect } from "@/lib/crm/prospector-enrichment";

describe("prospector enrichment", () => {
  it("infers healthcare ICP from hospital domain", () => {
    const f = enrichProspect({
      email: "ceo@sterling-health.org",
      firstName: "Jane",
      lastName: "Rivera",
      company: "Sterling Health System",
    });
    expect(f.industry).toBe("Healthcare");
    expect(["strong", "moderate"]).toContain(f.icpMatch);
  });

  it("returns stable output for same input", () => {
    const a = enrichProspect({ email: "a@acme-hospital.com", company: "Acme Hospital" });
    const b = enrichProspect({ email: "a@acme-hospital.com", company: "Acme Hospital" });
    expect(a.industry).toBe(b.industry);
    expect(a.employeeCountRange).toBe(b.employeeCountRange);
  });
});
