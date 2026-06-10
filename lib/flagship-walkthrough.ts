/**
 * Flagship 5 sales walkthrough — five-stop scripted demo (~12–15 min).
 */

import { FLAGSHIP_FEATURES } from "@/lib/flagship-features";
import { resolveFlagshipPath } from "@/lib/flagship-features";

export type FlagshipWalkthroughStatus = "live" | "alpha" | "demo";

export type FlagshipWalkthroughStep = {
  id: string;
  index: number;
  title: string;
  module: string;
  hubPath: string;
  demoPath: string;
  status: FlagshipWalkthroughStatus;
  durationMin: number;
  talkTrack: string;
  show: string[];
};

const STEPS_RAW: Omit<FlagshipWalkthroughStep, "index">[] = [
  {
    id: "executive-command",
    title: "Executive Command Center",
    module: "Executive",
    hubPath: "/flagship/executive",
    demoPath: "/command-center",
    status: "live",
    durationMin: 3,
    talkTrack:
      "One screen for leadership — membership trend, revenue MTD, review queue, and domain panels. The embedded leadership loop scripts a 15-minute CEO path.",
    show: ["Four executive KPIs", "Revenue charts", "Leadership loop preview"],
  },
  {
    id: "membership-intelligence",
    title: "Membership Intelligence",
    module: "MemberCore",
    hubPath: "/flagship/membership",
    demoPath: "/members/analytics",
    status: "demo",
    durationMin: 3,
    talkTrack:
      "Board-ready analytics and MemberPulse engagement tiers from the same roster that feeds advocacy and events. Demo preview — rule-based, not ML.",
    show: ["At-risk panel", "Renewal pipeline", "Tier distribution"],
  },
  {
    id: "advocacy-one-roster",
    title: "Advocacy on One Roster",
    module: "PulsePoint Advocacy",
    hubPath: "/flagship/advocacy",
    demoPath: "/enterprise/advocacy",
    status: "alpha",
    durationMin: 3,
    talkTrack:
      "Hospital accounts on MemberCore drive grassroots KPIs — staff issue hub, public take-action pages, and roster linkage stats in one story.",
    show: ["Hospital roster KPIs", "Issue hub", "Public take-action"],
  },
  {
    id: "board-briefing-pack",
    title: "Board Briefing Pack",
    module: "PulsePoint Insights",
    hubPath: "/flagship/board",
    demoPath: "/insights/board-pack",
    status: "demo",
    durationMin: 2,
    talkTrack:
      "Printable HTML board packet from tenant KPIs — pair with the leadership loop close after the board reviews numbers.",
    show: ["Print export", "KPI widget board", "Leadership loop close"],
  },
  {
    id: "migration-honest",
    title: "Migration Without Rip-and-Replace",
    module: "MemberCore",
    hubPath: "/flagship/migration",
    demoPath: "/members/imports",
    status: "demo",
    durationMin: 3,
    talkTrack:
      "CSV import staging with duplicate review — plus an honest Protech comparison matrix. No false parity or invented pricing.",
    show: ["Upload → map → apply", "Compare matrix", "Live / Alpha labels"],
  },
];

export const FLAGSHIP_WALKTHROUGH_STEPS: FlagshipWalkthroughStep[] = STEPS_RAW.map((s, index) => ({
  ...s,
  index,
}));

export function flagshipWalkthroughTotalMinutes(): number {
  return FLAGSHIP_WALKTHROUGH_STEPS.reduce((sum, s) => sum + s.durationMin, 0);
}

export function flagshipWalkthroughPageHref(orgSlug: string, stepIndex: number): string {
  return `/${orgSlug}/flagship/walkthrough?step=${stepIndex}`;
}

export function flagshipWalkthroughDemoHref(orgSlug: string, step: FlagshipWalkthroughStep): string {
  return resolveFlagshipPath(orgSlug, step.demoPath);
}

export function flagshipWalkthroughHubHref(orgSlug: string, step: FlagshipWalkthroughStep): string {
  return resolveFlagshipPath(orgSlug, step.hubPath);
}

export function clampFlagshipStepIndex(raw: string | string[] | undefined): number {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(FLAGSHIP_WALKTHROUGH_STEPS.length - 1, Math.floor(n)));
}

export function getFlagshipWalkthroughStep(index: number): FlagshipWalkthroughStep {
  return FLAGSHIP_WALKTHROUGH_STEPS[index] ?? FLAGSHIP_WALKTHROUGH_STEPS[0]!;
}

/** Verify registry ids align with walkthrough steps. */
export function flagshipWalkthroughRegistryAligned(): boolean {
  const registryIds = new Set(FLAGSHIP_FEATURES.map((f) => f.id));
  return FLAGSHIP_WALKTHROUGH_STEPS.every((s) => registryIds.has(s.id));
}
