/**
 * Sample data for MemberCore marketing preview — illustrative only.
 */

import type { ProductId } from "@/lib/products";
import { MEMBERCORE_PREVIEW_MODULE_COLORS as C } from "@/lib/marketing-preview-palette";
import { STATEWIDE_HOSPITAL_MEMBER_COUNT } from "@/lib/marketing-constants";

export type MembercorePreviewKpi = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  meta: string;
  productId: ProductId;
};

export type MembercorePreviewMember = {
  id: string;
  initials: string;
  name: string;
  role: string;
  facility: string;
  facilityType: string;
  tier: "General" | "Associate";
  engagement: number;
  engagementTier: "active" | "moderate" | "at_risk";
  renewalStatus: "current" | "due_soon" | "lapsed";
  portalLinked: boolean;
  productId: ProductId;
};

export type MembercorePreviewFacilityType = {
  id: string;
  label: string;
  count: number;
  pct: number;
  productId: ProductId;
};

export type MembercorePreviewPulseDim = {
  id: string;
  label: string;
  score: number;
  productId: ProductId;
};

export type MembercorePreviewRoleGroup = {
  id: string;
  label: string;
  count: number;
  examples: string;
  productId: ProductId;
};

export type MembercorePreviewTimelineItem = {
  id: string;
  kind: "event" | "commerce" | "giving" | "email" | "note";
  title: string;
  when: string;
  productId: ProductId;
};

const [kpiActive, kpiGeneral, kpiDues, kpiRisk] = C.kpis;
const [mixGeneral, mixAssociate, mixOther] = C.mix;
const [facHospital, facCancer] = C.facilities;

export const MEMBERCORE_PREVIEW_KPIS: MembercorePreviewKpi[] = [
  {
    id: "active",
    label: "Active members",
    value: STATEWIDE_HOSPITAL_MEMBER_COUNT,
    meta: "On roster",
    productId: kpiActive,
  },
  {
    id: "general",
    label: "General membership",
    value: 115,
    meta: "49% of roster",
    productId: kpiGeneral,
  },
  {
    id: "dues",
    label: "Open dues",
    value: 24.2,
    prefix: "$",
    suffix: "K",
    decimals: 1,
    meta: "6 invoices",
    productId: kpiDues,
  },
  {
    id: "risk",
    label: "At-risk",
    value: 18,
    meta: "Needs outreach",
    productId: kpiRisk,
  },
];

export const MEMBERCORE_PREVIEW_MEMBERSHIP_MIX: {
  general: { pct: number; productId: ProductId };
  associate: { pct: number; productId: ProductId };
  other: { pct: number; productId: ProductId };
} = {
  general: { pct: 49, productId: mixGeneral },
  associate: { pct: 38, productId: mixAssociate },
  other: { pct: 13, productId: mixOther },
};

export const MEMBERCORE_PREVIEW_ENGAGEMENT_TIERS = [
  { id: "active", label: "Active", pct: 78, count: 183, productId: kpiActive },
  { id: "moderate", label: "Moderate", pct: 16, count: 38, productId: mixAssociate },
  { id: "at_risk", label: "At-risk", pct: 6, count: 14, productId: kpiRisk },
] as const;

export const MEMBERCORE_PREVIEW_PULSE_DIMS: MembercorePreviewPulseDim[] = [
  { id: "events", label: "Event participation", score: 84, productId: "events" },
  { id: "dues", label: "Dues & commerce", score: 91, productId: "commerce" },
  { id: "advocacy", label: "Advocacy actions", score: 62, productId: "advocacy" },
  { id: "email", label: "Email engagement", score: 76, productId: "engage" },
];

export const MEMBERCORE_PREVIEW_ROLE_GROUPS: MembercorePreviewRoleGroup[] = [
  {
    id: "csuite",
    label: "C-Suite & executives",
    count: 42,
    examples: "CEO, CFO, CNO, CMO",
    productId: mixGeneral,
  },
  {
    id: "board",
    label: "Association board",
    count: 18,
    examples: "Chair, Vice chair, Trustees",
    productId: mixAssociate,
  },
  {
    id: "committee",
    label: "Committee leadership",
    count: 64,
    examples: "Quality, GR, PAC chairs",
    productId: mixOther,
  },
];

