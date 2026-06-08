"use server";

/**
 * EventCore operations — clone, export, promo codes, planner, lifecycle.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { assertEventTransition } from "@/lib/event-state";
import { eventPlannerConfigSchema } from "@/lib/event-planner-config";
import { buildAttendeeCsv, type EventExportRow } from "@/lib/event-export-csv";
import { eventStatusSchema } from "@/lib/validations/event";

const venueSchema = z.object({
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  timezone: z.string().max(80).optional(),
  format: z.enum(["IN_PERSON", "VIRTUAL", "HYBRID"]).optional(),
  registrationOpensAt: z.coerce.date().optional().nullable(),
  registrationClosesAt: z.coerce.date().optional().nullable(),
  waitlistEnabled: z.coerce.boolean().optional(),
});

const promoSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/),
  label: z.string().max(80).optional(),
  discountPercent: z.coerce.number().int().min(1).max(100).optional().nullable(),
  discountCents: z.coerce.number().int().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
});

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "event"
  );
}

export async function updateEventVenueAndRegistration(
  orgSlug: string,
  eventId: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = venueSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid venue data" };
    const db = getOrgDb(staff.orgId);
    const existing = await db.event.findFirst({ where: { id: eventId } });
    if (!existing) return { ok: false as const, error: "Event not found" };

    await db.event.update({
      where: { id: eventId },
      data: {
        venueName: parsed.data.venueName ?? existing.venueName,
        venueAddress: parsed.data.venueAddress ?? existing.venueAddress,
        timezone: parsed.data.timezone ?? existing.timezone,
        format: parsed.data.format ?? existing.format,
        registrationOpensAt:
          parsed.data.registrationOpensAt !== undefined
            ? parsed.data.registrationOpensAt
            : existing.registrationOpensAt,
        registrationClosesAt:
          parsed.data.registrationClosesAt !== undefined
            ? parsed.data.registrationClosesAt
            : existing.registrationClosesAt,
        waitlistEnabled:
          parsed.data.waitlistEnabled ?? existing.waitlistEnabled,
      },
    });

    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Save failed" };
  }
}

export async function saveEventPlannerConfig(
  orgSlug: string,
  eventId: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = eventPlannerConfigSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid planner data" };
    const db = getOrgDb(staff.orgId);
    await db.event.update({
      where: { id: eventId },
      data: { plannerConfig: parsed.data },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Save failed" };
  }
}

export async function setEventLifecycleStatus(
  orgSlug: string,
  eventId: string,
  status: z.infer<typeof eventStatusSchema>,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = eventStatusSchema.safeParse(status);
    if (!parsed.success) return { ok: false as const, error: "Invalid status" };
    const db = getOrgDb(staff.orgId);
    const existing = await db.event.findFirst({ where: { id: eventId } });
    if (!existing) return { ok: false as const, error: "Event not found" };
    if (parsed.data !== existing.status) {
      assertEventTransition(existing.status, parsed.data);
    }
    await db.event.update({ where: { id: eventId }, data: { status: parsed.data } });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.lifecycle",
      entity: "Event",
      entityId: eventId,
      diff: { status: parsed.data },
    });
    revalidatePath(`/${orgSlug}/events`);
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Status change not allowed" };
  }
}

export async function cloneEvent(orgSlug: string, eventId: string) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const source = await db.event.findFirst({
      where: { id: eventId },
      include: {
        speakers: true,
        sponsors: true,
        sessions: true,
        ticketTypes: true,
      },
    });
    if (!source) return { ok: false as const, error: "Event not found" };

    let slug = `${source.publicSlug}-copy`;
    let n = 1;
    while (await db.event.findFirst({ where: { publicSlug: slug } })) {
      slug = `${source.publicSlug}-copy-${n++}`;
    }

    const cloned = await db.event.create({
      data: {
        orgId: staff.orgId,
        title: `${source.title} (copy)`,
        description: source.description,
        startsAt: source.startsAt,
        endsAt: source.endsAt,
        capacity: source.capacity,
        priceCents: source.priceCents,
        status: "DRAFT",
        publicSlug: slug,
        venueName: source.venueName,
        venueAddress: source.venueAddress,
        timezone: source.timezone,
        format: source.format,
        registrationOpensAt: source.registrationOpensAt,
        registrationClosesAt: source.registrationClosesAt,
        waitlistEnabled: source.waitlistEnabled,
        plannerConfig: source.plannerConfig ?? undefined,
        micrositeConfig: source.micrositeConfig ?? undefined,
        speakers: {
          create: source.speakers.map((s) => ({
            orgId: staff.orgId,
            name: s.name,
            title: s.title,
            organizationName: s.organizationName,
            bio: s.bio,
            role: s.role,
            sortOrder: s.sortOrder,
          })),
        },
        sponsors: {
          create: source.sponsors.map((s) => ({
            orgId: staff.orgId,
            name: s.name,
            tier: s.tier,
            logoUrl: s.logoUrl,
            websiteUrl: s.websiteUrl,
            amountCents: s.amountCents,
            sortOrder: s.sortOrder,
          })),
        },
        sessions: {
          create: source.sessions.map((s) => ({
            orgId: staff.orgId,
            title: s.title,
            description: s.description,
            startsAt: s.startsAt,
            endsAt: s.endsAt,
            room: s.room,
            track: s.track,
            sortOrder: s.sortOrder,
          })),
        },
        ticketTypes: {
          create: source.ticketTypes.map((t) => ({
            orgId: staff.orgId,
            name: t.name,
            description: t.description,
            priceCents: t.priceCents,
            capacity: t.capacity,
            sortOrder: t.sortOrder,
            active: t.active,
          })),
        },
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.clone",
      entity: "Event",
      entityId: cloned.id,
      diff: { sourceEventId: eventId },
    });

    revalidatePath(`/${orgSlug}/events`);
    return { ok: true as const, eventId: cloned.id };
  } catch {
    return { ok: false as const, error: "Clone failed" };
  }
}

export async function exportEventAttendeesCsv(orgSlug: string, eventId: string) {
  try {
    const staff = await requireCapability("event:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const regs = await db.eventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
      include: { member: true, ticketType: true },
      take: 5000,
    });

    const rows: EventExportRow[] = regs.map((r) => ({
      registrationId: r.id,
      displayName: r.member
        ? `${r.member.firstName} ${r.member.lastName}`.trim()
        : (r.guestName ?? ""),
      email: r.guestEmail ?? r.member?.email ?? "",
      status: r.status,
      ticketType: r.ticketType?.name ?? "",
      paid: r.paidAt ? "yes" : "no",
      checkedIn: r.checkedInAt ? "yes" : "no",
      registeredAt: r.createdAt.toISOString(),
      staffNotes: r.staffNotes,
    }));

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "eventcore.export.csv",
      entity: "Event",
      entityId: eventId,
      diff: { rowCount: rows.length },
    });

    return { ok: true as const, csv: buildAttendeeCsv(rows), rowCount: rows.length };
  } catch {
    return { ok: false as const, error: "Export failed" };
  }
}

export async function createEventPromoCode(
  orgSlug: string,
  eventId: string,
  raw: unknown,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = promoSchema.safeParse(raw);
    if (!parsed.success) return { ok: false as const, error: "Invalid promo code" };
    if (!parsed.data.discountPercent && !parsed.data.discountCents) {
      return { ok: false as const, error: "Set a percent or fixed discount" };
    }
    const db = getOrgDb(staff.orgId);
    await db.eventPromoCode.create({
      data: {
        orgId: staff.orgId,
        eventId,
        code: parsed.data.code.toUpperCase(),
        label: parsed.data.label ?? "",
        discountPercent: parsed.data.discountPercent ?? null,
        discountCents: parsed.data.discountCents ?? null,
        maxUses: parsed.data.maxUses ?? null,
      },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create promo code" };
  }
}

export async function deleteEventPromoCode(
  orgSlug: string,
  promoId: string,
  eventId: string,
) {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.eventPromoCode.deleteMany({
      where: { id: promoId, orgId: staff.orgId, eventId },
    });
    revalidatePath(`/${orgSlug}/events/${eventId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Delete failed" };
  }
}
