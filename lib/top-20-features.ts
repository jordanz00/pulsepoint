/**
 * Top 20 highly visible PulsePoint AMS features — canonical demo registry.
 *
 * Tier 1: executive + portfolio highlights. Tier 2: full-suite depth.
 * Honest status labels per docs/PRODUCT-CLAIMS.md.
 */

export type Top20FeatureStatus = "live" | "alpha" | "demo";

export type Top20Feature = {
  rank: number;
  id: string;
  tier: 1 | 2;
  title: string;
  module: string;
  /** Org-relative path, or site path (e.g. /compare-protech, /#why-pulsepoint). */
  path: string;
  status: Top20FeatureStatus;
  hook: string;
  highlights: string[];
  statKey: string;
};

export const TOP_20_FEATURES: Top20Feature[] = [
  // ── Tier 1 — portfolio & executive wow ──
  {
    rank: 1,
    id: "leadership-loop",
    tier: 1,
    title: "Leadership Loop",
    module: "Executive",
    path: "/leadership",
    status: "live",
    hook: "15-minute scripted CEO path with live stat on every stop.",
    highlights: ["Six-step briefing", "Board pack close", "Walkthrough mode"],
    statKey: "leadership-loop",
  },
  {
    rank: 2,
    id: "command-center",
    tier: 1,
    title: "CEO Command Center",
    module: "Executive",
    path: "/command-center",
    status: "live",
    hook: "One-screen leadership briefing — membership, revenue, advocacy, events.",
    highlights: ["Four executive KPIs", "Revenue charts", "Hospital association strip"],
    statKey: "command-center",
  },
  {
    rank: 3,
    id: "mission-control",
    tier: 1,
    title: "Quake Mission Control",
    module: "Quake OS",
    path: "/mission-control",
    status: "live",
    hook: "AI corporation telemetry — divisions, waves, ship workflow.",
    highlights: ["7 divisions", "Orchestration log", "Build pulse KPIs"],
    statKey: "mission-control",
  },
  {
    rank: 4,
    id: "why-pulsepoint",
    tier: 1,
    title: "Why PulsePoint",
    module: "Marketing",
    path: "/#why-pulsepoint",
    status: "live",
    hook: "Flagship module film and honest compare — first impression for prospects.",
    highlights: ["Module film", "Static compare", "E2E tested"],
    statKey: "why-pulsepoint",
  },
  {
    rank: 5,
    id: "advocacy-story",
    tier: 1,
    title: "Public advocacy story",
    module: "PulsePoint Advocacy",
    path: "/advocacy/issues/nursing-workforce",
    status: "alpha",
    hook: "Campaign-hub issue page — hero, impact, take-action CTA.",
    highlights: ["Issue hero", "Impact bullets", "Take action form"],
    statKey: "advocacy-story",
  },
  {
    rank: 6,
    id: "learn-workforce",
    tier: 1,
    title: "Workforce & career fair",
    module: "PulsePoint Learn",
    path: "/learn/workforce",
    status: "alpha",
    hook: "Video playlist + virtual career fair on the member graph.",
    highlights: ["YouTube embeds", "Booth grid", "CE pipeline"],
    statKey: "learn-workforce",
  },
  {
    rank: 7,
    id: "membership-analytics",
    tier: 1,
    title: "MemberPulse & analytics",
    module: "MemberCore",
    path: "/members/analytics",
    status: "alpha",
    hook: "Engagement tiers, at-risk list, renewal pressure — board-ready.",
    highlights: ["Tier distribution", "At-risk panel", "Rule-based scores"],
    statKey: "membership-analytics",
  },
  {
    rank: 8,
    id: "health-system-governance",
    tier: 1,
    title: "Health system governance",
    module: "Enterprise AMS",
    path: "/enterprise/governance",
    status: "alpha",
    hook: "Parent-child hospital hierarchy and governance rollups.",
    highlights: ["System trees", "Orphan hospitals", "C-suite counts"],
    statKey: "health-system-governance",
  },
  {
    rank: 9,
    id: "board-pack",
    tier: 1,
    title: "Board briefing pack",
    module: "PulsePoint Insights",
    path: "/insights/board-pack",
    status: "alpha",
    hook: "Printable HTML board packet — revenue trend, dues mix, narrative.",
    highlights: ["Hero KPI strip", "Print / PDF", "Executive narrative"],
    statKey: "board-pack",
  },
  {
    rank: 10,
    id: "import-staging",
    tier: 1,
    title: "Protech import staging",
    module: "MemberCore",
    path: "/members/imports",
    status: "demo",
    hook: "Upload → map → preview → apply — honest migration path.",
    highlights: ["CSV upload", "Column mapping", "1k-row stress fixture"],
    statKey: "import-staging",
  },
  // ── Tier 2 — full-suite depth ──
  {
    rank: 11,
    id: "events-registration",
    tier: 2,
    title: "EventCore registration",
    module: "PulsePoint Events",
    path: "/events",
    status: "live",
    hook: "Publish, paid checkout, check-in — events on the member record.",
    highlights: ["Public registration", "Stripe checkout", "Capacity rules"],
    statKey: "events-registration",
  },
  {
    rank: 12,
    id: "member-360",
    tier: 2,
    title: "Member 360° timeline",
    module: "MemberCore",
    path: "/members",
    status: "demo",
    hook: "Unified staff view — events, giving, CE, notes in one profile.",
    highlights: ["Activity timeline", "Governance roles", "Staff notes"],
    statKey: "member-360",
  },
  {
    rank: 13,
    id: "insights-board",
    tier: 2,
    title: "Insights KPI board",
    module: "PulsePoint Insights",
    path: "/insights",
    status: "alpha",
    hook: "Drag-reorder widgets and manual snapshot — board KPIs from one DB.",
    highlights: ["Widget layout", "Dues vs non-dues", "Snapshot export"],
    statKey: "insights-board",
  },
  {
    rank: 14,
    id: "crm-prospector",
    tier: 2,
    title: "CRM & Prospector",
    module: "PulsePoint CRM",
    path: "/crm",
    status: "alpha",
    hook: "Workflows, web capture, enrichment — AMS + CRM on one spine.",
    highlights: ["Active workflows", "Web forms", "Duplicate merge"],
    statKey: "crm-prospector",
  },
  {
    rank: 15,
    id: "engage-email",
    tier: 2,
    title: "Engage email & sequences",
    module: "PulsePoint Engage",
    path: "/engage",
    status: "alpha",
    hook: "Audiences from live member data — templates, sequences, send logs.",
    highlights: ["Approved templates", "Audiences", "Campaign history"],
    statKey: "engage-email",
  },
  {
    rank: 16,
    id: "giving-donors",
    tier: 2,
    title: "Giving & donors",
    module: "PulsePoint Giving",
    path: "/giving",
    status: "alpha",
    hook: "Campaigns and gifts on the same member graph as membership.",
    highlights: ["Annual fund", "Gift history", "Public /give checkout"],
    statKey: "giving-donors",
  },
  {
    rank: 17,
    id: "commerce-store",
    tier: 2,
    title: "Commerce & member store",
    module: "PulsePoint Commerce",
    path: "/commerce",
    status: "alpha",
    hook: "Dues SKUs, merchandise, orders — finance-ready GL codes.",
    highlights: ["Product catalog", "Order history", "Public store link"],
    statKey: "commerce-store",
  },
  {
    rank: 18,
    id: "committees-governance",
    tier: 2,
    title: "Committees & governance",
    module: "Governance",
    path: "/committees",
    status: "alpha",
    hook: "Board and committee leadership rolled up from MemberCore.",
    highlights: ["Executive roles", "Board roster", "Committee chairs"],
    statKey: "committees-governance",
  },
  {
    rank: 19,
    id: "intelligence-briefing",
    tier: 2,
    title: "Intelligence briefing",
    module: "PulsePoint Intelligence",
    path: "/intelligence",
    status: "live",
    hook: "Proactive insights and recommended actions for staff.",
    highlights: ["Org insights", "Recommended actions", "Risk signals"],
    statKey: "intelligence-briefing",
  },
  {
    rank: 20,
    id: "compare-protech",
    tier: 2,
    title: "Compare Protech",
    module: "Marketing",
    path: "/compare-protech",
    status: "live",
    hook: "Honest Live / Alpha / Roadmap matrix vs typical legacy AMS.",
    highlights: ["No parity claims", "Capability matrix", "Migration story"],
    statKey: "compare-protech",
  },
];

export type Top20FeatureStat = {
  value: string;
  label: string;
  /** Override path when stat implies dynamic deep link (e.g. member 360). */
  pathOverride?: string;
};

export function featureHref(orgSlug: string, feature: Top20Feature, stat?: Top20FeatureStat): string {
  const path = stat?.pathOverride ?? feature.path;
  if (path.startsWith("/#")) return path;
  if (path === "/compare-protech") return "/compare-protech";
  return `/${orgSlug}${path.startsWith("/") ? path : `/${path}`}`;
}

export const TOP_20_TIER1 = TOP_20_FEATURES.filter((f) => f.tier === 1);
export const TOP_20_TIER2 = TOP_20_FEATURES.filter((f) => f.tier === 2);
