import { describe, expect, it } from "vitest";
import { isOrgScopedModel, ORG_SCOPED_MODELS } from "@/lib/org-models";

describe("org scoped models", () => {
  it("lists tenant tables", () => {
    expect(ORG_SCOPED_MODELS).toContain("Member");
    expect(ORG_SCOPED_MODELS).toContain("Event");
    expect(ORG_SCOPED_MODELS).toContain("MemberNote");
    expect(ORG_SCOPED_MODELS).toContain("AutomationException");
  });

  it("rejects global tables", () => {
    expect(isOrgScopedModel("Organization")).toBe(false);
    expect(isOrgScopedModel("User")).toBe(false);
  });

  it("accepts tenant tables", () => {
    expect(isOrgScopedModel("Member")).toBe(true);
  });
});
