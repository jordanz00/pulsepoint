import { describe, expect, it } from "vitest";
import { PORTAL_HUB_SECTIONS } from "@/lib/portal/portal-nav-config";

describe("member portal hub", () => {
  it("exposes six member-facing areas", () => {
    const ids = PORTAL_HUB_SECTIONS.map((s) => s.id);
    expect(ids).toEqual([
      "membership",
      "events",
      "committees",
      "certifications",
      "invoices",
      "activity",
    ]);
  });
});
