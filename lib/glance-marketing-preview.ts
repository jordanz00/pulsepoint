/**
 * At a Glance marketing preview — derived from canonical PULSE_PRODUCTS (honest labels).
 */

import type { ProductId } from "@/lib/products";
import { PULSE_PRODUCTS, PRODUCT_LAYER_LABEL, type ProductLayer } from "@/lib/products";
import { suiteMetrics } from "@/lib/suite-marketing";

export const GLANCE_SUITE_METRICS = suiteMetrics(PULSE_PRODUCTS);

export const GLANCE_VIEWS = [
  { id: "platform", chip: "Platform", title: "Twelve modules, one spine" },
  { id: "audience", chip: "Who we serve", title: "Built for hospital associations" },
  { id: "foundation", chip: "How it's built", title: "Trust by design" },
] as const;

export type GlanceViewId = (typeof GLANCE_VIEWS)[number]["id"];

export const GLANCE_AUDIENCES = [
  {
    id: "ceo",
    title: "CEO & board",
    headline: "Walk in with numbers you trust.",
    bullets: ["Live KPIs from one database", "Export-ready board decks", "Honest Live / Preview labels"],
    productId: "insights" as const,
    demoHref: "/demo-healthcare/insights",
  },
  {
    id: "staff",
    title: "Membership & events",
    headline: "Search. Publish. Done.",
    bullets: ["One roster across every module", "EventCore + EasyDNN export", "No menu archaeology"],
    productId: "members" as const,
    demoHref: "/demo-healthcare/members",
  },
  {
    id: "gr",
    title: "GR & PAC",
    headline: "Policy fights with proof.",
    bullets: ["Advocacy tied to hospital roster", "PAC pace on one screen", "Take-action campaigns"],
    productId: "advocacy" as const,
    demoHref: "/demo-healthcare/enterprise/advocacy",
  },
  {
    id: "it",
    title: "IT & web teams",
    headline: "Connect—not replace.",
    bullets: ["Microsoft 365 + EasyDNN handoff", "Tenant isolation per org", "Audited imports & exports"],
    productId: "work" as const,
    demoHref: "/demo-healthcare/enterprise/integrations",
  },
] as const;

export const GLANCE_FOUNDATIONS = [
  {
    id: "isolation",
    title: "Private per association",
    summary: "Each tenant gets its own data space—rosters and payments never mix.",
    checklist: ["Dedicated org database", "Cross-org exposure checks", "Role-gated exports"],
    productId: "crm" as ProductId,
  },
  {
    id: "imports",
    title: "Reviewed imports",
    summary: "Spreadsheet uploads staged for staff—duplicates resolved before go-live.",
    checklist: ["CSV with duplicate review", "Exceptions queue for sync issues", "Audit log on sensitive changes"],
    productId: "events" as ProductId,
  },
  {
    id: "labels",
    title: "Honest scope",
    summary: "Every screen shows Live, Preview, or Coming soon—contracts match the product.",
    checklist: ["No vapor in bundles", "Demo labels match contracts", "Roadmap visible in-app"],
    productId: "work" as ProductId,
  },
] as const;

export const GLANCE_LAYER_ORDER: ProductLayer[] = ["ams", "crm", "revenue"];

export { PULSE_PRODUCTS, PRODUCT_LAYER_LABEL };
