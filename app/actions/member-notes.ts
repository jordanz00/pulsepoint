"use server";

/**
 * Member notes — single canonical place for staff interaction history.
 */

import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { memberNoteInputSchema } from "@/lib/validations/member-note";
import type { ActionResult } from "@/app/actions/members";

export async function listMemberNotes(
  memberId: string,
  orgSlug?: string,
): Promise<
  ActionResult<{
    notes: Array<{
      id: string;
      body: string;
      createdAt: Date;
      authorName: string | null;
    }>;
  }>
> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Member not found" };

    const notes = await db.memberNote.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    });

    return {
      ok: true,
      data: {
        notes: notes.map((n) => ({
          id: n.id,
          body: n.body,
          createdAt: n.createdAt,
          authorName: n.author?.name ?? n.author?.email ?? null,
        })),
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addMemberNote(
  memberId: string,
  raw: unknown,
  orgSlug?: string,
): Promise<ActionResult<{ noteId: string }>> {
  try {
    const staff = await requireCapability("member:notes", { orgSlug });
    const parsed = memberNoteInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: "Invalid note" };
    }

    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Member not found" };

    const followUp = parsed.data.nextFollowUpAt
      ? new Date(parsed.data.nextFollowUpAt)
      : null;

    const note = await db.memberNote.create({
      data: {
        orgId: staff.orgId,
        memberId,
        authorUserId: staff.userId,
        body: parsed.data.body,
        noteType: parsed.data.noteType ?? "GENERAL",
        channel: parsed.data.channel || null,
        nextFollowUpAt: followUp,
      },
    });

    await db.member.update({
      where: { id: memberId },
      data: {
        lastTouchAt: new Date(),
        ...(followUp ? { nextFollowUpAt: followUp } : {}),
      },
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "member.note_added",
      entity: "Member",
      entityId: memberId,
      diff: { noteId: note.id },
    });

    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true, data: { noteId: note.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
