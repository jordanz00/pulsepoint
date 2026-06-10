/**
 * Flagship 5 marketing copy — public-safe, no tenant stats.
 * Honest Live / Alpha / Demo preview labels per docs/PRODUCT-CLAIMS.md.
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";

export type FlagshipMarketingStatus = "live" | "alpha" | "preview";

export type FlagshipMarketingFeature = {
  id: string;
  title: string;
  status: FlagshipMarketingStatus;
  statusLabel: string;
  hook: string;
  bullets: string[];
  demoHref: string;
};

export const FLAGSHIP_MARKETING = {
  eyebrow: "Flagship capabilities",
  headline: "Five reasons hospital associations switch to PulsePoint",
  lead: "Executive visibility, membership health, integrated advocacy, board reporting, and honest migration — on one AMS. Every label is honest: Live, Alpha, or Demo preview.",
  demoCta: "See in demo",
  demoHref: `/${DEMO_ORG_SLUG}/flagship`,
  features: [
    {
      id: "executive-command",
      title: "Executive Command Center",
      status: "live" as const,
      statusLabel: "Live",
      hook: "One-screen leadership briefing with a scripted CEO path — membership, revenue, advocacy, and events.",
      bullets: ["Four executive KPIs", "Embedded leadership loop", "Hospital association strip"],
      demoHref: `/${DEMO_ORG_SLUG}/flagship/executive`,
    },
    {
      id: "membership-intelligence",
      title: "Membership Intelligence",
      status: "preview" as const,
      statusLabel: "Demo preview",
      hook: "Engagement tiers, at-risk lists, and board-ready analytics from your live member graph.",
      bullets: ["Tier distribution", "At-risk panel", "Renewal pipeline KPIs"],
      demoHref: `/${DEMO_ORG_SLUG}/flagship/membership`,
    },
    {
      id: "advocacy-one-roster",
      title: "Advocacy on One Roster",
      status: "alpha" as const,
      statusLabel: "Alpha",
      hook: "Issue campaigns linked to hospital accounts on the same MemberCore roster — staff hub and public take-action.",
      bullets: ["Hospital roster linkage", "Issue hub + hero media", "Take-action responses"],
      demoHref: `/${DEMO_ORG_SLUG}/flagship/advocacy`,
    },
    {
      id: "board-briefing-pack",
      title: "Board Briefing Pack",
      status: "preview" as const,
      statusLabel: "Demo preview",
      hook: "Printable HTML board packet and KPI widget board from the same tenant database.",
      bullets: ["Hero KPI strip", "Print / PDF export", "Leadership loop close"],
      demoHref: `/${DEMO_ORG_SLUG}/flagship/board`,
    },
    {
      id: "migration-honest",
      title: "Migration Without Rip-and-Replace",
      status: "preview" as const,
      statusLabel: "Demo preview",
      hook: "CSV import staging plus an honest Protech comparison — no false parity claims.",
      bullets: ["Upload → map → apply", "Duplicate review", "Live / Alpha / Roadmap matrix"],
      demoHref: `/${DEMO_ORG_SLUG}/flagship/migration`,
    },
  ] satisfies FlagshipMarketingFeature[],
} as const;
