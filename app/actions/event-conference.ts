"use server";

/**
 * Event conference — speakers, sponsors, sessions (alpha).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const speakerSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().max(120).optional(),
  organization: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  role: z.enum(["KEYNOTE", "SPEAKER", "PANELIST", "MODERATOR"]).optional(),
});

const sponsorSchema = z.object({
  name: z.string().min(1).max(120),
  tier: z.string().max(40).optional(),
  boothNumber: z.string().max(40).optional(),
  websiteUrl: z.string().max(500).optional(),
  amountCents: z.number().int().min(0).optional(),
});

const sessionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  room: z.string().max(80).optional(),
  track: z.string().max(80).optional(),
});

export async function addEventSpeaker(
  orgSlug: string,
  eventId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = speakerSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid speaker" };
    const db = getOrgDb(staff.orgId);
    const count = await db.eventSpeaker.count({ where: { eventId } });
    await db.eventSpeaker.create({
      data: {
        orgId: staff.orgId,
        eventId,
        name: parsed.data.name,
        title: parsed.data.title ?? "",
        organizationName: parsed.data.organization ?? "",
        bio: parsed.data.bio ?? "",
        role: parsed.data.role ?? "SPEAKER",
        sortOrder: count,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addEventSponsor(
  orgSlug: string,
  eventId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = sponsorSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid sponsor" };
    const db = getOrgDb(staff.orgId);
    const count = await db.eventSponsor.count({ where: { eventId } });
    await db.eventSponsor.create({
      data: {
        orgId: staff.orgId,
        eventId,
        name: parsed.data.name,
        tier: parsed.data.tier ?? "Gold",
        boothNumber: parsed.data.boothNumber ?? "",
        websiteUrl: parsed.data.websiteUrl ?? "",
        amountCents: parsed.data.amountCents ?? 0,
        sortOrder: count,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addEventSession(
  orgSlug: string,
  eventId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = sessionSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid session" };
    const db = getOrgDb(staff.orgId);
    const count = await db.eventSession.count({ where: { eventId } });
    await db.eventSession.create({
      data: {
        orgId: staff.orgId,
        eventId,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        startsAt: new Date(parsed.data.startsAt),
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
        room: parsed.data.room ?? "",
        track: parsed.data.track ?? "",
        sortOrder: count,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateEventMicrosite(
  orgSlug: string,
  eventId: string,
  config: { headline?: string; accent?: string; showSpeakers?: boolean; showSponsors?: boolean },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.event.update({
      where: { id: eventId },
      data: { micrositeConfig: config },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    revalidatePath(`/${orgSlug}/e`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
