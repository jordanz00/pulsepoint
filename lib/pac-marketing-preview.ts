/**
 * Illustrative PAC preview data — hospital association political fundraising.
 * Sample only; not production compliance or FEC reporting.
 */

import type { ProductId } from "@/lib/products";

export type PacPreviewFocus = "pacing" | "hospitals" | "policy";

export type PacPreviewIssueLink = {
  id: string;
  title: string;
  jurisdiction: "State" | "Federal";
  raisedCents: number;
  targetCents: number;
  politicalNote: string;
  productId: ProductId;
};

export type PacPreviewContributor = {
  id: string;
  label: string;
  amountK: number;
  pct: number;
  productId: ProductId;
};

export type PacPreviewLawmakerTouch = {
  id: string;
  name: string;
  level: "State" | "Federal";
  meetings: number;
  productId: ProductId;
};

export const PAC_YTD_RAISED_K = 186;
export const PAC_GOAL_K = 250;
export const PAC_GOAL_PCT = 74;

export type PacPreviewKpi = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  meta: string;
  productId: ProductId;
};

export const PAC_PREVIEW_KPIS: PacPreviewKpi[] = [
  {
    id: "raised",
    label: "Raised this year",
    value: PAC_YTD_RAISED_K,
    prefix: "$",
    suffix: "K",
    meta: `${PAC_GOAL_PCT}% of board goal`,
    productId: "giving" as const,
  },
  {
    id: "goal",
    label: "Board goal",
    value: PAC_GOAL_K,
    prefix: "$",
    suffix: "K",
    meta: "Approved by your board",
    productId: "insights" as const,
  },
  {
    id: "issues",
    label: "Policy fights",
    value: 4,
    meta: "Tied to Advocacy",
    productId: "advocacy" as const,
  },
  {
    id: "allies",
    label: "Lawmaker meetings",
    value: 28,
    meta: "State & Congress",
    productId: "crm" as const,
  },
] as const;

export const PAC_ALLOCATION = [
  { id: "state", label: "State PAC", pct: 58, productId: "advocacy" as const },
  { id: "federal", label: "Congress", pct: 42, productId: "insights" as const },
] as const;

/** Three report lenses — one full-screen view each (marketing board report). */
export const PAC_REPORT_VIEWS = [
  {
    id: "pace",
    label: "On pace?",
    insight: "One bar vs the board goal—leadership sees YTD progress in seconds.",
  },
  {
    id: "givers",
    label: "Who gave?",
    insight: "Hospital gifts roll up from MemberCore—not a disconnected PAC spreadsheet.",
  },
  {
    id: "policy",
    label: "What fights?",
    insight: "PAC dollars follow Advocacy priorities—statehouse, Congress, and the allies you fund.",
  },
] as const;

export type PacReportViewId = (typeof PAC_REPORT_VIEWS)[number]["id"];

export const PAC_PREVIEW_CONTRIBUTORS: PacPreviewContributor[] = [
  { id: "1", label: "Penn Medicine", amountK: 24, pct: 100, productId: "members" },
  { id: "2", label: "UPMC", amountK: 18, pct: 75, productId: "crm" },
  { id: "3", label: "Jefferson Health", amountK: 12, pct: 50, productId: "events" },
  { id: "4", label: "Geisinger", amountK: 9, pct: 38, productId: "giving" },
];

export const PAC_LINKED_ISSUES: PacPreviewIssueLink[] = [
  {
    id: "1",
    title: "Hospital workforce",
    jurisdiction: "State",
    raisedCents: 62_000_00,
    targetCents: 80_000_00,
    politicalNote: "Supports state allies on staffing bills",
    productId: "advocacy",
  },
  {
    id: "2",
    title: "Medicaid payments",
    jurisdiction: "State",
    raisedCents: 48_000_00,
    targetCents: 60_000_00,
    politicalNote: "Funds outreach on payment stability",
    productId: "members",
  },
  {
    id: "3",
    title: "Rural hospital access",
    jurisdiction: "Federal",
    raisedCents: 51_000_00,
    targetCents: 65_000_00,
    politicalNote: "Congressional allies on closure prevention",
    productId: "events",
  },
  {
    id: "4",
    title: "340B pharmacy access",
    jurisdiction: "Federal",
    raisedCents: 25_000_00,
    targetCents: 45_000_00,
    politicalNote: "Federal PAC ask on pharmacy rules",
    productId: "crm",
  },
];

export const PAC_PREVIEW_LAWMAKERS: PacPreviewLawmakerTouch[] = [
  { id: "l1", name: "State Senate health chair", level: "State", meetings: 6, productId: "advocacy" },
  { id: "l2", name: "House Medicaid caucus", level: "State", meetings: 5, productId: "members" },
  { id: "l3", name: "U.S. House rural health", level: "Federal", meetings: 4, productId: "crm" },
  { id: "l4", name: "Senate hospital finance", level: "Federal", meetings: 3, productId: "giving" },
];
