import { describe, expect, it } from "vitest";
import { mergeWhere } from "@/lib/db-scope";
import { ORG_SCOPED_MODELS, isOrgScopedModel } from "@/lib/org-models";
import { canTransitionRegistration } from "@/lib/registration-state";

/**
 * Proves cross-tenant reads require both guessed id AND correct orgId in the query.
 * (Integration with a real DB would assert zero rows; this asserts the contract getOrgDb enforces.)
 */
describe("tenant isolation contract", () => {
  it("guessed member id from org B cannot be read without org B in where", () => {
    const attackerOrg = "org_a";
    const victimMemberId = "member-only-in-org-b";

    const scoped = mergeWhere({ where: { id: victimMemberId } }, attackerOrg);
    expect(scoped.where).toEqual({ id: victimMemberId, orgId: attackerOrg });
    expect(scoped.where).toHaveProperty("orgId", attackerOrg);
  });

  it("every org-scoped Prisma model is registered", () => {
    for (const model of [
      "Member",
      "MemberNote",
      "Event",
      "EventRegistration",
      "MemberImportBatch",
      "MemberImportRow",
      "AuditLog",
      "AutomationException",
    ]) {
      expect(isOrgScopedModel(model)).toBe(true);
    }
    expect(ORG_SCOPED_MODELS).toContain("MemberImportBatch");
    expect(ORG_SCOPED_MODELS).toContain("MemberImportRow");
  });

  it("global tables are not org-scoped", () => {
    expect(isOrgScopedModel("Organization")).toBe(false);
    expect(isOrgScopedModel("WebhookIdempotency")).toBe(false);
  });

  it("paid registration cannot jump from CONFIRMED back to PENDING (state machine)", () => {
    expect(canTransitionRegistration("CONFIRMED", "PENDING")).toBe(false);
  });
});
