import { describe, expect, it } from "vitest";
import { advocacyTakeActionInputSchema } from "@/lib/validations/advocacy-take-action";
import { publicTakeActionUrl } from "@/lib/advocacy/public-take-action-url";
import { engageAudienceUrl } from "@/lib/engage/audience-url";

describe("advocacy take-action validation", () => {
  it("accepts valid hospital executive payload", () => {
    const parsed = advocacyTakeActionInputSchema.safeParse({
      responderName: "Jordan Zabady",
      responderEmail: "jordan@hospital.org",
      responderTitle: "CEO",
      hospitalName: "Metro General Hospital",
      position: "SUPPORT",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const parsed = advocacyTakeActionInputSchema.safeParse({
      responderName: "Jordan Zabady",
      responderEmail: "not-an-email",
      hospitalName: "Metro General Hospital",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects short hospital name", () => {
    const parsed = advocacyTakeActionInputSchema.safeParse({
      responderName: "Jordan Zabady",
      responderEmail: "jordan@hospital.org",
      hospitalName: "A",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("public take-action URL", () => {
  it("builds org-scoped campaign path", () => {
    expect(publicTakeActionUrl("demo-healthcare", "camp_abc")).toBe(
      "/demo-healthcare/advocacy/camp_abc",
    );
  });
});

describe("engage audience deep link", () => {
  it("pre-selects audience on Engage send form", () => {
    expect(engageAudienceUrl("demo-healthcare", "aud_123")).toBe(
      "/demo-healthcare/engage?audienceId=aud_123",
    );
  });
});
