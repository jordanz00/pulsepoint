"use server";

/**
 * EventCore — staff registration management (status, notes, waitlist).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { generateBadgeCode } from "@/lib/event-badge";
import { resolveEventRegistrationPrice } from "@/lib/events/resolve-registration-price";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "WAITLIST", "CANCELLED"]);

export async function updateRegistrationStatus(
  orgSlug: string,
  registrationId: string,
  status: z.infer<typeof statusSchema>,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = statusSchema.safeParse(status);
    if (!parsed.success) return { ok: false as const, error: "Invalid status" };

    const db = getOrgDb(staff.orgId);
    const reg = await db.eventRegistration.findFirst({ where: { id: registrationId } });
    if (!reg) return { ok: false as const, error: "Registration not found" };

    const data: {
      status: typeof parsed.data;
      cancelledAt?: Date | null;
      waitlistPosition?: number | null;
      paidAt?: Date | null;
      badgeCode?: string;
    } = { status: parsed.data };

    if (parsed.data === "CANCELLED") {
      data.cancelledAt = new Date();
      data.waitlistPosition = null;
    } else {
      data.cancelledAt = null;
    }
    if (parsed.data === "CONFIRMED") {
      if (!reg.badgeCode) data.badgeCode = generateBadgeCode(reg.id);
      if (!reg.paidAt) {
        const event = await db.event.findFirst({
          where: { id: reg.eventId },
          select: { priceCents: true },
        });
        if (event) {
          const { priceCents } = await resolveEventRegistrationPrice(db, {
            eventId: reg.eventId,
            eventPriceCents: event.priceCents,
            ticketTypeId: reg.ticketTypeId,
            promoCode: reg.promoCodeUsed,
          });
          if (priceCents === 0) data.paidAt = new Date();
        }
      }
    }
    if (parsed.data !== "WAITLIST") data.waitlistPosition = null;

    await db.eventRegistration.update({ where: { id: registrationId }, data });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.registration.status",
      entity: "EventRegistration",
      entityId: registrationId,
      diff: { status: parsed.data },
    });

    revalidatePath(`/${orgSlug}/events/${reg.eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Update failed" };
  }
}

export async function updateRegistrationNotes(
  orgSlug: string,
  registrationId: string,
  notes: string,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const trimmed = notes.trim().slice(0, 2000);
    const db = getOrgDb(staff.orgId);
    const reg = await db.eventRegistration.findFirst({ where: { id: registrationId } });
    if (!reg) return { ok: false as const, error: "Registration not found" };

    await db.eventRegistration.update({
      where: { id: registrationId },
      data: { staffNotes: trimmed },
    });
    revalidatePath(`/${orgSlug}/events/${reg.eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Update failed" };
  }
}

/** Confirm next N waitlisted registrants in order. */
export async function promoteWaitlistBatch(orgSlug: string, eventId: string, count: number) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const n = Math.min(Math.max(1, count), 50);
    const db = getOrgDb(staff.orgId);

    const waitlisted = await db.eventRegistration.findMany({
      where: { eventId, status: "WAITLIST" },
      orderBy: [{ waitlistPosition: "asc" }, { createdAt: "asc" }],
      take: n,
    });

    for (const reg of waitlisted) {
      await db.eventRegistration.update({
        where: { id: reg.id },
        data: {
          status: "CONFIRMED",
          waitlistPosition: null,
          cancelledAt: null,
        },
      });
    }

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.waitlist.promote",
      entity: "Event",
      entityId: eventId,
      diff: { count: waitlisted.length },
    });

    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const, promoted: waitlisted.length };
  } catch {
    return { ok: false as const, error: "Promote failed" };
  }
}
