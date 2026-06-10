/**
 * Flagship 5 — buyer-facing PulsePoint AMS capabilities (sales demo registry).
 *
 * Maps to existing routes and Top 20 stat keys. Honest status per docs/PRODUCT-CLAIMS.md.
 */

export type FlagshipFeatureStatus = "live" | "alpha" | "demo";

export type FlagshipChildRoute = {
  label: string;
  /** Org-relative path, or site path (e.g. /compare-protech). */
  path: string;
};

export type FlagshipFeature = {
  rank: number;
  id: string;
  title: string;
  module: string;
  hubPath: string;
  status: FlagshipFeatureStatus;
  hook: string;
  highlights: string[];
  /** Primary stat from load-flagship-feature-stats; secondary keys for hub pages. */
  statKeys: string[];
  childRoutes: FlagshipChildRoute[];
  /** Optional disclaimer for demo preview surfaces. */
  disclaimer?: string;
};

export const FLAGSHIP_FEATURES: FlagshipFeature[] = [
  {
    rank: 1,
    id: "executive-command",
    title: "Executive Command Center",
    module: "Executive",
    hubPath: "/flagship/executive",
    status: "live",
    hook: "One-screen leadership briefing — membership, revenue, advocacy, and events with a scripted CEO path.",
    highlights: ["Four executive KPIs", "Leadership loop embedded", "Hospital association strip"],
    statKeys: ["command-center", "leadership-loop"],
    childRoutes: [
      { label: "Command center", path: "/command-center" },
      { label: "Leadership loop", path: "/leadership" },
    ],
  },
  {
    rank: 2,
    id: "membership-intelligence",
    title: "Membership Intelligence",
    module: "MemberCore",
    hubPath: "/flagship/membership",
    status: "demo",
    hook: "Engagement tiers, at-risk list, and board-ready analytics from your live member graph.",
    highlights: ["Tier distribution", "At-risk panel", "Renewal pipeline KPIs"],
    statKeys: ["membership-analytics", "member-360"],
    childRoutes: [
      { label: "Membership analytics", path: "/members/analytics" },
      { label: "MemberPulse", path: "/members/pulse" },
    ],
    disclaimer: "Demo preview — rule-based tiers; not unattended ML scoring.",
  },
  {
    rank: 3,
    id: "advocacy-one-roster",
    title: "Advocacy on One Roster",
    module: "PulsePoint Advocacy",
    hubPath: "/flagship/advocacy",
    status: "alpha",
    hook: "Issue campaigns linked to hospital accounts on the same member roster — staff hub and public take-action.",
    highlights: ["Hospital roster linkage", "Issue hub + hero media", "Take-action responses"],
    statKeys: ["advocacy-story", "advocacy-roster"],
    childRoutes: [
      { label: "Staff issue hub", path: "/enterprise/advocacy" },
      { label: "Public issue page", path: "/advocacy/issues/nursing-workforce" },
    ],
  },
  {
    rank: 4,
    id: "board-briefing-pack",
    title: "Board Briefing Pack",
    module: "PulsePoint Insights",
    hubPath: "/flagship/board",
    status: "demo",
    hook: "Printable HTML board packet and KPI widget board from the same tenant database.",
    highlights: ["Hero KPI strip", "Print / PDF export", "Leadership loop close"],
    statKeys: ["board-pack", "insights-board"],
    childRoutes: [
      { label: "Board pack (print)", path: "/insights/board-pack" },
      { label: "Insights KPI board", path: "/insights" },
    ],
    disclaimer: "Demo preview — manual snapshots; unattended email schedules are roadmap.",
  },
  {
    rank: 5,
    id: "migration-honest",
    title: "Migration Without Rip-and-Replace",
    module: "MemberCore",
    hubPath: "/flagship/migration",
    status: "demo",
    hook: "CSV import staging plus an honest Protech comparison — no false parity claims.",
    highlights: ["Upload → map → apply", "Duplicate review", "Live / Alpha / Roadmap matrix"],
    statKeys: ["import-staging", "compare-protech"],
    childRoutes: [
      { label: "Import staging", path: "/members/imports" },
      { label: "Compare Protech", path: "/compare-protech" },
    ],
    disclaimer: "Demo preview — no nightly Protech sync or blind bulk insert.",
  },
];

export type FlagshipFeatureStat = {
  value: string;
  label: string;
  pathOverride?: string;
  secondary?: { value: string; label: string }[];
};

export function getFlagshipFeatureById(id: string): FlagshipFeature | undefined {
  return FLAGSHIP_FEATURES.find((f) => f.id === id);
}

/** Resolve org-relative or site-wide href for a flagship path. */
export function resolveFlagshipPath(orgSlug: string, path: string): string {
  if (path.startsWith("/#")) return path;
  if (path === "/compare-protech") return "/compare-protech";
  return `/${orgSlug}${path.startsWith("/") ? path : `/${path}`}`;
}

export function flagshipHubHref(orgSlug: string, feature: FlagshipFeature): string {
  return resolveFlagshipPath(orgSlug, feature.hubPath);
}

export function flagshipChildHref(orgSlug: string, route: FlagshipChildRoute): string {
  return resolveFlagshipPath(orgSlug, route.path);
}
