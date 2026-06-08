/**
 * MemberPulse computation — dimensional engagement from real tenant activity.
 */

import { getOrgDb } from "@/lib/db";
import { tierFromScore, type EngagementTier } from "@/lib/engagement-score";
import {
  ADVOCACY_CHANNELS,
  BOARD_CHANNELS,
  COMMS_CHANNELS,
  MEMBER_PULSE_DIMENSION_META,
  SPEAKER_ROLE_WEIGHT,
} from "@/lib/member-pulse/constants";
import type {
  MemberPulseDimension,
  MemberPulseDimensionId,
  MemberPulseSnapshot,
} from "@/lib/member-pulse/types";
import { memberTagsArray } from "@/lib/member-tags";
import { memberHasOurBoard, memberHasCSuite } from "@/lib/member-roles";

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tier(score: number, daysUntilRenewal: number | null): EngagementTier {
  return tierFromScore(score, daysUntilRenewal);
}

function dim(
  id: MemberPulseDimensionId,
  score: number,
  daysUntilRenewal: number | null,
  metrics: MemberPulseDimension["metrics"],
  highlights: string[],
): MemberPulseDimension {
  const s = clampScore(score);
  return {
    id,
    label: MEMBER_PULSE_DIMENSION_META[id].label,
    score: s,
    tier: tier(s, daysUntilRenewal),
    summary: highlights[0] ?? "No recent signals",
    metrics,
    highlights,
  };
}

