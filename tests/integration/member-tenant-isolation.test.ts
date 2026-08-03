/**
 * Integration: two associations — org A must never see org B's member list.
 * Requires DATABASE_URL (runs in CI after migrate deploy).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { assertAllRowsBelongToOrg } from "@/lib/tenant-guards";
import { withSqliteBusyRetry } from "@/tests/helpers/sqlite-busy-retry";

const run = process.env.DATABASE_URL ? describe : describe.skip;

run("member tenant isolation (integration)", () => {
  const ts = Date.now();
  let orgAId: string;
  let orgBId: string;
  const secretEmail = `leak-guard-b-${ts}@pulsepoint.test`;

  beforeAll(async () => {
    const orgA = await withSqliteBusyRetry("orgA.create", () =>
      prisma.organization.create({
        data: {
          id: `test_org_a_${ts}`,
          slug: `test-iso-a-${ts}`,
          name: "Isolation Test A",
        },
      }),
    );
    const orgB = await withSqliteBusyRetry("orgB.create", () =>
      prisma.organization.create({
        data: {
          id: `test_org_b_${ts}`,
          slug: `test-iso-b-${ts}`,
          name: "Isolation Test B",
        },
      }),
    );
    orgAId = orgA.id;
    orgBId = orgB.id;

    await withSqliteBusyRetry("memberB.create", () =>
      getOrgDb(orgBId).member.create({
        data: {
          orgId: orgBId,
          firstName: "Secret",
          lastName: "Member",
          email: secretEmail,
          status: "ACTIVE",
          tags: [],
          customFields: {},
        },
      }),
    );

    await withSqliteBusyRetry("memberA.create", () =>
      getOrgDb(orgAId).member.create({
        data: {
          orgId: orgAId,
          firstName: "Visible",
          lastName: "OnlyInA",
          email: `leak-guard-a-${ts}@pulsepoint.test`,
          status: "ACTIVE",
          tags: [],
          customFields: {},
        },
      }),
    );
  });

  afterAll(async () => {
    await withSqliteBusyRetry("orgs.delete", () =>
      prisma.organization.deleteMany({
        where: { id: { in: [orgAId, orgBId] } },
      }),
    );
  });

  it("getOrgDb(orgA).member.findMany never returns org B rows", async () => {
    const dbA = getOrgDb(orgAId);
    const list = await dbA.member.findMany();
    assertAllRowsBelongToOrg(list, orgAId, "integration-findMany");
    expect(list.some((m) => m.email === secretEmail)).toBe(false);
  });

  it("getOrgDb(orgA) cannot find org B member by email", async () => {
    const dbA = getOrgDb(orgAId);
    const hit = await dbA.member.findFirst({ where: { email: secretEmail } });
    expect(hit).toBeNull();
  });

  it("getOrgDb(orgB) sees only org B member with secret email", async () => {
    const dbB = getOrgDb(orgBId);
    const hit = await dbB.member.findFirst({ where: { email: secretEmail } });
    expect(hit).not.toBeNull();
    expect(hit?.orgId).toBe(orgBId);
  });
});
