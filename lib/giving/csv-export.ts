/**
 * Giving CSV export helpers — pure functions for campaign total ↔ export parity tests.
 */

import { escapeCsvCell } from "@/lib/giving/csv";
import { sumRaisedCents, type DonationAmountRow } from "@/lib/giving/campaign-stats";

export type GiftCsvRow = {
  donorName: string;
  donorEmail: string;
  amountCents: number;
  campaignName: string;
  paidAt: string;
  createdAt: string;
  memberId: string;
};

export function giftAmountUsd(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

export function buildGiftCsvRow(gift: GiftCsvRow): string {
  return [
    escapeCsvCell(gift.donorName),
    gift.donorEmail,
    giftAmountUsd(gift.amountCents),
    escapeCsvCell(gift.campaignName),
    gift.paidAt,
    gift.createdAt,
    gift.memberId,
  ].join(",");
}

export function sumCsvGiftCents(rows: { amountCents: number }[]): number {
  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}

/** Data rows only (excludes header). */
export function countGiftCsvDataRows(csv: string): number {
  const lines = csv.trim().split("\n");
  return Math.max(0, lines.length - 1);
}

/**
 * Campaign raised total should match sum of paid gifts in an export batch.
 */
export function campaignTotalsMatchExport(
  donations: DonationAmountRow[],
  exportRows: { amountCents: number }[],
): boolean {
  return sumRaisedCents(donations) === sumCsvGiftCents(exportRows);
}

export const GIFT_CSV_HEADER =
  "donor_name,donor_email,amount_usd,campaign,paid_at,created_at,member_id";
