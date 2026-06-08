/**
 * Operational feature pillars — how associations understand the platform
 * (Distinct from branded PulsePoint product modules in lib/products.ts)
 */

import type { ProductId } from "@/lib/products";

export type PillarStatus = "available" | "alpha" | "coming_soon";

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
    title: "MemberCore",
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
    status: "alpha",
    productId: "learn",
    path: "learn",
  },
  {
    id: "fundraising",
    title: "Fundraising",
    description: "Donors, campaigns, recurring gifts",
    status: "alpha",
    productId: "giving",
    path: "giving",
  },
  {
    id: "commerce",
    title: "Commerce",
    description: "Storefronts, dues, merchandise, payments",
    status: "alpha",
    productId: "commerce",
    path: "commerce",
  },
  {
    id: "communications",
    title: "Communications",
    description: "Campaigns, segmentation, engagement",
    status: "alpha",
    productId: "engage",
    path: "engage",
  },
  {
    id: "insights",
    title: "Insights",
    description: "BI, dashboards, organization-wide reporting",
    status: "alpha",
    productId: "insights",
    path: "insights",
  },
];

export function pillarHref(orgSlug: string, pillar: FeaturePillar): string | null {
  if (!pillar.path) return null;
  if (pillar.status === "coming_soon") return null;
  return `/${orgSlug}/${pillar.path}`;
}
