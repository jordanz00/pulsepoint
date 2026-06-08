/**
 * PulsePoint product suite — concise AMS + CRM tools (Protech-class scope, modern UX).
 *
 * STATUS: available = live · alpha = preview UI + seed data · coming_soon = stub
 */

export type ProductId =
  | "work"
  | "members"
  | "crm"
  | "deals"
  | "events"
  | "advertising"
  | "learn"
  | "giving"
  | "commerce"
  | "engage"
  | "insights"
  | "advocacy";

export type ProductStatus = "available" | "alpha" | "coming_soon";

/** How staff think about the tool — AMS operations vs CRM vs revenue intelligence */
export type ProductLayer = "ams" | "crm" | "revenue";

export type PulseProduct = {
  id: ProductId;
  name: string;
  shortName: string;
  /** One line — what the tool does */
  tagline: string;
  /** Protech-style tool label */
  toolLabel: string;
  layer: ProductLayer;
  status: ProductStatus;
  path: string;
};

export const PULSE_PRODUCTS: PulseProduct[] = [
  {
    id: "work",
    name: "PulsePoint Work",
    shortName: "Work",
    toolLabel: "Staff hub",
    tagline: "One fast workspace—same controls on every screen.",
    layer: "ams",
    status: "available",
    path: "work",
  },
  {
    id: "members",
    name: "MemberCore",
    shortName: "MemberCore",
    toolLabel: "Directory & CRM",
    tagline:
      "MemberPulse scores, directory search, staff notes, and audited export—one record per person.",
    layer: "crm",
    status: "available",
    path: "members",
  },
  {
    id: "crm",
    name: "PulsePoint CRM",
    shortName: "CRM",
    toolLabel: "Relationships",
    tagline: "Unify contacts, web capture, and people workflows in one CRM spine.",
    layer: "crm",
    status: "alpha",
    path: "crm",
  },
  {
    id: "deals",
    name: "PulsePoint Partnerships",
    shortName: "Partnerships",
    toolLabel: "Business development",
    tagline:
      "Sponsorship and partnership pipeline with forecast, conversion, and executive dashboards.",
    layer: "crm",
    status: "alpha",
    path: "deals",
  },
  {
    id: "events",
    name: "EventCore",
    shortName: "EventCore",
    toolLabel: "Events & correspondence",
    tagline:
      "Full event management: sponsors, session RSVP, scheduled email, surveys, badges, refunds, and CMS export.",
    layer: "revenue",
    status: "available",
    path: "events",
  },
  {
    id: "advertising",
    name: "PulsePoint Ad Ops",
    shortName: "Ad ops",
    toolLabel: "Campaigns & sync",
    tagline: "Ad ops: NPI checks, MLR workflow, DSP sync, reconciliation.",
    layer: "ams",
    status: "alpha",
    path: "advertising",
  },
  {
    id: "learn",
    name: "PulsePoint Learn",
    shortName: "Learn",
    toolLabel: "CE & courses",
    tagline: "Credits and completions on the member profile.",
    layer: "ams",
    status: "alpha",
    path: "learn",
  },
  {
    id: "giving",
    name: "PulsePoint Giving",
    shortName: "Giving",
    toolLabel: "Fundraising",
    tagline: "Campaigns and gifts tied to members—non-dues revenue.",
    layer: "revenue",
    status: "alpha",
    path: "giving",
  },
  {
    id: "commerce",
    name: "PulsePoint Commerce",
    shortName: "Commerce",
    toolLabel: "Dues & checkout",
    tagline: "Admin products and orders—plus a public member store preview.",
    layer: "revenue",
    status: "alpha",
    path: "commerce",
  },
  {
    id: "engage",
    name: "PulsePoint Engage",
    shortName: "Engage",
    toolLabel: "Member email",
    tagline: "Segments and sends—market to members without exports.",
    layer: "crm",
    status: "alpha",
    path: "engage",
  },
  {
    id: "insights",
    name: "PulsePoint Insights",
    shortName: "Insights",
    toolLabel: "Reports & KPIs",
    tagline: "Board KPIs, drag-reorder widgets, and manual snapshots.",
    layer: "revenue",
    status: "alpha",
    path: "insights",
  },
  {
    id: "advocacy",
    name: "PulsePoint Advocacy",
    shortName: "Advocacy",
    toolLabel: "Policy & take action",
    tagline:
      "Priority issues, hospital coalitions, and legislator outreach—one workflow from alert to action.",
    layer: "ams",
    status: "alpha",
    path: "enterprise/advocacy",
  },
];

export const PRODUCT_LAYER_LABEL: Record<ProductLayer, string> = {
  ams: "AMS",
  crm: "CRM",
  revenue: "Revenue",
};

export function productHref(orgSlug: string, product: PulseProduct): string {
  return `/${orgSlug}/${product.path}`;
}

export function getProduct(id: ProductId): PulseProduct | undefined {
  return PULSE_PRODUCTS.find((p) => p.id === id);
}
