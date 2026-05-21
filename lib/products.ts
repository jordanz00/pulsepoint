/**
 * PulsePoint product suite — canonical names and routes
 */

export type ProductId =
  | "work"
  | "members"
  | "events"
  | "learn"
  | "giving"
  | "commerce"
  | "engage"
  | "ai"
  | "insights";

export type ProductStatus = "available" | "coming_soon";

export type PulseProduct = {
  id: ProductId;
  name: string;
  shortName: string;
  tagline: string;
  status: ProductStatus;
  path: string;
};

export const PULSE_PRODUCTS: PulseProduct[] = [
  {
    id: "work",
    name: "PulsePoint Work",
    shortName: "Work",
    tagline:
      "Staff Experience & Productivity — unified workspace, modern UX, and streamlined operations.",
    status: "available",
    path: "work",
  },
  {
    id: "members",
    name: "MemberCore",
    shortName: "MemberCore",
    tagline:
      "Membership Management — directory, import review, notes, and audited export today; renewals on the roadmap.",
    status: "available",
    path: "members",
  },
  {
    id: "events",
    name: "PulsePoint Events",
    shortName: "Events",
    tagline:
      "Events, Sponsorships & Exhibits — registration, check-in, and revenue from one system.",
    status: "available",
    path: "events",
  },
  {
    id: "learn",
    name: "PulsePoint Learn",
    shortName: "Learn",
    tagline:
      "Education & Certifications — CE credits, credentials, and learning pathways in one system.",
    status: "coming_soon",
    path: "learn",
  },
  {
    id: "giving",
    name: "PulsePoint Giving",
    shortName: "Giving",
    tagline:
      "Fundraising & Donor Management — donors, campaigns, and giving from one system.",
    status: "coming_soon",
    path: "giving",
  },
  {
    id: "commerce",
    name: "PulsePoint Commerce",
    shortName: "Commerce",
    tagline:
      "E-Commerce & Payments — storefronts, dues, merchandise, and flexible member purchasing.",
    status: "coming_soon",
    path: "commerce",
  },
  {
    id: "engage",
    name: "PulsePoint Engage",
    shortName: "Engage",
    tagline:
      "Marketing & Communications — campaigns, segmentation, and engagement from one system.",
    status: "coming_soon",
    path: "engage",
  },
  {
    id: "ai",
    name: "PulsePoint AI",
    shortName: "AI",
    tagline: "Draft communications, summaries, and staff assist.",
    status: "coming_soon",
    path: "ai",
  },
  {
    id: "insights",
    name: "PulsePoint Insights",
    shortName: "Insights",
    tagline:
      "Business Intelligence & Analytics — dashboards, reporting, and organization-wide visibility.",
    status: "coming_soon",
    path: "insights",
  },
];

export function productHref(orgSlug: string, product: PulseProduct): string {
  return `/${orgSlug}/${product.path}`;
}

export function getProduct(id: ProductId): PulseProduct | undefined {
  return PULSE_PRODUCTS.find((p) => p.id === id);
}
