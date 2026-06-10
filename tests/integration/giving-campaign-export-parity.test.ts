/**
 * Integration: campaign detail raised total matches paid gift export rows (DB fixture).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getOrgDb } from "@/lib/db";
import {
  campaignTotalsMatchExport,
  paidGiftExportRows,
  sumCsvGiftCents,
} from "@/lib/giving/csv-export";
import { sumRaisedCents } from "@/lib/giving/campaign-stats";
import { loadCampaignDetail } from "@/lib/giving/load-giving";
import { prisma } from "@/lib/prisma";

const run = process.env.DATABASE_URL ? describe : describe.skip;

run("giving campaign export parity (integration)", () => {
  const ts = Date.now();
  let orgId: string;
  let campaignId: string;

  beforeAll(async () => {
    const org = await prisma.organization.create({
      data: {
        id: `test_giving_${ts}`,
        slug: `test-giving-${ts}`,
        name: "Giving Parity Test Org",
      },
    });
    orgId = org.id;
    const db = getOrgDb(orgId);

    const campaign = await db.campaign.create({
      data: {
        orgId,
        name: "Annual Fund 2026",
        goalCents: 100_000,
        status: "ACTIVE",
      },
    });
    campaignId = campaign.id;

    await db.donation.createMany({
      data: [
        {
          orgId,
          campaignId,
          donorName: "Paid Donor A",
          amountCents: 5000,
          paidAt: new Date("2026-06-01T12:00:00.000Z"),
        },
        {
          orgId,
          campaignId,
          donorName: "Paid Donor B",
          amountCents: 2500,
          paidAt: new Date("2026-06-02T12:00:00.000Z"),
        },
        {
          orgId,
          campaignId,
          donorName: "Pending Pledge",
          amountCents: 10_000,
          paidAt: null,
        },
      ],
    });
  });

  afterAll(async () => {
    if (!orgId) return;
    const db = getOrgDb(orgId);
    await db.donation.deleteMany({ where: { orgId } });
    await db.campaign.deleteMany({ where: { orgId } });
    await prisma.organization.delete({ where: { id: orgId } }).catch(() => undefined);
  });

  it("loadCampaignDetail raisedCents matches paid export row sum", async () => {
    const detail = await loadCampaignDetail(orgId, campaignId);
    expect(detail).not.toBeNull();

    const donations = detail!.donations.map((d) => ({
      amountCents: d.amountCents,
      paidAt: d.paidAt,
    }));
    const exportRows = paidGiftExportRows(donations);

    expect(detail!.raisedCents).toBe(7500);
    expect(sumRaisedCents(donations)).toBe(7500);
    expect(sumCsvGiftCents(exportRows)).toBe(7500);
    expect(campaignTotalsMatchExport(donations, exportRows)).toBe(true);
    expect(exportRows).toHaveLength(2);
  });
});
