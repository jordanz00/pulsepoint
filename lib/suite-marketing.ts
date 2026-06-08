/**
 * Marketing suite band — derives labels and metrics from canonical PULSE_PRODUCTS.
 * Keeps homepage counts in sync with lib/products.ts (no hardcoded "3 Live / 5 Preview").
 */

import type { FeatureMatrixIcon } from "@/lib/marketing-home";
import {
  PULSE_PRODUCTS,
  PRODUCT_LAYER_LABEL,
  type ProductId,
  type ProductLayer,
  type ProductStatus,
  type PulseProduct,
} from "@/lib/products";

export const PRODUCT_MARKETING_ICONS: Record<ProductId, FeatureMatrixIcon> = {
  work: "work",
  members: "members",
  crm: "crm",
  deals: "deals",
  advertising: "advertising",
  events: "events",
  learn: "education",
  giving: "fundraising",
  commerce: "commerce",
  engage: "communications",
  insights: "insights",
  advocacy: "advocacy",
};

/** Icon tile tone = product id (one unique mk-icon-tile--* per module). */
export const PRODUCT_ICON_TONES: Record<ProductId, ProductId> = {
  work: "work",
  members: "members",
  crm: "crm",
  deals: "deals",
  advertising: "advertising",
  events: "events",
  learn: "learn",
  giving: "giving",
  commerce: "commerce",
  engage: "engage",
  insights: "insights",
  advocacy: "advocacy",
};

export type SuiteLayerFilter = "all" | ProductLayer;

export function filterProductsByLayer(
  products: PulseProduct[],
  layer: SuiteLayerFilter
): PulseProduct[] {
  if (layer === "all") return products;
  return products.filter((p) => p.layer === layer);
}

export function suiteMetrics(products: PulseProduct[]) {
  const live = products.filter((p) => p.status === "available").length;
  const preview = products.filter((p) => p.status === "alpha").length;
  const coming = products.filter((p) => p.status === "coming_soon").length;
  const total = products.length;
  const readinessPct = total > 0 ? Math.round((live / total) * 100) : 0;
  return { live, preview, coming, total, readinessPct };
}

export function statusToCatalog(status: ProductStatus): "available" | "alpha" | "roadmap" {
  if (status === "available") return "available";
  if (status === "alpha") return "alpha";
  return "roadmap";
}

export const SUITE_LAYER_FILTERS: {
  id: SuiteLayerFilter;
  label: string;
  layerIcon: "all" | "ams" | "crm" | "revenue";
}[] = [
  { id: "all", label: "Full suite", layerIcon: "all" },
  { id: "ams", label: PRODUCT_LAYER_LABEL.ams, layerIcon: "ams" },
  { id: "crm", label: PRODUCT_LAYER_LABEL.crm, layerIcon: "crm" },
  { id: "revenue", label: PRODUCT_LAYER_LABEL.revenue, layerIcon: "revenue" },
];

/** Executive-facing trust signals (ops, not vanity counts). */
export const SUITE_TRUST_SIGNALS = [
  { id: "imports", label: "Staged imports", detail: "Human review before go-live", icon: "imports" },
  { id: "exports", label: "Audited exports", detail: "Role-gated, logged downloads", icon: "exports" },
  { id: "labels", label: "Honest scope", detail: "Live / Preview in product & contract", icon: "labels" },
] as const;

/** Short capability bullets for the marketing module spotlight. */
export const PRODUCT_HIGHLIGHTS: Record<ProductId, string[]> = {
  work: ["One staff workspace", "Exceptions & tasks", "Same chrome on every module"],
  members: ["MemberPulse engagement", "Directory & renewals", "Staff notes & exports"],
  crm: ["Unified contact spine", "Web capture forms", "People workflows"],
  deals: ["Sponsorship pipeline", "Forecast & stages", "Executive dashboards"],
  events: ["Registration & waitlist", "Program & badges", "Scheduled email & surveys"],
  advertising: ["NPI & audience checks", "MLR workflow", "DSP sync & reconciliation"],
  learn: ["CE tracking", "Completions on profile", "Course catalog"],
  giving: ["Campaigns & gifts", "Member-linked revenue", "Fundraising reports"],
  commerce: ["Dues & products", "Orders & checkout", "Member store preview"],
  engage: ["Segments & templates", "Member email sends", "No spreadsheet exports"],
  insights: ["Board KPI widgets", "Drag-reorder layouts", "Manual snapshots"],
  advocacy: [
    "Priority issue registry",
    "Take-action campaigns",
    "Hospital participation rollups",
  ],
};

export const LAYER_SPOTLIGHT_COPY: Record<ProductLayer, string> = {
  ams: "Association operations: staff workspace, advocacy, and continuing education",
  crm: "Hospital member operations: roster, engagement, and relationship history",
  revenue: "Revenue operations: registration, dues, giving, and executive reporting",
};

export function layerFilterMetrics(
  products: PulseProduct[],
  layer: SuiteLayerFilter
) {
  const subset =
    layer === "all" ? products : products.filter((p) => p.layer === layer);
  return suiteMetrics(subset);
}

export { PULSE_PRODUCTS };
