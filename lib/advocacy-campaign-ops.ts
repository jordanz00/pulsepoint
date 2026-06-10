/**
 * Advocacy campaign lifecycle — derived status, workflow steps, operator briefing.
 * Uses real org DB fields only (no fabricated metrics).
 */

export type AdvocacyCampaignLifecycle =
  | "draft"
  | "live"
  | "collecting"
  | "goal_met"
  | "paused"
  | "closed";

export type AdvocacyCampaignRecord = {
  id: string;
  name: string;
  isActive: boolean;
  audienceId: string | null;
  responseCount: number;
  targetCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  issue?: { title: string; billNumber: string | null; status: string } | null;
};

export const LIFECYCLE_META: Record<
  AdvocacyCampaignLifecycle,
  { label: string; tone: "neutral" | "active" | "success" | "watch" | "muted" }
> = {
  draft: { label: "Draft", tone: "neutral" },
  live: { label: "Live", tone: "active" },
  collecting: { label: "Collecting", tone: "active" },
  goal_met: { label: "Goal met", tone: "success" },
  paused: { label: "Paused", tone: "watch" },
  closed: { label: "Closed", tone: "muted" },
};

export function deriveAdvocacyCampaignLifecycle(
  campaign: Pick<
    AdvocacyCampaignRecord,
    "isActive" | "audienceId" | "responseCount" | "targetCount" | "endsAt"
  >,
  now: Date = new Date(),
): AdvocacyCampaignLifecycle {
  if (campaign.endsAt && campaign.endsAt < now) return "closed";
  if (!campaign.isActive) return "paused";
  if (!campaign.audienceId) return "draft";
  const target = campaign.targetCount;
  if (target > 0 && campaign.responseCount >= target) return "goal_met";
  if (campaign.responseCount > 0) return "collecting";
  return "live";
}

export function participationPct(responseCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.min(100, Math.round((responseCount / targetCount) * 100));
}

export type AdvocacyWorkflowStep = {
  id: string;
  label: string;
  detail: string;
  complete: boolean;
  current: boolean;
};

/** Visible state machine for campaign detail. */
export function buildAdvocacyCampaignWorkflowSteps(
  campaign: AdvocacyCampaignRecord,
  now: Date = new Date(),
): AdvocacyWorkflowStep[] {
  const lifecycle = deriveAdvocacyCampaignLifecycle(campaign, now);
  const launched = Boolean(campaign.audienceId);
  const hasResponses = campaign.responseCount > 0;
  const goalMet =
    campaign.targetCount > 0 && campaign.responseCount >= campaign.targetCount;

  const steps: AdvocacyWorkflowStep[] = [
    {
      id: "create",
      label: "Campaign created",
      detail: "Issue linked · hospital target set from roster",
      complete: true,
      current: lifecycle === "draft",
    },
    {
      id: "launch",
      label: "Take-action launched",
      detail: launched
        ? "Engage audience wired · public form available"
        : "Launch to create Engage audience and public link",
      complete: launched,
      current: lifecycle === "draft" || lifecycle === "live",
    },
    {
      id: "collect",
      label: "Collecting responses",
      detail: hasResponses
        ? `${campaign.responseCount} hospital response${campaign.responseCount === 1 ? "" : "s"} recorded`
        : "Awaiting hospital sign-on via public form or staff entry",
      complete: hasResponses,
      current: lifecycle === "collecting",
    },
    {
      id: "goal",
      label: "Participation goal",
      detail: goalMet
        ? "Target reached — ready to close or export"
        : campaign.targetCount > 0
          ? `${participationPct(campaign.responseCount, campaign.targetCount)}% of ${campaign.targetCount} hospitals`
          : "Set roster target to track completion",
      complete: goalMet || lifecycle === "closed",
      current: lifecycle === "goal_met",
    },
  ];

  if (lifecycle === "paused" || lifecycle === "closed") {
    steps.push({
      id: "archive",
      label: lifecycle === "closed" ? "Campaign closed" : "Campaign paused",
      detail:
        lifecycle === "closed"
          ? "No further responses accepted"
          : "Resume when ready to continue outreach",
      complete: lifecycle === "closed",
      current: true,
    });
  }

  return steps;
}

export type AdvocacyCampaignOpsCard = {
  id: string;
  question: string;
  answer: string;
  tone?: "neutral" | "attention" | "clear";
};

/** Five-question operator brief for a single campaign. */
export function buildAdvocacyCampaignOpsCards(
  campaign: AdvocacyCampaignRecord,
  recentResponseCount: number,
): AdvocacyCampaignOpsCard[] {
  const lifecycle = deriveAdvocacyCampaignLifecycle(campaign);
  const pct = participationPct(campaign.responseCount, campaign.targetCount);
  const issueLabel = campaign.issue?.title ?? "No linked issue";

  const attention: string[] = [];
  if (lifecycle === "draft") attention.push("Take-action not launched");
  if (lifecycle === "live" && campaign.responseCount === 0) {
    attention.push("No hospital responses yet");
  }
  if (lifecycle === "paused") attention.push("Campaign paused");

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${campaign.name} · ${LIFECYCLE_META[lifecycle].label} · ${issueLabel}`,
      tone: "neutral",
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        attention.length > 0
          ? attention.join(" · ")
          : lifecycle === "goal_met"
            ? "Goal met — confirm export with government affairs"
            : "On track — monitor response pace",
      tone: attention.length > 0 ? "attention" : "clear",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        lifecycle === "draft"
          ? "Outreach blocked until take-action launch creates Engage audience"
          : lifecycle === "paused"
            ? "Paused — resume to accept new responses"
            : "No workflow blocks",
      tone: lifecycle === "draft" || lifecycle === "paused" ? "attention" : "clear",
    },
    {
      id: "changed",
      question: "What changed?",
      answer:
        recentResponseCount > 0
          ? `${recentResponseCount} new response${recentResponseCount === 1 ? "" : "s"} in the last 7 days`
          : "No new responses in the last 7 days",
      tone: "neutral",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer:
        lifecycle === "draft"
          ? "Launch take-action · copy public link for hospital CEOs"
          : lifecycle === "live" || lifecycle === "collecting"
            ? `Drive to ${campaign.targetCount > 0 ? `${pct}% → 100%` : "first hospital response"} · send Engage follow-up`
            : lifecycle === "goal_met"
              ? "Close campaign · brief leadership · archive for audit"
              : "Review campaign status with government affairs staff",
      tone: "neutral",
    },
  ];
}
