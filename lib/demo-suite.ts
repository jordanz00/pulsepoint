/**
 * Standalone demo suite — PulsePoint product modules for exploration.
 *
 * In demo org, every product module is navigable with seeded data (live + alpha).
 * Import review, exception queue, and committees are not surfaced in the UI.
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";
import { PULSE_PRODUCTS, productHref, type ProductId, type PulseProduct } from "@/lib/products";

export type SuiteModuleCard = {
  id: string;
  name: string;
  href: string;
  status: "live" | "alpha" | "partial";
  tagline: string;
  enabledInDemo: true;
  productId?: ProductId;
};

export function isDemoOrgSlug(orgSlug: string): boolean {
  return orgSlug === DEMO_ORG_SLUG;
}

export function productStatusForDemo(product: PulseProduct): "live" | "alpha" {
  return product.status === "available" ? "live" : "alpha";
}

export function buildSuiteModuleCards(orgSlug: string): SuiteModuleCard[] {
  const products: SuiteModuleCard[] = PULSE_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    href: productHref(orgSlug, p),
    status: productStatusForDemo(p),
    tagline: p.tagline,
    enabledInDemo: true,
    productId: p.id,
  }));
  return products;
}

export function suitePageHref(orgSlug: string): string {
  return `/${orgSlug}/suite`;
}
