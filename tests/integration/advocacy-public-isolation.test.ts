/**
 * Integration: public advocacy submit is tenant-scoped — org A cannot accept
 * responses for org B's campaign id.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getOrgDb } from "@/lib/db";
import { submitTakeActionResponse } from "@/lib/advocacy/submit-take-action-response";
import { prisma } from "@/lib/prisma";
import { withSqliteBusyRetry } from "@/tests/helpers/sqlite-busy-retry";

const run = process.env.DATABASE_URL ? describe : describe.skip;

run("advocacy public isolation (integration)", () => {
  const ts = Date.now();
  let orgAId: string;
  let orgBId: string;
  let campaignBId: string;
  let audienceBId: string;

  beforeAll(async () => {
    const orgA = await withSqliteBusyRetry("adv.orgA", () =>
      prisma.organization.create({
        data: {
          id: `test_adv_a_${ts}`,
          slug: `test-adv-a-${ts}`,
          name: "Advocacy Isolation A",
        },
      }),
    );
    const orgB = await withSqliteBusyRetry("adv.orgB", () =>
      prisma.organization.create({
        data: {
          id: `test_adv_b_${ts}`,
          slug: `test-adv-b-${ts}`,
          name: "Advocacy Isolation B",
        },
      }),
    );
    orgAId = orgA.id;
    orgBId = orgB.id;

    const dbB = getOrgDb(orgBId);
    audienceBId = (
      await withSqliteBusyRetry("adv.audience", () =>
        dbB.emailAudience.create({
          data: {
            orgId: orgBId,
            name: "Test audience B",
            filter: { status: "ACTIVE" },
          },
        }),
      )
    ).id;

    campaignBId = (
      await withSqliteBusyRetry("adv.campaign", () =>
        dbB.advocacyCampaign.create({
          data: {
            orgId: orgBId,
            name: "Org B campaign",
            isActive: true,
            audienceId: audienceBId,
            targetCount: 10,
            responseCount: 0,
          },
        }),
      )
    ).id;
  });

  afterAll(async () => {
    await withSqliteBusyRetry("adv.cleanup", () =>
      prisma.organization.deleteMany({
        where: { id: { in: [orgAId, orgBId] } },
      }),
    );
  });

  it("org A scope rejects org B campaign id", async () => {
    const result = await submitTakeActionResponse(orgAId, campaignBId, {
      responderName: "Cross Tenant",
      responderEmail: `cross-${ts}@example.com`,
      hospitalName: "Wrong Org Hospital",
      position: "SUPPORT",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not available/i);
    }
  });

  it("org B scope accepts valid submit on org B campaign", async () => {
    const result = await submitTakeActionResponse(orgBId, campaignBId, {
      responderName: "Valid Responder",
      responderEmail: `valid-${ts}@example.com`,
      hospitalName: "Org B Memorial",
      position: "SUPPORT",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.duplicate).toBe(false);
      expect(result.responseCount).toBeGreaterThanOrEqual(1);
    }
  });
});
