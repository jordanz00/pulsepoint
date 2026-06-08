import { describe, expect, it } from "vitest";
import { resolveCareerFairBooths } from "@/lib/events/career-fair-booths";
import { buildProtechGlCsv, demoGlExportLines } from "@/lib/finance/protech-gl-export";

describe("career fair booths", () => {
  it("reads booths from micrositeConfig", () => {
    const booths = resolveCareerFairBooths({
      careerFair: {
        booths: [
          {
            id: "b1",
            employerName: "Test Hospital",
            boothNumber: "A1",
            pitch: "Regional system",
            rolesHiring: "RN",
          },
        ],
      },
    });
    expect(booths).toHaveLength(1);
    expect(booths[0]?.employerName).toBe("Test Hospital");
  });

  it("falls back to sponsors when no config booths", () => {
    const booths = resolveCareerFairBooths(null, [
      {
        id: "s1",
        name: "Acme Health",
        tier: "Gold sponsor",
        boothNumber: "B2",
        logoUrl: "",
        websiteUrl: "",
      },
    ]);
    expect(booths[0]?.boothNumber).toBe("B2");
  });
});

describe("protech GL export", () => {
  it("builds CSV with header and preview rows", () => {
    const csv = buildProtechGlCsv({ orgName: "Sterling", lines: demoGlExportLines() });
    expect(csv.split("\n").length).toBeGreaterThan(3);
    expect(csv).toContain("validation_status");
    expect(csv).toContain("preview");
  });
});
