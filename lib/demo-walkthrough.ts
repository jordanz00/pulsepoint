/**
 * Guided demo walkthrough — full AMS + CRM tour for demo healthcare org.
 * Portfolio script: docs/PORTFOLIO-SHOWCASE-PLAN.md
 */

import { DEMO_ORG_SLUG } from "@/lib/demo-mode-gates";
import { STATEWIDE_HOSPITAL_MEMBERSHIP_LINE } from "@/lib/marketing-constants";

export type WalkthroughStepStatus = "live" | "alpha" | "partial";

export type WalkthroughStep = {
  id: string;
  index: number;
  title: string;
  module: string;
  path: string;
  status: WalkthroughStepStatus;
  durationMin: number;
  talkTrack: string;
  show: string[];
  /** Portfolio 15-min script highlight */
  portfolioHighlight?: boolean;
};

const STEPS_RAW: Omit<WalkthroughStep, "index">[] = [
  {
    id: "overview",
    title: "Executive dashboard",
    module: "PulsePoint Work",
    path: "",
    status: "live",
    durationMin: 3,
    portfolioHighlight: true,
    talkTrack:
      "One workspace for membership, CRM, events, advocacy, education, commerce, and board reporting—built for statewide hospital associations.",
    show: ["Revenue KPIs with sparklines", "Executive briefing", "Revenue mix bento"],
  },
  {
    id: "command-center",
    title: "CEO command center",
    module: "Executive",
    path: "/command-center",
    status: "live",
    durationMin: 2,
    portfolioHighlight: true,
    talkTrack:
      "Leadership one-screen: membership trend, revenue MTD, review queue, and domain panels for events, governance, and advocacy.",
    show: ["Four executive KPIs", "Membership + revenue charts", "Hospital association strip"],
  },
  {
    id: "leadership-loop",
    title: "Leadership loop",
    module: "Executive",
    path: "/leadership",
    status: "live",
    durationMin: 15,
    portfolioHighlight: true,
    talkTrack:
      "Scripted CEO path — six stops from command center to board pack with live stats on every card. The story investors and boards want in one click.",
    show: ["Six-step briefing", "Live stat per stop", "Quake mission control", "Board pack close"],
  },
  {
    id: "members",
    title: "MemberCore directory",
    module: "MemberCore",
    path: "/members",
    status: "live",
    durationMin: 4,
    portfolioHighlight: true,
    talkTrack: `Your statewide roster—${STATEWIDE_HOSPITAL_MEMBERSHIP_LINE}. One record per hospital and contact: tags, governance roles, engagement tiers, and staff notes.`,
    show: ["Search & filters", "Governance roles", "MemberPulse scoring", "Staged imports"],
  },
  {
    id: "members-analytics",
    title: "Membership analytics",
    module: "MemberCore",
    path: "/members/analytics",
    status: "live",
    durationMin: 3,
    portfolioHighlight: true,
    talkTrack:
      "Engagement tiers, at-risk counts, and renewal pressure—board-ready membership health without exporting to Excel.",
    show: ["Tier distribution", "Engagement scores", "Analytics export"],
  },
  {
    id: "imports",
    title: "Protech import staging",
    module: "MemberCore",
    path: "/members/imports",
    status: "alpha",
    durationMin: 3,
    portfolioHighlight: true,
    talkTrack:
      "Upload a Protech-style CSV, map columns, preview rows, and stage before merge—honest migration path vs rip-and-replace.",
    show: ["CSV upload", "Column mapping", "Preview + apply", "1k-row stress fixture"],
  },
  {
    id: "crm",
    title: "CRM & relationships",
    module: "PulsePoint CRM",
    path: "/crm",
    status: "alpha",
    durationMin: 4,
    talkTrack:
      "AMS and CRM on one member spine—workflows, web capture, prospector enrichment, duplicate merge, and follow-up queues without a separate Salesforce.",
    show: ["Active workflows", "Web forms", "Prospector", "Unify duplicates"],
  },
  {
    id: "events",
    title: "Events & registration",
    module: "EventCore",
    path: "/events",
    status: "live",
    durationMin: 4,
    talkTrack:
      "Publish programs, paid summits, sponsorships, check-in, and public registration—events tied to the member record.",
    show: ["Published + draft events", "Paid summit", "Public registration link", "Badges & sponsors"],
  },
  {
    id: "advocacy",
    title: "Advocacy & government affairs",
    module: "PulsePoint Advocacy",
    path: "/enterprise/advocacy",
    status: "alpha",
    durationMin: 3,
    talkTrack:
      "Priority issues, bill tracking, and take-action campaigns with hospital participation—government affairs on the same roster as membership.",
    show: ["Policy issues", "Bill status", "Active campaigns", "Participation KPIs"],
  },
  {
    id: "advocacy-story",
    title: "Public advocacy story",
    module: "PulsePoint Advocacy",
    path: "/advocacy/issues/nursing-workforce",
    status: "alpha",
    durationMin: 2,
    portfolioHighlight: true,
    talkTrack:
      "Member-facing issue page: story, impact bullets, and staff workflow—policy narrative that reads like a campaign hub, not a PDF.",
    show: ["Issue hero", "Why it matters", "Impact bullets", "Take action CTA"],
  },
  {
    id: "learn-workforce",
    title: "Workforce video & career fair",
    module: "PulsePoint Learn",
    path: "/learn/workforce",
    status: "alpha",
    durationMin: 4,
    portfolioHighlight: true,
    talkTrack:
      "Curated video playlist, virtual career fair booth grid, and CE pipeline—workforce development on the member graph.",
    show: ["Video playlist embed", "Public booth grid", "Workforce programs", "Member library preview"],
  },
  {
    id: "giving",
    title: "Fundraising & donors",
    module: "PulsePoint Giving",
    path: "/giving",
    status: "alpha",
    durationMin: 2,
    talkTrack:
      "Campaigns, one-time gifts, and donor profiles on the same member graph—fundraising connected to membership and events.",
    show: ["Annual fund", "Scholarship fund", "Gift history"],
  },
  {
    id: "commerce",
    title: "Dues & e-commerce",
    module: "PulsePoint Commerce",
    path: "/commerce",
    status: "alpha",
    durationMin: 3,
    talkTrack:
      "Dues SKUs, merchandise, sponsorship products, and orders—with GL codes for finance handoff and member self-service checkout.",
    show: ["Dues products", "Orders PAID/PENDING", "Member store link"],
  },
  {
    id: "engage",
    title: "Marketing & email",
    module: "PulsePoint Engage",
    path: "/engage",
    status: "alpha",
    durationMin: 2,
    talkTrack:
      "Templates, audiences built from live member data, email sequences, and send logs—personalized outreach without exporting lists.",
    show: ["Templates", "Audiences", "Sent campaign", "Sequences"],
  },
  {
    id: "partnerships",
    title: "Partnerships & pipeline",
    module: "PulsePoint Partnerships",
    path: "/deals/pipeline",
    status: "alpha",
    durationMin: 3,
    talkTrack:
      "Sponsorship and business development pipeline with executive dashboards—forecast revenue alongside membership and events.",
    show: ["Deal pipeline", "Stage board", "Report dashboards"],
  },
  {
    id: "insights",
    title: "Business intelligence",
    module: "PulsePoint Insights",
    path: "/insights",
    status: "alpha",
    durationMin: 3,
    talkTrack:
      "Board-ready KPIs: dues vs non-dues revenue, member counts, snapshot history, and audited exports from one database.",
    show: ["Total / dues / non-dues", "Revenue breakdown", "Snapshot export", "Audit trail"],
  },
  {
    id: "portal",
    title: "Member portal self-service",
    module: "Portal",
    path: "/portal",
    status: "live",
    durationMin: 2,
    portfolioHighlight: true,
    talkTrack:
      "Members download their own CE transcript, pay renewals, and see events — self-service on the same roster staff manage.",
    show: ["CE transcript download", "Renewal pay", "Event registrations", "Committee roles"],
  },
  {
    id: "board-pack",
    title: "Board briefing pack",
    module: "PulsePoint Insights",
    path: "/insights/board-pack",
    status: "alpha",
    durationMin: 3,
    portfolioHighlight: true,
    talkTrack:
      "Printable HTML board packet—KPIs, revenue trend, dues mix, and executive narrative. Not a raw CSV dump.",
    show: ["Hero KPI strip", "Revenue charts", "Print / Save PDF", "Download HTML"],
  },
  {
    id: "committees",
    title: "Committees & governance",
    module: "Governance",
    path: "/committees",
    status: "alpha",
    durationMin: 2,
    talkTrack:
      "Board and committee leadership rolled up from MemberCore—CEO, trustees, and committee chairs in one governance view.",
    show: ["Executive roles", "Board roster", "Committee chairs"],
  },
  {
    id: "exceptions",
    title: "Staff productivity queue",
    module: "Automation",
    path: "/exceptions",
    status: "live",
    durationMin: 2,
    talkTrack:
      "When automation needs a human check—failed email sends, payment reconciliation—staff resolve items here instead of hunting logs.",
    show: ["Open exceptions", "Resolve workflow", "Audit on resolve"],
  },
  {
    id: "portal",
    title: "Member portal",
    module: "Portal",
    path: "/portal",
    status: "live",
    durationMin: 2,
    talkTrack:
      "Self-service for members: profile, event registrations, orders, and learning history—preview of the member-facing experience.",
    show: ["Member profile", "Registrations", "Orders", "Learning progress"],
  },
];

