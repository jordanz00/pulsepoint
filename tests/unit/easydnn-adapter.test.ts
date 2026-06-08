import { describe, expect, it } from "vitest";
import { buildEasyDnnEventModule } from "@/lib/adapters/cms/easydnn-html";

describe("EasyDNN adapter", () => {
  it("builds safe HTML module with site config in manifest", () => {
    const bundle = buildEasyDnnEventModule({
      orgName: "Sterling Healthcare",
      orgSlug: "demo-healthcare",
      registrationUrl: "https://app.example/demo-healthcare/e/summit",
      accent: "#2563eb",
      siteConfig: {
        siteUrl: "https://www.sterling.org",
        eventsPagePath: "/events",
        registrationMode: "pulsepoint",
      },
      event: {
        title: "Annual Summit",
        description: "Join leaders across the state.",
        startsAt: new Date("2026-09-15T09:00:00Z"),
        endsAt: null,
        publicSlug: "summit",
        venueName: "Harrisburg",
        format: "IN_PERSON",
      },
      speakers: [{ name: "Dr. Lee", title: "CEO", role: "KEYNOTE" }],
      sponsors: [],
      sessions: [],
    });

    expect(bundle.version).toBe("1.1");
    expect(bundle.moduleHtml).toContain("Annual Summit");
    expect(bundle.moduleHtml).not.toContain("<script");
    expect(bundle.manifest.dnnSiteUrl).toBe("https://www.sterling.org");
    expect(bundle.manifest.instructions.some((i) => i.includes("EasyDNN"))).toBe(true);
  });
});