export const MEMBERCORE_PREVIEW_TIMELINE: MembercorePreviewTimelineItem[] = [
  {
    id: "t1",
    kind: "event",
    title: "Annual Conference registration",
    when: "2d ago",
    productId: "events",
  },
  {
    id: "t2",
    kind: "commerce",
    title: "Dues renewal paid",
    when: "12d ago",
    productId: "commerce",
  },
  {
    id: "t3",
    kind: "giving",
    title: "PAC contribution",
    when: "1mo ago",
    productId: "giving",
  },
  {
    id: "t4",
    kind: "email",
    title: "Opened advocacy alert",
    when: "1mo ago",
    productId: "engage",
  },
];

export const MEMBERCORE_PREVIEW_FACILITY_TYPES: MembercorePreviewFacilityType[] = [
  { id: "hospital", label: "Hospitals", count: 124, pct: 32, productId: facHospital },
  { id: "network", label: "Health networks", count: 86, pct: 22, productId: facCancer },
  { id: "cancer", label: "Cancer centers", count: 41, pct: 11, productId: facHospital },
  { id: "psych", label: "Psychiatric", count: 28, pct: 8, productId: facCancer },
  { id: "rehab", label: "Rehabilitation", count: 19, pct: 5, productId: facHospital },
];

export const MEMBERCORE_PREVIEW_MEMBERS: MembercorePreviewMember[] = [
  {
    id: "1",
    initials: "JW",
    name: "Jordan Walsh",
    role: "CEO",
    facility: "Metro Health System",
    facilityType: "Health system",
    tier: "General",
    engagement: 92,
    engagementTier: "active",
    renewalStatus: "current",
    portalLinked: true,
    productId: facHospital,
  },
  {
    id: "2",
    initials: "AC",
    name: "Avery Chen",
    role: "Board Chair",
    facility: "Keystone Health Network",
    facilityType: "Health network",
    tier: "General",
    engagement: 88,
    engagementTier: "active",
    renewalStatus: "current",
    portalLinked: true,
    productId: facCancer,
  },
  {
    id: "3",
    initials: "ME",
    name: "Morgan Ellis",
    role: "Quality Council",
    facility: "Hope Regional Cancer Center",
    facilityType: "Cancer center",
    tier: "General",
    engagement: 41,
    engagementTier: "at_risk",
    renewalStatus: "due_soon",
    portalLinked: false,
    productId: facHospital,
  },
  {
    id: "4",
    initials: "RL",
    name: "Riley Lawson",
    role: "CFO",
    facility: "Summit Medical Center",
    facilityType: "Acute care",
    tier: "General",
    engagement: 71,
    engagementTier: "moderate",
    renewalStatus: "current",
    portalLinked: true,
    productId: facCancer,
  },
  {
    id: "5",
    initials: "KP",
    name: "Kai Patel",
    role: "GR Committee",
    facility: "Valley Community Hospital",
    facilityType: "Community hospital",
    tier: "Associate",
    engagement: 55,
    engagementTier: "moderate",
    renewalStatus: "lapsed",
    portalLinked: false,
    productId: mixOther,
  },
];

export const MEMBERCORE_PREVIEW_CHIPS: { label: string; productId: ProductId }[] = [
  { label: "C-Suite", productId: mixGeneral },
  { label: "Our board", productId: mixAssociate },
  { label: "General members", productId: mixOther },
  { label: "At risk", productId: kpiRisk },
  { label: "Renewal due", productId: "commerce" },
];

export const MEMBERCORE_PREVIEW_CHROME_PRODUCT_ID = C.chrome;
export const MEMBERCORE_PREVIEW_SEARCH_PRODUCT_ID = C.search;
export const MEMBERCORE_PREVIEW_MIX_PANEL_PRODUCT_ID = mixGeneral;
export const MEMBERCORE_PREVIEW_FACILITY_PANEL_PRODUCT_ID = facHospital;

export type MembercorePreviewFocus = "directory" | "engagement" | "roles";
