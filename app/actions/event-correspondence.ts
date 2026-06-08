"use server";

/**
 * EventCore correspondence — per-registrant and segment bulk email.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { resolveEventRecipients } from "@/lib/event-recipients";
import { executeEventSegmentSend } from "@/lib/event-send-executor";
import type { EventCorrespondenceSegment } from "@/lib/event-correspondence-types";
import { applyEventMerge, type EventMergeContext } from "@/lib/event-email-merge";

const ENGAGE_SEND_LIMIT = Number(process.env.ENGAGE_SEND_LIMIT ?? "50");

const segmentSchema = z.enum([
  "all_registered",
  "confirmed",
  "pending",
  "waitlist",
  "checked_in",
  "not_checked_in",
  "invite_prospects",
]);

const sendSegmentSchema = z.object({
  eventId: z.string().cuid(),
  segment: segmentSchema,
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(10_000),
  bodyHtml: z.string().max(40_000).optional(),
});

const sendOneSchema = z.object({
  eventId: z.string().cuid(),
  registrationId: z.string().cuid().optional(),
  memberId: z.string().cuid().optional(),
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(10_000),
  bodyHtml: z.string().max(40_000).optional(),
  displayName: z.string().max(120).optional(),
});

function registrationUrl(orgSlug: string, publicSlug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/${orgSlug}/e/${publicSlug}`;
}

function formatEventDate(startsAt: Date, endsAt: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const start = startsAt.toLocaleString(undefined, opts);
  if (!endsAt) return start;
  const end = endsAt.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${start} – ${end}`;
}

async function loadMergeContext(
  orgId: string,
  orgSlug: string,
  eventId: string,
  firstName?: string,
  displayName?: string,
): Promise<EventMergeContext | null> {
  const db = getOrgDb(orgId);
  const event = await db.event.findFirst({
    where: { id: eventId },
    select: {
      title: true,
      startsAt: true,
      endsAt: true,
      publicSlug: true,
      description: true,
    },
  });
  if (!event) return null;
  return {
    eventTitle: event.title,
    eventDate: formatEventDate(event.startsAt, event.endsAt),
    eventLocation: event.description.slice(0, 200) || undefined,
    registrationUrl: registrationUrl(orgSlug, event.publicSlug),
    firstName: firstName ?? "there",
    displayName: displayName ?? firstName ?? "there",
  };
}

export async function getEventSegmentCounts(orgSlug: string, eventId: string) {
  try {
    const staff = await requireCapability("event:read", { orgSlug });
    const segments = [
      "all_registered",
      "confirmed",
      "pending",
      "waitlist",
      "checked_in",
      "not_checked_in",
      "invite_prospects",
    ] as const;
    const counts: Record<EventCorrespondenceSegment, number> = {} as Record<
      EventCorrespondenceSegment,
      number
    >;
    for (const seg of segments) {
      const list = await resolveEventRecipients(staff.orgId, eventId, seg);
      counts[seg] = list.length;
    }
    return { ok: true as const, counts };
  } catch {
    return { ok: false as const, error: "Unauthorized" };
  }
}

export async function sendEventCorrespondenceToSegment(
  orgSlug: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = sendSegmentSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid send request" };

    const result = await executeEventSegmentSend({
      orgId: staff.orgId,
      orgSlug,
      eventId: parsed.data.eventId,
      segment: parsed.data.segment,
      subject: parsed.data.subject,
      bodyText: parsed.data.bodyText,
      bodyHtml: parsed.data.bodyHtml,
    });
    if (!result.ok) return { ok: false as const, error: result.error };

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.correspondence.segment",
      entity: "Event",
      entityId: parsed.data.eventId,
      diff: {
        segment: parsed.data.segment,
        sent: result.sent,
        attempted: result.attempted,
      },
    });

    revalidatePath(`/${orgSlug}/events/${parsed.data.eventId}`);
    return { ok: true as const, sent: result.sent, attempted: result.attempted };
  } catch {
    return { ok: false as const, error: "Send failed" };
  }
}

export async function sendEventCorrespondenceToOne(
  orgSlug: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = sendOneSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid send request" };

    const ctx = await loadMergeContext(
      staff.orgId,
      orgSlug,
      parsed.data.eventId,
      parsed.data.displayName?.split(" ")[0],
      parsed.data.displayName,
    );
    if (!ctx) return { ok: false as const, error: "Event not found" };

    const subject = applyEventMerge(parsed.data.subject, ctx);
    const text = applyEventMerge(parsed.data.bodyText, ctx);
    const html = parsed.data.bodyHtml
      ? applyEventMerge(parsed.data.bodyHtml, ctx)
      : undefined;

    const result = await sendEmailWithFailover({
      to: parsed.data.email,
      subject,
      text,
      html,
      idempotencyKey: `event_${parsed.data.eventId}_one_${parsed.data.email}`,
    });

    const db = getOrgDb(staff.orgId);
    await db.emailSendLog.create({
      data: {
        orgId: staff.orgId,
        recipient: parsed.data.email,
        subject,
        adapterId: result.adapterId,
        result: result.status,
        providerId: result.providerMessageId,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.correspondence.one",
      entity: "Event",
      entityId: parsed.data.eventId,
      diff: {
        registrationId: parsed.data.registrationId,
        memberId: parsed.data.memberId,
        result: result.status,
      },
    });

    revalidatePath(`/${orgSlug}/events/${parsed.data.eventId}`);
    return {
      ok: true as const,
      status: result.status,
    };
  } catch {
    return { ok: false as const, error: "Send failed" };
  }
}