export async function computeMemberPulse(
  orgId: string,
  memberId: string,
): Promise<MemberPulseSnapshot | null> {
  const db = getOrgDb(orgId);

  const member = await db.member.findFirst({
    where: { id: memberId },
    include: {
      roles: { where: { isCurrent: true } },
      notes: { orderBy: { createdAt: "desc" }, take: 50 },
      registrations: {
        include: { event: { select: { title: true } } },
      },
      donations: { include: { campaign: { select: { name: true } } } },
      commerceOrders: true,
      courseEnrollments: true,
      ceCreditAwards: true,
      crmWorkflowRuns: {
        where: { status: "ACTIVE" },
        include: { workflow: { select: { kind: true, name: true } } },
      },
      relationshipsFrom: true,
      relationshipsTo: true,
      contactSources: true,
    },
  });

  if (!member) return null;

  const email = member.email?.toLowerCase() ?? null;
  const daysUntilRenewal = member.renewalDueAt
    ? Math.ceil((member.renewalDueAt.getTime() - Date.now()) / (86400000))
    : null;

  const [
    emailSends,
    sequenceEnrollments,
    eventSpeakers,
    deals,
    webForms,
  ] = await Promise.all([
    email
      ? db.emailSendLog.count({ where: { orgId, recipient: email } })
      : Promise.resolve(0),
    db.emailSequenceEnrollment.count({
      where: { memberId, status: "ACTIVE" },
    }),
    db.eventSpeaker.findMany({
      where: { orgId, memberId },
      include: { event: { select: { title: true } } },
    }),
    db.deal.count({ where: { memberId } }),
    db.webFormSubmission.count({ where: { memberId } }),
  ]);

  const tags = memberTagsArray(member.tags);
  const tagBlob = tags.join(" ").toLowerCase();

  // ── Events ──
  const regs = member.registrations;
  const checkedIn = regs.filter((r) => r.checkedInAt).length;
  const paidRegs = regs.filter((r) => r.paidAt).length;
  let eventsScore =
    Math.min(regs.length * 12, 45) +
    Math.min(checkedIn * 15, 30) +
    Math.min(paidRegs * 5, 10);

  const speakerHighlights: string[] = [];
  for (const sp of eventSpeakers) {
    eventsScore += SPEAKER_ROLE_WEIGHT[sp.role] ?? 15;
    const roleLabel = sp.role === "PANELIST" ? "Panelist" : sp.role.charAt(0) + sp.role.slice(1).toLowerCase();
    speakerHighlights.push(`${roleLabel} at ${sp.event.title}`);
  }
  if (regs.length > 0 && speakerHighlights.length === 0) {
    speakerHighlights.push(`${checkedIn} of ${regs.length} registrations checked in`);
  }

  const eventsDim = dim(
    "events",
    eventsScore,
    daysUntilRenewal,
    [
      { key: "registrations", label: "Registrations", value: regs.length },
      { key: "checked_in", label: "Check-ins", value: checkedIn },
      { key: "speaking", label: "Speaking roles", value: eventSpeakers.length },
      { key: "paid", label: "Paid events", value: paidRegs },
    ],
    speakerHighlights.length ? speakerHighlights : ["No event participation yet"],
  );

  // ── Board ──
  const boardRoles = member.roles.filter(
    (r) => r.category === "BOARD" || r.category === "EXECUTIVE" || r.category === "COMMITTEE",
  );
  const ourBoard = memberHasOurBoard(member.roles);
  const cSuite = memberHasCSuite(member.roles);
  const boardWorkflows = member.crmWorkflowRuns.filter((w) => w.workflow.kind === "BOARD_OUTREACH");

  let boardScore = 0;
  if (ourBoard) boardScore += 35;
  if (cSuite) boardScore += 25;
  boardScore += Math.min(boardRoles.length * 10, 25);
  boardScore += Math.min(boardWorkflows.length * 15, 15);
  const peerLinks =
    member.relationshipsFrom.filter((r) => r.relationType === "BOARD_PEER").length +
    member.relationshipsTo.filter((r) => r.relationType === "BOARD_PEER").length;
  boardScore += Math.min(peerLinks * 8, 16);

  const boardHighlights: string[] = [];
  if (ourBoard) boardHighlights.push("Current board role with this association");
  if (cSuite) boardHighlights.push("C-suite leadership role on file");
  for (const sp of eventSpeakers.filter((s) => s.role === "MODERATOR" || s.role === "PANELIST")) {
    boardHighlights.push(`Program leadership: ${sp.event.title}`);
  }

  const boardDim = dim(
    "board",
    boardScore,
    daysUntilRenewal,
    [
      { key: "governance_roles", label: "Governance roles", value: boardRoles.length },
      { key: "board_workflows", label: "Board workflows", value: boardWorkflows.length },
      { key: "peer_links", label: "Board peer links", value: peerLinks },
    ],
    boardHighlights.length ? boardHighlights : ["No board or executive signals"],
  );

  // ── Comms ──
  const commsNotes = member.notes.filter(
    (n) => n.channel && COMMS_CHANNELS.has(n.channel) && !ADVOCACY_CHANNELS.has(n.channel) && !BOARD_CHANNELS.has(n.channel),
  );
  const emailSources = member.contactSources.filter(
    (s) => s.sourceKind === "EMAIL_CAPTURE" || s.sourceKind === "WEB_CAPTURE",
  );

  let commsScore =
    Math.min(emailSends * 8, 35) +
    Math.min(commsNotes.length * 10, 30) +
    Math.min(sequenceEnrollments * 12, 24) +
    (emailSources.length > 0 ? 8 : 0);

  const commsDim = dim(
    "comms",
    commsScore,
    daysUntilRenewal,
    [
      { key: "email_sends", label: "Emails received", value: emailSends },
      { key: "comms_notes", label: "Comms touchpoints", value: commsNotes.length },
      { key: "sequences", label: "Active sequences", value: sequenceEnrollments },
    ],
    commsNotes.length || emailSends
      ? [`${emailSends} emails · ${commsNotes.length} logged comms touches`]
      : ["Limited comms engagement"],
  );

  // ── Advocacy ──
  const advocacyNotes = member.notes.filter(
    (n) => n.channel && ADVOCACY_CHANNELS.has(n.channel),
  );
  const advocacyCampaignGifts = member.donations.filter((d) =>
    /advocacy|policy|grassroots|340b|legislative/i.test(d.campaign.name),
  ).length;

  let advocacyScore =
    Math.min(advocacyNotes.length * 14, 35) +
    Math.min(deals * 18, 36) +
    Math.min(advocacyCampaignGifts * 12, 24) +
    (tagBlob.includes("advocacy") || tagBlob.includes("policy") ? 10 : 0) +
    Math.min(webForms * 8, 16);

  const advocacyDim = dim(
    "advocacy",
    advocacyScore,
    daysUntilRenewal,
    [
      { key: "advocacy_notes", label: "Advocacy notes", value: advocacyNotes.length },
      { key: "deals", label: "Related partnerships", value: deals },
      { key: "policy_gifts", label: "Policy campaigns", value: advocacyCampaignGifts },
      { key: "web_forms", label: "Form submissions", value: webForms },
    ],
    advocacyNotes.length || deals
      ? [`${advocacyNotes.length} advocacy touches · ${deals} pipeline opportunities`]
      : ["No advocacy signals yet"],
  );

  // ── Association (rollup + membership health) ──
  const dimScores = [eventsDim, boardDim, commsDim, advocacyDim];
  let associationScore =
    dimScores.reduce((s, d) => s + d.score, 0) / dimScores.length;

  associationScore += member.courseEnrollments.length * 3;
  associationScore += member.ceCreditAwards.reduce((s, a) => s + a.amount, 0) * 2;
  associationScore += Math.min(member.commerceOrders.length * 5, 15);
  associationScore += Math.min(member.donations.length * 6, 18);

  if (member.status === "LAPSED" || member.status === "INACTIVE") {
    associationScore *= 0.35;
  } else if (member.status === "ACTIVE") {
    associationScore += 5;
  }
  if (daysUntilRenewal !== null && daysUntilRenewal <= 30 && daysUntilRenewal >= 0) {
    associationScore -= 8;
  }

  const associationDim = dim(
    "association",
    associationScore,
    daysUntilRenewal,
    [
      { key: "learn", label: "Course activity", value: member.courseEnrollments.length },
      { key: "ce", label: "CE credits", value: member.ceCreditAwards.reduce((s, a) => s + a.amount, 0) },
      { key: "commerce", label: "Orders", value: member.commerceOrders.length },
      { key: "giving", label: "Gifts", value: member.donations.length },
    ],
    [`Holistic score across events, board, comms, and advocacy`],
  );

  const dimensions = [associationDim, commsDim, advocacyDim, boardDim, eventsDim];
  const overall = clampScore(associationDim.score);

  return {
    overall,
    overallTier: tier(overall, daysUntilRenewal),
    dimensions,
    computedAt: new Date().toISOString(),
  };
}

export function parseMemberPulseSnapshot(json: unknown): MemberPulseSnapshot | null {
  if (!json || typeof json !== "object") return null;
  const o = json as MemberPulseSnapshot;
  if (typeof o.overall !== "number" || !Array.isArray(o.dimensions)) return null;
  return o;
}
