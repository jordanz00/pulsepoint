"use server";

/**
 * EventCore advanced — surveys, session RSVP, scheduled email, refunds, assets, badges, EasyDNN.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb, prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { publishEventToEasyDnn } from "@/lib/integrations/easydnn-publish";
import { generateBadgeCode } from "@/lib/event-badge";
import {
  DEFAULT_SURVEY_QUESTIONS,
  parseSurveyQuestions,
  type SurveyQuestion,
} from "@/lib/event-survey-types";
import { EVENT_CORRESPONDENCE_SEGMENTS } from "@/lib/event-correspondence-types";

const assetSchema = z.object({
  kind: z.enum(["LOGO", "BANNER", "SPONSOR", "BADGE", "GENERAL"]),
  label: z.string().max(120).optional(),
  url: z.string().url().max(2000),
  altText: z.string().max(200).optional(),
});

const scheduleSchema = z.object({
  name: z.string().min(1).max(120),
  segment: z
    .string()
    .refine((s) =>
      (EVENT_CORRESPONDENCE_SEGMENTS as readonly string[]).includes(s),
    ),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(10_000),
  sendAt: z.coerce.date(),
});

const refundSchema = z.object({
  registrationId: z.string().cuid(),
  action: z.enum(["request", "approve", "complete", "deny"]),
  amountCents: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

// ── Surveys ─────────────────────────────────────────────────────────────────

export async function upsertEventSurvey(
  orgSlug: string,
  eventId: string,
  raw: { title?: string; active?: boolean; questions?: SurveyQuestion[]; opensAt?: string; closesAt?: string },
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const questions = raw.questions ?? DEFAULT_SURVEY_QUESTIONS;
    await db.eventSurvey.upsert({
      where: { eventId },
      create: {
        orgId: staff.orgId,
        eventId,
        title: raw.title ?? "Post-event feedback",
        active: raw.active ?? false,
        questions,
        opensAt: raw.opensAt ? new Date(raw.opensAt) : null,
        closesAt: raw.closesAt ? new Date(raw.closesAt) : null,
      },
      update: {
        title: raw.title,
        active: raw.active,
        questions: raw.questions ? questions : undefined,
        opensAt: raw.opensAt !== undefined ? (raw.opensAt ? new Date(raw.opensAt) : null) : undefined,
        closesAt: raw.closesAt !== undefined ? (raw.closesAt ? new Date(raw.closesAt) : null) : undefined,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Survey save failed" };
  }
}

// ── Session RSVP (staff assign) ─────────────────────────────────────────────

export async function toggleSessionRsvp(
  orgSlug: string,
  sessionId: string,
  registrationId: string,
  enroll: boolean,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const session = await db.eventSession.findFirst({ where: { id: sessionId } });
    if (!session) return { ok: false as const, error: "Session not found" };

    if (enroll) {
      await db.eventSessionRegistration.upsert({
        where: { sessionId_registrationId: { sessionId, registrationId } },
        create: {
          orgId: staff.orgId,
          eventId: session.eventId,
          sessionId,
          registrationId,
        },
        update: {},
      });
    } else {
      await db.eventSessionRegistration.deleteMany({
        where: { sessionId, registrationId },
      });
    }
    revalidatePath(`/${orgSlug}/events/${session.eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Session RSVP failed" };
  }
}

// ── Scheduled emails ────────────────────────────────────────────────────────

export async function createEventScheduledEmail(
  orgSlug: string,
  eventId: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = scheduleSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid schedule" };
    const db = getOrgDb(staff.orgId);
    await db.eventScheduledEmail.create({
      data: {
        orgId: staff.orgId,
        eventId,
        name: parsed.data.name,
        segment: parsed.data.segment,
        subject: parsed.data.subject,
        bodyText: parsed.data.bodyText,
        sendAt: parsed.data.sendAt,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not schedule" };
  }
}

export async function cancelEventScheduledEmail(
  orgSlug: string,
  id: string,
  eventId: string,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.eventScheduledEmail.updateMany({
      where: { id, orgId: staff.orgId, status: "SCHEDULED" },
      data: { status: "CANCELLED" },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Cancel failed" };
  }
}

// ── Refunds ─────────────────────────────────────────────────────────────────

export async function processEventRefund(orgSlug: string, raw: unknown) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = refundSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid refund" };
    const db = getOrgDb(staff.orgId);
    const reg = await db.eventRegistration.findFirst({
      where: { id: parsed.data.registrationId },
      include: { ticketType: true, event: true },
    });
    if (!reg) return { ok: false as const, error: "Registration not found" };

    const statusMap = {
      request: "REQUESTED",
      approve: "APPROVED",
      complete: "COMPLETED",
      deny: "DENIED",
    } as const;
    const next = statusMap[parsed.data.action];
    const amount =
      parsed.data.amountCents ??
      reg.ticketType?.priceCents ??
      reg.event.priceCents;

    await db.eventRegistration.update({
      where: { id: reg.id },
      data: {
        refundStatus: next,
        refundAmountCents: next === "COMPLETED" ? amount : reg.refundAmountCents ?? amount,
        refundNotes: parsed.data.notes ?? reg.refundNotes,
        refundedAt: next === "COMPLETED" ? new Date() : reg.refundedAt,
        status: next === "COMPLETED" ? "CANCELLED" : reg.status,
        cancelledAt: next === "COMPLETED" ? new Date() : reg.cancelledAt,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: `eventcore.refund.${parsed.data.action}`,
      entity: "EventRegistration",
      entityId: reg.id,
      diff: { refundStatus: next, amountCents: amount },
    });

    revalidatePath(`/${orgSlug}/events/${reg.eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Refund update failed" };
  }
}

// ── Assets ──────────────────────────────────────────────────────────────────

export async function addEventAsset(orgSlug: string, eventId: string, raw: unknown) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = assetSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid asset" };
    const db = getOrgDb(staff.orgId);
    const count = await db.eventAsset.count({ where: { eventId } });
    await db.eventAsset.create({
      data: {
        orgId: staff.orgId,
        eventId,
        kind: parsed.data.kind,
        label: parsed.data.label ?? "",
        url: parsed.data.url,
        altText: parsed.data.altText ?? "",
        sortOrder: count,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Asset add failed" };
  }
}

export async function deleteEventAsset(orgSlug: string, assetId: string, eventId: string) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.eventAsset.deleteMany({ where: { id: assetId, orgId: staff.orgId } });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Delete failed" };
  }
}

// ── Badges ──────────────────────────────────────────────────────────────────

export async function ensureEventBadgeCodes(orgSlug: string, eventId: string) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const regs = await db.eventRegistration.findMany({
      where: { eventId, status: { in: ["CONFIRMED", "PENDING"] }, badgeCode: null },
      take: 500,
    });
    for (const r of regs) {
      await db.eventRegistration.update({
        where: { id: r.id },
        data: { badgeCode: generateBadgeCode(r.id) },
      });
    }
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const, count: regs.length };
  } catch {
    return { ok: false as const, error: "Badge codes failed" };
  }
}

// ── EasyDNN export ────────────────────────────────────────────────────────────

export async function buildEventEasyDnnExport(orgSlug: string, eventId: string) {
  try {
    const staff = await requireCapability("event:read", { orgSlug });
    const org = await prisma.organization.findUnique({ where: { id: staff.orgId } });
    if (!org) return { ok: false as const, error: "Event not found" };

    const bundle = await publishEventToEasyDnn(staff.orgId, orgSlug, org.name, eventId);

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.easydnn.export",
      entity: "Event",
      entityId: eventId,
    });

    return { ok: true as const, bundle };
  } catch {
    return { ok: false as const, error: "Export failed" };
  }
}

export async function loadEventSurveyForAdmin(orgSlug: string, eventId: string) {
  const staff = await requireCapability("event:read", { orgSlug });
  const db = getOrgDb(staff.orgId);
  const survey = await db.eventSurvey.findFirst({
    where: { eventId },
    include: { _count: { select: { responses: true } } },
  });
  if (!survey) {
    return {
      ok: true as const,
      survey: null,
    };
  }
  return {
    ok: true as const,
    survey: {
      id: survey.id,
      title: survey.title,
      active: survey.active,
      questions: parseSurveyQuestions(survey.questions),
      opensAt: survey.opensAt?.toISOString() ?? null,
      closesAt: survey.closesAt?.toISOString() ?? null,
      responseCount: survey._count.responses,
    },
  };
}
