import { describe, expect, it } from "vitest";
import {
  isOfficerRole,
  officerRoleLabel,
  officerSortOrder,
  requiresChairDemotion,
  titleForOfficerRole,
} from "@/lib/committees/officer-roles";

describe("committee officer policy", () => {
  it("labels chair role", () => {
    expect(officerRoleLabel("CHAIR")).toBe("Chair");
    expect(titleForOfficerRole("SECRETARY")).toBe("Secretary");
  });

  it("detects officer vs member", () => {
    expect(isOfficerRole("CHAIR")).toBe(true);
    expect(isOfficerRole("MEMBER")).toBe(false);
  });

  it("sorts chair before members", () => {
    expect(officerSortOrder("CHAIR")).toBeLessThan(officerSortOrder("MEMBER"));
  });

  it("requires demotion when assigning chair", () => {
    expect(requiresChairDemotion("CHAIR")).toBe(true);
    expect(requiresChairDemotion("SECRETARY")).toBe(false);
  });
});
