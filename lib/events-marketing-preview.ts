/**
 * Sample EventCore preview data — illustrative association programs.
 */

import type { ProductId } from "@/lib/products";

export const EVENTS_PREVIEW_KPIS = [
  {
    id: "live",
    label: "Events live",
    value: 12,
    meta: "3 this week",
    productId: "events" as const,
  },
  {
    id: "registered",
    label: "Registrations",
    value: 1847,
    meta: "Summit + workshops",
    productId: "members" as const,
  },
  {
    id: "revenue",
    label: "Event revenue",
    value: 68,
    prefix: "$",
    suffix: "K",
    meta: "MTD non-dues",
    productId: "insights" as const,
  },
  {
    id: "checkin",
    label: "Check-in rate",
    value: 94,
    suffix: "%",
    meta: "Onsite sample",
    productId: "engage" as const,
  },
] as const;

export type EventsPreviewProgram = {
  id: string;
  name: string;
  date: string;
  registered: number;
  capacity: number;
  revenueK: number;
  productId: ProductId;
};

export const EVENTS_PREVIEW_PROGRAMS: EventsPreviewProgram[] = [
  {
    id: "summit",
    name: "Annual Hospital Summit",
    date: "Sep 15–16",
    registered: 412,
    capacity: 480,
    revenueK: 48,
    productId: "events",
  },
  {
    id: "gr",
    name: "GR Policy Briefing",
    date: "Oct 3",
    registered: 186,
    capacity: 220,
    revenueK: 12,
    productId: "advocacy",
  },
  {
    id: "board",
    name: "Board Chair Roundtable",
    date: "Oct 22",
    registered: 64,
    capacity: 75,
    revenueK: 8,
    productId: "work",
  },
];

export const EVENTS_PREVIEW_REVENUE_MIX = [
  { label: "Registration", pct: 58, productId: "events" as const },
  { label: "Sponsorship", pct: 27, productId: "deals" as const },
  { label: "Exhibits", pct: 15, productId: "commerce" as const },
] as const;
