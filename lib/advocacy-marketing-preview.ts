/**
 * Sample advocacy preview data — illustrative policy & government affairs workflows.
 */

import type { ProductId } from "@/lib/products";
import {
  STATEWIDE_HOSPITAL_ENGAGED_COUNT,
  STATEWIDE_HOSPITAL_MEMBER_COUNT,
} from "@/lib/marketing-constants";

export type AdvocacyPreviewFocus = "issues" | "campaigns" | "roster";

export type AdvocacyPreviewIssue = {
  id: string;
  title: string;
  jurisdiction: "State" | "Federal";
  status: string;
  bill?: string;
  priority: "High" | "Monitor";
  productId: ProductId;
};

export type AdvocacyPreviewCampaign = {
  id: string;
  name: string;
  responses: number;
  target: number;
  deadline: string;
  productId: ProductId;
};

export type AdvocacyPreviewRosterRow = {
  id: string;
  organization: string;
  responses: number;
  executives: number;
  productId: ProductId;
};

export type AdvocacyPreviewBill = {
  id: string;
  label: string;
  chamber: string;
  status: string;
  productId: ProductId;
};

export const ADVOCACY_PREVIEW_KPIS = [
  {
    id: "issues",
    label: "Priority issues",
    value: 12,
    meta: "3 for board review",
    productId: "advocacy" as const,
  },
  {
    id: "engaged",
    label: "Members engaged",
    value: STATEWIDE_HOSPITAL_ENGAGED_COUNT,
    meta: `72% of ${STATEWIDE_HOSPITAL_MEMBER_COUNT}`,
    productId: "members" as const,
  },
  {
    id: "actions",
    label: "Take-action responses",
    value: 428,
    meta: "+64 this week",
    productId: "engage" as const,
  },
  {
    id: "bills",
    label: "Bills tracked",
    value: 34,
    meta: "State & federal",
    productId: "crm" as const,
  },
];

export const ADVOCACY_PREVIEW_ISSUES: AdvocacyPreviewIssue[] = [
  {
    id: "1",
    title: "Hospital workforce sustainability",
    jurisdiction: "State",
    status: "Active",
    bill: "S.B. 1240",
    priority: "High",
    productId: "advocacy",
  },
  {
    id: "2",
    title: "Medicaid supplemental payment stability",
    jurisdiction: "State",
    status: "Monitoring",
    priority: "Monitor",
    productId: "insights",
  },
  {
    id: "3",
    title: "Rural access & closure prevention",
    jurisdiction: "Federal",
    status: "Active",
    bill: "H.R. 4821",
    priority: "High",
    productId: "events",
  },
  {
    id: "4",
    title: "340B contract pharmacy protections",
    jurisdiction: "Federal",
    status: "Monitoring",
    bill: "H.R. 3291",
    priority: "High",
    productId: "giving",
  },
];

export const ADVOCACY_PREVIEW_BILLS: AdvocacyPreviewBill[] = [
  { id: "b1", label: "S.B. 1240", chamber: "PA Senate", status: "In committee", productId: "advocacy" },
  { id: "b2", label: "H.R. 4821", chamber: "U.S. House", status: "Subcommittee", productId: "crm" },
  { id: "b3", label: "H.R. 3291", chamber: "U.S. House", status: "Monitoring", productId: "giving" },
];

export const ADVOCACY_PREVIEW_CAMPAIGNS: AdvocacyPreviewCampaign[] = [
  {
    id: "1",
    name: "Spring sign-on letter",
    responses: 142,
    target: 200,
    deadline: "Jun 15",
    productId: "engage",
  },
  {
    id: "2",
    name: "Facility impact survey",
    responses: 89,
    target: 120,
    deadline: "Jun 22",
    productId: "members",
  },
  {
    id: "3",
    name: "Legislator briefing RSVP",
    responses: 56,
    target: 75,
    deadline: "Jul 8",
    productId: "events",
  },
];

export const ADVOCACY_PREVIEW_ROSTER: AdvocacyPreviewRosterRow[] = [
  { id: "r1", organization: "Metro Health System", responses: 28, executives: 4, productId: "members" },
  { id: "r2", organization: "Keystone Health Network", responses: 22, executives: 3, productId: "crm" },
  { id: "r3", organization: "Hope Regional Cancer Center", responses: 11, executives: 2, productId: "advocacy" },
  { id: "r4", organization: "Valley Community Hospital", responses: 6, executives: 1, productId: "insights" },
];

export const ADVOCACY_PREVIEW_AGENDA = [
  { label: "Workforce", pct: 38, productId: "members" as const },
  { label: "Payment stability", pct: 34, productId: "insights" as const },
  { label: "Rural access", pct: 28, productId: "advocacy" as const },
];
