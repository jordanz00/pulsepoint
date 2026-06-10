/**
 * Executive Leadership Loop — scripted CEO briefing path for demo + pilot orgs.
 *
 * Each step deep-links to a live route with a live stat line (no invented numbers).
 */

export type LeadershipLoopStepStatus = "live" | "alpha";

export type LeadershipLoopStep = {
  id: string;
  order: number;
  title: string;
  module: string;
  path: string;
  status: LeadershipLoopStepStatus;
  durationMin: number;
  pitch: string;
  statLabel: string;
};

export type LeadershipLoopContext = {
  memberTotal: number;
  renewalsDue30: number;
  advocacyActive: number;
  courseCount: number;
  revenueMtdUsd: string;
  exceptionCount: number;
};

export const LEADERSHIP_LOOP_STEPS: LeadershipLoopStep[] = [
  {
    id: "command",
    order: 1,
    title: "Command center",
    module: "Executive",
    path: "/command-center",
    status: "live",
    durationMin: 2,
    pitch: "One-screen KPIs — membership, revenue MTD, review queue, advocacy, events.",
    statLabel: "Executive briefing",
  },
  {
    id: "membership",
    order: 2,
    title: "Membership health",
    module: "MemberCore",
    path: "/members/analytics",
    status: "live",
    durationMin: 3,
    pitch: "Engagement tiers, at-risk counts, renewal pressure — board-ready without Excel.",
    statLabel: "Active members",
  },
  {
    id: "advocacy",
    order: 3,
    title: "Advocacy story",
    module: "PulsePoint Advocacy",
    path: "/advocacy/issues/nursing-workforce",
    status: "alpha",
    durationMin: 3,
    pitch: "Policy narrative + take-action — government affairs on the same roster as membership.",
    statLabel: "Active issues",
  },
  {
    id: "workforce",
    order: 4,
    title: "Workforce & CE",
    module: "PulsePoint Learn",
    path: "/learn/workforce",
    status: "alpha",
    durationMin: 3,
    pitch: "Video library, career fair booths, CE transcript export — workforce on the member graph.",
    statLabel: "Courses in catalog",
  },
  {
    id: "renewals",
    order: 5,
    title: "Renewals pulse",
    module: "MemberCore",
    path: "/members/renewals",
    status: "alpha",
    durationMin: 2,
    pitch: "Due dates, tier cards, CSV export, cron gate status — finance-ready renewal ops.",
    statLabel: "Due in 30 days",
  },
  {
    id: "portal",
    order: 6,
    title: "Member self-service",
    module: "Portal",
    path: "/portal",
    status: "live",
    durationMin: 2,
    pitch: "Members download CE transcript, pay renewals, and view events — same roster staff manage.",
    statLabel: "Portal live",
  },
  {
    id: "board-pack",
    order: 7,
    title: "Board pack",
    module: "PulsePoint Insights",
    path: "/insights/board-pack",
    status: "alpha",
    durationMin: 3,
    pitch: "Printable board packet — KPIs, revenue trend, executive narrative. Close the meeting.",
    statLabel: "Revenue MTD",
  },
];

export function leadershipLoopStat(stepId: string, ctx: LeadershipLoopContext): string {
  switch (stepId) {
    case "command":
      return `${ctx.memberTotal.toLocaleString()} members · ${ctx.revenueMtdUsd} MTD`;
    case "membership":
      return `${ctx.memberTotal.toLocaleString()} active · ${ctx.renewalsDue30} renewals ≤30d`;
    case "advocacy":
      return `${ctx.advocacyActive} active issue${ctx.advocacyActive === 1 ? "" : "s"}`;
    case "workforce":
      return `${ctx.courseCount} course${ctx.courseCount === 1 ? "" : "s"} · CE alpha`;
    case "renewals":
      return `${ctx.renewalsDue30} due in 30 days`;
    case "portal":
      return `Self-service CE transcript · ${ctx.memberTotal} members on roster`;
    case "board-pack":
      return `${ctx.revenueMtdUsd} on record · export PDF`;
    default:
      return "Live data";
  }
}

export function leadershipLoopTotalMinutes(): number {
  return LEADERSHIP_LOOP_STEPS.reduce((sum, s) => sum + s.durationMin, 0);
}

export function leadershipLoopHref(orgSlug: string, path: string, guided = true): string {
  const base = `/${orgSlug}${path}`;
  return guided ? `${base}${base.includes("?") ? "&" : "?"}walkthrough=1` : base;
}
