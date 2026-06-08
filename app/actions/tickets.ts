"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const ticketSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  priceCents: z.number().int().min(0),
  capacity: z.number().int().min(1).optional(),
});

export async function addEventTicketType(
  orgSlug: string,
  eventId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = ticketSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid ticket" };
    const db = getOrgDb(staff.orgId);
    const count = await db.eventTicketType.count({ where: { eventId } });
    await db.eventTicketType.create({
      data: {
        orgId: staff.orgId,
        eventId,
        name: parsed.data.name,
        description: parsed.data.description ?? "",
        priceCents: parsed.data.priceCents,
        capacity: parsed.data.capacity ?? null,
        sortOrder: count,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    revalidatePath(`/${orgSlug}/e`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function updateEventMicrositeBranding(
  orgSlug: string,
  eventId: string,
  config: {
    headline?: string;
    accent?: string;
    heroImage?: string;
    showSpeakers?: boolean;
    showSponsors?: boolean;
    showSessions?: boolean;
    showAgenda?: boolean;
  },
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.event.update({
      where: { id: eventId },
      data: { micrositeConfig: config as Prisma.InputJsonValue },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    revalidatePath(`/${orgSlug}/e`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
