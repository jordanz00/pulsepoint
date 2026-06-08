"use server";

/**
 * PulsePoint Learn — server actions (alpha).
 *
 * SCOPE: Create/list courses, enroll members, award CE credits.
 * STATUS: Alpha — schema + flows present; full LMS is roadmap.
 * SECURITY: requireCapability gates writes; reads scoped via getOrgDb.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { buildMemberTranscriptCsv } from "@/lib/learn/transcript-csv";
import type { ActionResult } from "@/app/actions/members";
import { messageFromActionError } from "@/lib/action-errors";

const courseInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  creditTypeId: z.string().cuid().optional(),
  creditAmount: z.coerce.number().int().min(0).max(1000).default(0),
});

const creditTypeInputSchema = z.object({
  code: z.string().min(1).max(40).regex(/^[A-Z0-9_-]+$/i),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
});

const awardInputSchema = z.object({
  memberId: z.string().cuid(),
  creditTypeId: z.string().cuid(),
  amount: z.coerce.number().int().min(1).max(1000),
  note: z.string().max(500).optional().default(""),
});

const enrollInputSchema = z.object({
  memberId: z.string().cuid(),
  courseId: z.string().cuid(),
});

export async function createCreditType(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("learn:manage", { orgSlug });
  const parsed = creditTypeInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid credit type" };
  const db = getOrgDb(staff.orgId);
  const created = await db.cECreditType.create({
    data: {
      orgId: staff.orgId,
      code: parsed.data.code.toUpperCase(),
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "ce.credit_type.create",
    entity: "CECreditType",
    entityId: created.id,
  });
  revalidatePath(`/${orgSlug}/learn`);
  return { ok: true as const };
}

export async function createCourse(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("learn:manage", { orgSlug });
  const parsed = courseInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid course" };
  const db = getOrgDb(staff.orgId);
  const created = await db.course.create({
    data: {
      orgId: staff.orgId,
      title: parsed.data.title,
      description: parsed.data.description,
      creditTypeId: parsed.data.creditTypeId,
      creditAmount: parsed.data.creditAmount,
    },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "learn.course.create",
    entity: "Course",
    entityId: created.id,
  });
  revalidatePath(`/${orgSlug}/learn`);
  return { ok: true as const };
}

export async function awardCredit(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("learn:manage", { orgSlug });
  const parsed = awardInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid award" };
  const db = getOrgDb(staff.orgId);
  const created = await db.cECreditAward.create({
    data: {
      orgId: staff.orgId,
      memberId: parsed.data.memberId,
      creditTypeId: parsed.data.creditTypeId,
      amount: parsed.data.amount,
      source: "manual",
      note: parsed.data.note,
    },
  });
  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "ce.credit.award",
    entity: "CECreditAward",
    entityId: created.id,
    diff: { amount: parsed.data.amount, memberId: parsed.data.memberId },
  });
  revalidatePath(`/${orgSlug}/learn`);
  return { ok: true as const };
}

export async function enrollMemberInCourse(orgSlug: string, raw: unknown) {
  const staff = await requireCapability("learn:manage", { orgSlug });
  const parsed = enrollInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid enrollment" };
  const db = getOrgDb(staff.orgId);

  const [member, course] = await Promise.all([
    db.member.findUnique({ where: { id: parsed.data.memberId } }),
    db.course.findUnique({ where: { id: parsed.data.courseId } }),
  ]);
  if (!member || member.orgId !== staff.orgId) {
    return { ok: false as const, error: "Member not found" };
  }
  if (!course || course.orgId !== staff.orgId) {
    return { ok: false as const, error: "Course not found" };
  }

  const enrollment = await db.courseEnrollment.upsert({
    where: {
      courseId_memberId: {
        courseId: parsed.data.courseId,
        memberId: parsed.data.memberId,
      },
    },
    create: {
      orgId: staff.orgId,
      courseId: parsed.data.courseId,
      memberId: parsed.data.memberId,
      status: "ENROLLED",
    },
    update: { status: "ENROLLED" },
  });

  await writeAuditLog({
    orgId: staff.orgId,
    userId: staff.userId,
    action: "learn.enrollment.create",
    entity: "CourseEnrollment",
    entityId: enrollment.id,
    diff: { memberId: parsed.data.memberId, courseId: parsed.data.courseId },
  });

  revalidatePath(`/${orgSlug}/learn`);
  revalidatePath(`/${orgSlug}/members/${parsed.data.memberId}`);
  return { ok: true as const, enrollmentId: enrollment.id };
}

export async function exportMemberTranscriptCsv(
  orgSlug: string,
  memberId: string,
): Promise<ActionResult<{ csv: string; enrollmentCount: number; awardCount: number }>> {
  try {
    const staff = await requireCapability("learn:manage", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member || member.orgId !== staff.orgId) {
      return { ok: false, error: "Member not found" };
    }

    const [enrollments, awards] = await Promise.all([
      db.courseEnrollment.findMany({
        where: { orgId: staff.orgId, memberId },
        include: { course: { select: { title: true } } },
        orderBy: { enrolledAt: "asc" },
      }),
      db.cECreditAward.findMany({
        where: { orgId: staff.orgId, memberId },
        include: { creditType: { select: { code: true, name: true } } },
        orderBy: { awardedAt: "asc" },
      }),
    ]);

    const csv = buildMemberTranscriptCsv({
      memberName: `${member.firstName} ${member.lastName}`.trim(),
      memberEmail: member.email ?? "",
      enrollments: enrollments.map((e) => ({
        courseTitle: e.course.title,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt?.toISOString() ?? "",
      })),
      awards: awards.map((a) => ({
        creditCode: a.creditType.code,
        creditName: a.creditType.name,
        amount: a.amount,
        source: a.source,
        awardedAt: a.awardedAt.toISOString(),
        note: a.note ?? "",
      })),
    });

    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "learn.transcript.export",
      entity: "Member",
      entityId: memberId,
      diff: { enrollmentCount: enrollments.length, awardCount: awards.length },
    });

    return {
      ok: true,
      data: {
        csv,
        enrollmentCount: enrollments.length,
        awardCount: awards.length,
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
