/**
 * EventCore segment send — shared by staff actions and scheduled cron.
 */

import { getOrgDb } from "@/lib/db";
import { sendEmailWithFailover } from "@/lib/adapters/email";
import { resolveEventRecipients } from "@/lib/event-recipients";
import type { EventCorrespondenceSegment } from "@/lib/event-correspondence-types";
import { applyEventMerge, type EventMergeContext } from "@/lib/event-email-merge";

const ENGAGE_SEND_LIMIT = Number(process.env.ENGAGE_SEND_LIMIT ?? "50");

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
  const end = endsAt.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${start} – ${end}`;
}

async function loadMergeContext(
  orgId: string,
  orgSlug: string,
  eventId: string,
): Promise<EventMergeContext | null> {
  const db = getOrgDb(orgId);
  const event = await db.event.findFirst({
    where: { id: eventId },
    select: { title: true, startsAt: true, endsAt: true, publicSlug: true, description: true },
  });
  if (!event) return null;
  return {
    eventTitle: event.title,
    eventDate: formatEventDate(event.startsAt, event.endsAt),
    eventLocation: event.description.slice(0, 200) || undefined,
    registrationUrl: registrationUrl(orgSlug, event.publicSlug),
    firstName: "there",
    displayName: "there",
  };
}

export async function executeEventSegmentSend(params: {
  orgId: string;
  orgSlug: string;
  eventId: string;
  segment: EventCorrespondenceSegment;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}): Promise<
  | { ok: true; sent: number; attempted: number }
  | { ok: false; error: string }
> {
  const recipients = await resolveEventRecipients(
    params.orgId,
    params.eventId,
    params.segment,
  );
  if (recipients.length === 0) {
    return { ok: false, error: "No recipients in this segment" };
  }
  if (recipients.length > ENGAGE_SEND_LIMIT) {
    return {
      ok: false,
      error: `Segment has ${recipients.length} recipients; limit is ${ENGAGE_SEND_LIMIT}.`,
    };
  }

  const ctx = await loadMergeContext(params.orgId, params.orgSlug, params.eventId);
  if (!ctx) return { ok: false, error: "Event not found" };

  const subject = applyEventMerge(params.subject, ctx);
  const db = getOrgDb(params.orgId);
  const sendRunId = `${params.eventId}_${params.segment}_${Date.now()}`;
  let sent = 0;

  for (const r of recipients) {
    const personalCtx: EventMergeContext = {
      ...ctx,
      firstName: r.displayName.split(" ")[0] ?? "there",
      displayName: r.displayName,
    };
    const text = applyEventMerge(params.bodyText, personalCtx);
    const html = params.bodyHtml ? applyEventMerge(params.bodyHtml, personalCtx) : undefined;
    const result = await sendEmailWithFailover({
      to: r.email,
      subject,
      text,
      html,
      idempotencyKey: `event_${sendRunId}_${r.email}`,
    });
    await db.emailSendLog.create({
      data: {
        orgId: params.orgId,
        recipient: r.email,
        subject,
        adapterId: result.adapterId,
        result: result.status,
        providerId: result.providerMessageId,
      },
    });
    if (result.status === "sent") sent++;
  }

  return { ok: true, sent, attempted: recipients.length };
}