export const WALKTHROUGH_STEPS: WalkthroughStep[] = STEPS_RAW.map((step, index) => ({
  ...step,
  index,
}));

/** Steps highlighted in the 15-minute portfolio script */
export const PORTFOLIO_WALKTHROUGH_STEPS = WALKTHROUGH_STEPS.filter((s) => s.portfolioHighlight);

export function walkthroughBasePath(orgSlug: string = DEMO_ORG_SLUG): string {
  return `/${orgSlug}`;
}

export function walkthroughModuleHref(
  orgSlug: string,
  path: string,
  options?: { guided?: boolean },
): string {
  const base = `${walkthroughBasePath(orgSlug)}${path}`;
  if (options?.guided) {
    return `${base}${base.includes("?") ? "&" : "?"}walkthrough=1`;
  }
  return base;
}

export function walkthroughPageHref(orgSlug: string, stepIndex: number): string {
  return `/${orgSlug}/walkthrough?step=${stepIndex}`;
}

export function clampStepIndex(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(WALKTHROUGH_STEPS.length - 1, Math.floor(n)));
}

export function getWalkthroughStep(index: number): WalkthroughStep {
  return WALKTHROUGH_STEPS[index] ?? WALKTHROUGH_STEPS[0]!;
}

/** Total guided tour duration in minutes (for demo launcher copy). */
export function walkthroughTotalMinutes(): number {
  return WALKTHROUGH_STEPS.reduce((sum, s) => sum + s.durationMin, 0);
}

/** Portfolio script duration (~15 min highlights only). */
export function portfolioWalkthroughMinutes(): number {
  return PORTFOLIO_WALKTHROUGH_STEPS.reduce((sum, s) => sum + s.durationMin, 0);
}
