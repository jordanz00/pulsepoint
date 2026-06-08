/**
 * Protech GL reconciliation export slice (BL-027) — CSV for finance review.
 * Does not post to ERP; IT maps columns to Business Central / Intacct.
 */

export type GlExportLine = {
  transactionDate: string;
  sourceModule: string;
  referenceId: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amountUsd: string;
  memberId: string;
  validationStatus: "live" | "preview";
};

export type GlExportInput = {
  orgName: string;
  lines: GlExportLine[];
};

/** Build CSV string — no secrets, no fabricated totals beyond input lines. */
export function buildProtechGlCsv(input: GlExportInput): string {
  const header = [
    "transaction_date",
    "source_module",
    "reference_id",
    "description",
    "debit_account",
    "credit_account",
    "amount_usd",
    "member_id",
    "validation_status",
    "org_name",
  ].join(",");

  const rows = input.lines.map((line) =>
    [
      line.transactionDate,
      line.sourceModule,
      line.referenceId,
      csvEscape(line.description),
      line.debitAccount,
      line.creditAccount,
      line.amountUsd,
      line.memberId,
      line.validationStatus,
      csvEscape(input.orgName),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Sample shape for demo — finance teams validate mapping before ERP import. */
export function demoGlExportLines(): GlExportLine[] {
  return [
    {
      transactionDate: "2026-06-01",
      sourceModule: "EventCore",
      referenceId: "evt_reg_sample",
      description: "Annual summit registration",
      debitAccount: "1200-AR",
      creditAccount: "4100-Events",
      amountUsd: "425.00",
      memberId: "member_sample",
      validationStatus: "live",
    },
    {
      transactionDate: "2026-06-02",
      sourceModule: "Commerce",
      referenceId: "ord_dues_sample",
      description: "Hospital membership dues",
      debitAccount: "1200-AR",
      creditAccount: "4000-Dues",
      amountUsd: "12500.00",
      memberId: "member_sample",
      validationStatus: "live",
    },
    {
      transactionDate: "2026-06-03",
      sourceModule: "Giving",
      referenceId: "gift_pac_preview",
      description: "PAC fund — preview ledger row",
      debitAccount: "1200-AR",
      creditAccount: "4500-PAC",
      amountUsd: "250.00",
      memberId: "member_sample",
      validationStatus: "preview",
    },
  ];
}
