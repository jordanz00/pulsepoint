"use server";

/**
 * PulsePoint Learn — workforce / virtual career fair (alpha).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { requireCapability } from "@/lib/permissions";
import { parseVideoEmbedUrl } from "@/lib/learn/video-embed";

const playlistSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  trackSlug: z.string().trim().max(80).optional().default("general"),
});

const programSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  programType: z.enum(["pipeline", "mentorship", "scholarship"]).default("pipeline"),
  eventId: z.string().cuid().optional(),
});

const programEnrollSchema = z.object({
  programId: z.string().cuid(),
  memberId: z.string().cuid(),
});

const workforcePersonaSchema = z.object({
  memberId: z.string().cuid(),
  persona: z.enum(["NONE", "STUDENT", "NEW_GRAD", "CAREER_CHANGER", "EXPERIENCED", "EMPLOYER_PARTNER"]),
});

const videoItemSchema = z.object({
  playlistId: z.string().cuid(),
  title: z.string().trim().min(2).max(200),
  videoUrl: z.string().trim().max(500),
  durationMin: z.coerce.number().int().min(0).max(600).default(0),
  ceEligible: z.coerce.boolean().optional().default(false),
});

const careerFairSchema = z.object({
  title: z.string().trim().min(2).max(200),
  publicSlug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/i),
});

export async function createLearnVideoPlaylist(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const parsed = playlistSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid playlist" };

    const db = getOrgDb(staff.orgId);
    const created = await db.learnVideoPlaylist.create({
      data: {
        orgId: staff.orgId,
        title: parsed.data.title,
        description: parsed.data.description,
        trackSlug: parsed.data.trackSlug,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.playlist.create",
      entity: "LearnVideoPlaylist",
      entityId: created.id,
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    revalidatePath(`/${orgSlug}/learn/library`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createLearnVideoItem(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const parsed = videoItemSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid video item" };

    if (parsed.data.videoUrl && !parseVideoEmbedUrl(parsed.data.videoUrl)) {
      return { ok: false, error: "Use a valid YouTube or Vimeo URL" };
    }

    const db = getOrgDb(staff.orgId);
    const playlist = await db.learnVideoPlaylist.findUnique({
      where: { id: parsed.data.playlistId },
    });
    if (!playlist || playlist.orgId !== staff.orgId) {
      return { ok: false, error: "Playlist not found" };
    }

    const created = await db.learnVideoItem.create({
      data: {
        orgId: staff.orgId,
        playlistId: parsed.data.playlistId,
        title: parsed.data.title,
        videoUrl: parsed.data.videoUrl,
        durationMin: parsed.data.durationMin,
        ceEligible: parsed.data.ceEligible,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.video_item.create",
      entity: "LearnVideoItem",
      entityId: created.id,
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    revalidatePath(`/${orgSlug}/learn/library`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createWorkforceProgram(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const parsed = programSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid program" };

    const db = getOrgDb(staff.orgId);
    if (parsed.data.eventId) {
      const event = await db.event.findUnique({ where: { id: parsed.data.eventId } });
      if (!event || event.orgId !== staff.orgId) return { ok: false, error: "Event not found" };
    }

    const created = await db.learnWorkforceProgram.create({
      data: {
        orgId: staff.orgId,
        title: parsed.data.title,
        description: parsed.data.description,
        programType: parsed.data.programType,
        eventId: parsed.data.eventId ?? null,
        status: "DRAFT",
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.workforce_program.create",
      entity: "LearnWorkforceProgram",
      entityId: created.id,
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function enrollInWorkforceProgram(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const parsed = programEnrollSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid enrollment" };

    const db = getOrgDb(staff.orgId);
    const [program, member] = await Promise.all([
      db.learnWorkforceProgram.findUnique({ where: { id: parsed.data.programId } }),
      db.member.findUnique({ where: { id: parsed.data.memberId } }),
    ]);
    if (!program || program.orgId !== staff.orgId) return { ok: false, error: "Program not found" };
    if (!member || member.orgId !== staff.orgId) return { ok: false, error: "Member not found" };

    const enrollment = await db.learnProgramEnrollment.upsert({
      where: {
        programId_memberId: {
          programId: parsed.data.programId,
          memberId: parsed.data.memberId,
        },
      },
      create: {
        orgId: staff.orgId,
        programId: parsed.data.programId,
        memberId: parsed.data.memberId,
        status: "ENROLLED",
      },
      update: { status: "ENROLLED" },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.program_enrollment.create",
      entity: "LearnProgramEnrollment",
      entityId: enrollment.id,
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    return { ok: true, data: { id: enrollment.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function setMemberWorkforcePersona(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ memberId: string }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const parsed = workforcePersonaSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid persona" };

    const db = getOrgDb(staff.orgId);
    const member = await db.member.findUnique({ where: { id: parsed.data.memberId } });
    if (!member || member.orgId !== staff.orgId) return { ok: false, error: "Member not found" };

    await db.member.update({
      where: { id: member.id },
      data: { workforcePersona: parsed.data.persona },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.workforce_persona.set",
      entity: "Member",
      entityId: member.id,
      diff: { workforcePersona: parsed.data.persona },
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    revalidatePath(`/${orgSlug}/members/${member.id}`);
    return { ok: true, data: { memberId: member.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Virtual career fair event shell (alpha — booth model roadmap). */
export async function createVirtualCareerFairEvent(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string; publicSlug: string }>> {
  try {
    const staff = await requireCapability("event:write", { orgSlug });
    const parsed = careerFairSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid career fair" };

    const db = getOrgDb(staff.orgId);
    const existing = await db.event.findFirst({
      where: { orgId: staff.orgId, publicSlug: parsed.data.publicSlug },
    });
    if (existing) return { ok: false, error: "Event slug already in use" };

    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 30);
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + 4);

    const created = await db.event.create({
      data: {
        orgId: staff.orgId,
        title: parsed.data.title,
        description:
          "Alpha virtual career fair shell — employer booths and live chat are roadmap. Registration opens when published.",
        startsAt,
        endsAt,
        format: "VIRTUAL",
        eventKind: "VIRTUAL_CAREER_FAIR",
        status: "DRAFT",
        publicSlug: parsed.data.publicSlug,
        capacity: 500,
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.career_fair.create",
      entity: "Event",
      entityId: created.id,
      diff: { eventKind: "VIRTUAL_CAREER_FAIR" },
    });

    revalidatePath(`/${orgSlug}/learn/workforce`);
    revalidatePath(`/${orgSlug}/events`);
    return { ok: true, data: { id: created.id, publicSlug: created.publicSlug } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
