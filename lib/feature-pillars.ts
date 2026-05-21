/**
 * Operational feature pillars — how associations understand the platform
 * (Distinct from branded PulsePoint product modules in lib/products.ts)
 */

import type { ProductId } from "@/lib/products";

export type PillarStatus = "available" | "coming_soon";

export type FeaturePillar = {
  id: string;
  title: string;
  description: string;
  status: PillarStatus;
  /** Links to a shipped PulsePoint product module when applicable */
  productId?: ProductId;
  path?: string;
};

export const FEATURE_PILLARS: FeaturePillar[] = [
  {
    id: "work",
    title: "Work",
    description: "Staff workspace, modern UX, productivity",
    status: "available",
    productId: "work",
    path: "work",
  },
  {
    id: "members",
    title: "Members",
    description: "Profiles, renewals, directories",
    status: "available",
    productId: "members",
    path: "members",
  },
  {
    id: "events",
    title: "Events",
    description: "Conferences, registrations, CME",
    status: "available",
    productId: "events",
    path: "events",
  },
  {
    id: "education",
    title: "Education",
    description: "Certifications, CE credits, learning pathways",
    status: "coming_soon",
    productId: "learn",
    path: "learn",
  },
  {
    id: "fundraising",
    title: "Fundraising",
    description: "Donors, campaigns, recurring gifts",
    status: "coming_soon",
    productId: "giving",
    path: "giving",
  },
  {
    id: "commerce",
    title: "Commerce",
    description: "Storefronts, dues, merchandise, payments",
    status: "coming_soon",
    productId: "commerce",
    path: "commerce",
  },
  {
    id: "committees",
    title: "Committees",
    description: "Boards, task forces, voting",
    status: "coming_soon",
    path: "committees",
  },
  {
    id: "communications",
    title: "Communications",
    description: "Campaigns, segmentation, engagement",
    status: "coming_soon",
    productId: "engage",
    path: "engage",
  },
  {
    id: "insights",
    title: "Insights",
    description: "BI, dashboards, organization-wide reporting",
    status: "coming_soon",
    productId: "insights",
    path: "insights",
  },
  {
    id: "ai",
    title: "AI Tools",
    description: "Automation and support workflows",
    status: "coming_soon",
    productId: "ai",
    path: "ai",
  },
];

export function pillarHref(orgSlug: string, pillar: FeaturePillar): string | null {
  if (!pillar.path || pillar.status !== "available") return null;
  return `/${orgSlug}/${pillar.path}`;
}
