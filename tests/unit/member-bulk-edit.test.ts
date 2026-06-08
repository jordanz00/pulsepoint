import { describe, expect, it } from "vitest";
import type { Member } from "@/app/generated/prisma/client";
import { computeMemberBulkUpdate } from "@/lib/crm/member-bulk-edit";

const baseMember = {
  id: "m1",
  orgId: "org1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@acme.org",
  phone: null,
  status: "ACTIVE",
  joinedAt: new Date(),
  renewalDueAt: null,
  engagementScore: 50,
  engagementTier: "moderate",
  tierId: null,
  customFields: { credentials: "RN" },
  tags: ["VIP", "Board"],
  clerkUserId: null,
  company: "Acme Health",
  jobTitle: "Director",
  linkedInUrl: null,
  websiteUrl: null,
  relationshipHealth: "STEADY",
  lastTouchAt: null,
  nextFollowUpAt: null,
  workforcePersona: "NONE",
  memberPulseData: null,
  enrichmentData: null,
  organizationAccountId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Member;

describe("member bulk edit", () => {
  it("sets company for all selected", () => {
    const r = computeMemberBulkUpdate(baseMember, {
      memberIds: ["m1"],
      field: "company",
      action: "set",
      findMode: "all",
      replaceValue: "New Org",
    });
    expect(r.changed).toBe(true);
    expect(r.after).toBe("New Org");
  });

  it("replaces job title with regex", () => {
    const r = computeMemberBulkUpdate(
      { ...baseMember, jobTitle: "Enginer" },
      {
        memberIds: ["m1"],
        field: "jobTitle",
        action: "replace",
        findMode: "specific",
        findValue: "Enginer",
        replaceValue: "Engineer",
      },
    );
    expect(r.after).toBe("Engineer");
  });

  it("removes a tag", () => {
    const r = computeMemberBulkUpdate(baseMember, {
      memberIds: ["m1"],
      field: "tags",
      action: "remove",
      findMode: "specific",
      findValue: "VIP",
    });
    expect(r.after).toBe("Board");
  });
});
