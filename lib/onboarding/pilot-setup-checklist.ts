/**
 * Pilot setup checklist — first-run wedge for hospital association staff.
 *
 * Shows on org Home until MemberCore + Events wedge criteria are met:
 * members on file, staff invited, and at least one published event.
 */

import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export type PilotSetupSignals = {
  memberCount: number;
  staffCount: number;
  eventCount: number;
  publishedEventCount: number;
  pendingImportCount: number;
  confirmedRegistrationCount: number;
  draftEventId: string | null;
};

export type PilotSetupStep = {
  id: string;
  title: string;
  detail: string;
  href: string;
  done: boolean;
  required: boolean;
};

export type PilotSetupChecklist = {
  steps: PilotSetupStep[];
  completedRequired: number;
  requiredTotal: number;
  isWedgeReady: boolean;
  showChecklist: boolean;
};

/**
 * Load org signals used to render the pilot setup checklist.
 */
export async function loadPilotSetupSignals(orgId: string): Promise<PilotSetupSignals> {
  const db = getOrgDb(orgId);

  const [
    memberCount,
    staffCount,
    eventCount,
    publishedEventCount,
    pendingImportCount,
    confirmedRegistrationCount,
    draftEvent,
  ] = await Promise.all([
    db.member.count(),
    prisma.orgMembership.count({ where: { orgId } }),
    db.event.count(),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.memberImportBatch.count({ where: { status: "PENDING_REVIEW" } }),
    db.eventRegistration.count({ where: { status: "CONFIRMED" } }),
    db.event.findFirst({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    }),
  ]);

  return {
    memberCount,
    staffCount,
    eventCount,
    publishedEventCount,
    pendingImportCount,
    confirmedRegistrationCount,
    draftEventId: draftEvent?.id ?? null,
  };
}

/**
 * Build checklist steps from org signals (pure — unit tested).
 */
export function buildPilotSetupChecklist(
  orgSlug: string,
  signals: PilotSetupSignals,
): PilotSetupChecklist {
  const membersHref =
    signals.pendingImportCount > 0
      ? `/${orgSlug}/members/imports`
      : signals.memberCount === 0
        ? `/${orgSlug}/members/imports`
        : `/${orgSlug}/members`;

  const eventCreateHref =
    signals.eventCount === 0 ? `/${orgSlug}/events/new` : `/${orgSlug}/events`;

  const eventPublishHref = signals.draftEventId
    ? `/${orgSlug}/events/${signals.draftEventId}`
    : signals.publishedEventCount > 0
      ? `/${orgSlug}/events`
      : `/${orgSlug}/events/new`;

  const steps: PilotSetupStep[] = [
    {
      id: "members",
      title: "Members on file",
      detail:
        signals.pendingImportCount > 0
          ? `${signals.pendingImportCount} import batch awaiting review`
          : signals.memberCount > 0
            ? `${signals.memberCount} member${signals.memberCount === 1 ? "" : "s"} in directory`
            : "Import a roster or add your first member",
      href: membersHref,
      done: signals.memberCount > 0,
      required: true,
    },
    {
      id: "staff",
      title: "Invite staff",
      detail:
        signals.staffCount >= 2
          ? `${signals.staffCount} staff with org access`
          : "Add at least one colleague with staff access",
      href: `/${orgSlug}/settings/staff`,
      done: signals.staffCount >= 2,
      required: true,
    },
    {
      id: "event-create",
      title: "Create an event",
      detail:
        signals.eventCount > 0
          ? `${signals.eventCount} event${signals.eventCount === 1 ? "" : "s"} in EventCore`
          : "Set up your first conference, webinar, or meeting",
      href: eventCreateHref,
      done: signals.eventCount > 0,
      required: true,
    },
    {
      id: "event-publish",
      title: "Publish an event",
      detail:
        signals.publishedEventCount > 0
          ? `${signals.publishedEventCount} live for registration`
          : "Move a draft to Published so members can register",
      href: eventPublishHref,
      done: signals.publishedEventCount > 0,
      required: true,
    },
    {
      id: "registration-drill",
      title: "Confirm a registration",
      detail:
        signals.confirmedRegistrationCount > 0
          ? `${signals.confirmedRegistrationCount} confirmed — pilot drill complete`
          : "Run one test registration before go-live (recommended)",
      href: signals.publishedEventCount > 0 ? `/${orgSlug}/events` : eventPublishHref,
      done: signals.confirmedRegistrationCount > 0,
      required: false,
    },
  ];

  const required = steps.filter((s) => s.required);
  const completedRequired = required.filter((s) => s.done).length;
  const isWedgeReady = required.every((s) => s.done);

  return {
    steps,
    completedRequired,
    requiredTotal: required.length,
    isWedgeReady,
    showChecklist: !isWedgeReady,
  };
}

/**
 * Load checklist for an org overview page.
 */
export async function loadPilotSetupChecklist(orgId: string, orgSlug: string) {
  const signals = await loadPilotSetupSignals(orgId);
  return buildPilotSetupChecklist(orgSlug, signals);
}
