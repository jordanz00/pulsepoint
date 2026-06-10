/**
 * Interactive suite explorer — one tab per module, concise sell copy.
 */

import type { CatalogStatus } from "@/lib/marketing-catalog";
import {
  ADVOCACY_MARKETING,
  ENTERPRISE_INTEGRATIONS_MARKETING,
  EVENTS_MARKETING,
  INSIGHTS_MARKETING,
  MEMBERCORE_MARKETING,
  PAC_MARKETING,
} from "@/lib/marketing-home";
import type { FeatureMatrixIcon } from "@/lib/marketing-home";
import type { ProductId } from "@/lib/products";
import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

export type SuiteExplorerPreviewKey =
  | "members"
  | "events"
  | "advocacy"
  | "insights"
  | "learn"
  | "pac"
  | "viz"
  | "integrations";

export type SuiteExplorerTab = {
  id: string;
  label: string;
  headline: string;
  pitch: string;
  bullets: readonly string[];
  status: CatalogStatus;
  productId: ProductId;
  icon: FeatureMatrixIcon;
  demoHref: string;
  demoLabel: string;
  preview: SuiteExplorerPreviewKey;
  vizProductId?: ProductId;
};

export const SUITE_EXPLORER_INTRO = {
  eyebrow: "Explore the platform",
  title: "Every module. One click away.",
  lead: "Tap a program—see real UI samples. Live ships today; Alpha is labeled honestly.",
} as const;

export const SUITE_EXPLORER_TABS: SuiteExplorerTab[] = [
  {
    id: "members",
    label: "MemberCore",
    headline: MEMBERCORE_MARKETING.headline,
    pitch: MEMBERCORE_MARKETING.lead,
    bullets: MEMBERCORE_MARKETING.outcomes[0]!.features,
    status: "available",
    productId: "members",
    icon: "members",
    demoHref: MEMBERCORE_MARKETING.demoHref,
    demoLabel: MEMBERCORE_MARKETING.demoLabel,
    preview: "members",
  },
  {
    id: "events",
    label: "Events",
    headline: EVENTS_MARKETING.headline,
    pitch: EVENTS_MARKETING.lead,
    bullets: EVENTS_MARKETING.capabilities.slice(0, 4),
    status: "available",
    productId: "events",
    icon: "events",
    demoHref: EVENTS_MARKETING.demoHref,
    demoLabel: EVENTS_MARKETING.demoLabel,
    preview: "events",
  },
  {
    id: "advocacy",
    label: "Advocacy",
    headline: ADVOCACY_MARKETING.headline,
    pitch: ADVOCACY_MARKETING.lead,
    bullets: ADVOCACY_MARKETING.outcomes[0]!.features,
    status: "alpha",
    productId: "advocacy",
    icon: "advocacy",
    demoHref: ADVOCACY_MARKETING.demoHref,
    demoLabel: "Open Advocacy demo",
    preview: "advocacy",
  },
  {
    id: "insights",
    label: "Insights",
    headline: INSIGHTS_MARKETING.headline,
    pitch: INSIGHTS_MARKETING.lead,
    bullets: INSIGHTS_MARKETING.outcomes.map((o) => o.title),
    status: "alpha",
    productId: "insights",
    icon: "insights",
    demoHref: INSIGHTS_MARKETING.demoHref,
    demoLabel: INSIGHTS_MARKETING.demoLabel,
    preview: "insights",
  },
  {
    id: "learn",
    label: "Learn",
    headline: "Workforce pipeline on the member graph",
    pitch:
      "Career fairs, CE playlists, and transcript export—without a separate LMS silo.",
    bullets: [
      "Virtual career fair booth grid",
      "CE tracking on member profiles",
      "Self-service transcript download",
    ],
    status: "alpha",
    productId: "learn",
    icon: "education",
    demoHref: `/${DEMO_ORG_SLUG}/learn/workforce`,
    demoLabel: "Explore Learn",
    preview: "learn",
  },
  {
    id: "pac",
    label: "Giving & PAC",
    headline: PAC_MARKETING.headline,
    pitch: PAC_MARKETING.lead,
    bullets: PAC_MARKETING.outcomes[0]!.features,
    status: "alpha",
    productId: "giving",
    icon: "fundraising",
    demoHref: PAC_MARKETING.demoHref,
    demoLabel: PAC_MARKETING.demoLabel,
    preview: "pac",
  },
  {
    id: "commerce",
    label: "Commerce",
    headline: "Dues and products—checkout on the roster",
    pitch:
      "Sell memberships and SKUs with Stripe; orders tie back to members—not a disconnected cart.",
    bullets: [
      "Stripe checkout",
      "Renewal-aware dues",
      "Finance CSV export",
      "Webhook idempotency",
    ],
    status: "alpha",
    productId: "commerce",
    icon: "commerce",
    demoHref: `/${DEMO_ORG_SLUG}/commerce`,
    demoLabel: "Open Commerce",
    preview: "viz",
    vizProductId: "commerce",
  },
  {
    id: "engage",
    label: "Engage",
    headline: "Email audiences from live member data",
    pitch:
      "Build segments from tags and event attendance—send without exporting lists to another tool.",
    bullets: [
      "Tag-based audiences",
      "Template approval gate",
      "Send failure exceptions",
      "Honest Alpha labels",
    ],
    status: "alpha",
    productId: "engage",
    icon: "communications",
    demoHref: `/${DEMO_ORG_SLUG}/engage`,
    demoLabel: "Open Engage",
    preview: "viz",
    vizProductId: "engage",
  },
  {
    id: "integrations",
    label: "Integrations",
    headline: ENTERPRISE_INTEGRATIONS_MARKETING.headline,
    pitch: ENTERPRISE_INTEGRATIONS_MARKETING.lead,
    bullets: ENTERPRISE_INTEGRATIONS_MARKETING.outcomes.map((o) => o.title),
    status: "available",
    productId: "work",
    icon: "work",
    demoHref: ENTERPRISE_INTEGRATIONS_MARKETING.demoHref,
    demoLabel: ENTERPRISE_INTEGRATIONS_MARKETING.demoLabel,
    preview: "integrations",
  },
];
