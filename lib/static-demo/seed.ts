/**
 * Illustrative seed for the static GitHub Pages demo.
 * Numbers align with marketing previews — not live DB.
 */

import type { AdminNavCounts } from "@/lib/admin-nav-counts";
import type { ProductId } from "@/lib/products";
import { MEMBERCORE_PREVIEW_MEMBERS } from "@/lib/membercore-marketing-preview";
import { EVENTS_PREVIEW_PROGRAMS } from "@/lib/events-marketing-preview";
import { INSIGHTS_PREVIEW_KPIS } from "@/lib/insights-marketing-preview";

export const STATIC_DEMO_ORG = {
  id: "org_demo_pulsepoint",
  slug: "demo-healthcare",
  name: "Sterling Healthcare Association",
} as const;

export const STATIC_DEMO_NAV_COUNTS: AdminNavCounts = {
  members: 50,
  events: 4,
  exceptions: 2,
};

/** Module strip stats for PlatformGlanceBriefing */
export const STATIC_DEMO_MODULE_STATS: Partial<Record<ProductId, string>> = {
  members: "50 on roster",
  events: "4 live",
  insights: "$128K MTD",
  engage: "12 sends",
  learn: "38 awards",
  giving: "62% PAC goal",
  commerce: "6 open dues",
  crm: "9 open deals",
  work: "2 exceptions",
};

export const STATIC_DEMO_EXCEPTIONS = [
  {
    id: "ex_static_1",
    message: "Failed email send — renewal reminder bounced (illustrative)",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ex_static_2",
    message: "Payment reconciliation needs review (illustrative)",
    createdAt: new Date().toISOString(),
  },
];

export const STATIC_DEMO_MEMBERS = MEMBERCORE_PREVIEW_MEMBERS;
export const STATIC_DEMO_EVENTS = EVENTS_PREVIEW_PROGRAMS;
export const STATIC_DEMO_INSIGHTS = INSIGHTS_PREVIEW_KPIS;

export const STATIC_DEMO_HOME_KPIS = [
  { id: "roster", label: "Hospitals on roster", value: "50", hint: "Statewide sample" },
  { id: "events", label: "Events live", value: "4", hint: "This season" },
  { id: "revenue", label: "Revenue MTD", value: "$128K", hint: "Illustrative" },
  { id: "exceptions", label: "Open exceptions", value: "2", hint: "Needs review" },
] as const;
