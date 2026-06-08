"use server";

/**
 * PulsePoint Prospector — enrich, lookup, context, quick actions.
 */

import type { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { enrichProspect, parseEnrichmentData, type FirmographicProfile } from "@/lib/crm/prospector-enrichment";
import { suggestEnrichment } from "@/lib/crm/enrichment";
import { prospectEnrichSchema, prospectNoteSchema, prospectStayInTouchSchema } from "@/lib/validations/prospector";
import type { ActionResult } from "@/app/actions/members";

export async function enrichProspectForStaff(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ firmographics: FirmographicProfile; suggestions: ReturnType<typeof suggestEnrichment> }>> {
  try {
    await requireCapability("member:read", { orgSlug });
    const parsed = prospectEnrichSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid input" };

    const firmographics = enrichProspect(parsed.data);
    const suggestions = suggestEnrichment({
      firstName: parsed.data.firstName ?? "",
      lastName: parsed.data.lastName ?? "",
      email: parsed.data.email || null,
      company: parsed.data.company || firmographics.companyName,
      jobTitle: parsed.data.jobTitle || null,
      linkedInUrl: parsed.data.linkedInUrl || firmographics.socialProfiles.linkedin || null,
    });

    return { ok: true, data: { firmographics, suggestions } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function lookupProspect(
  orgSlug: string,
  query: { email?: string; domain?: string },
): Promise<
  ActionResult<{
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      company: string | null;
      profileUrl: string;
    } | null;
    firmographics: FirmographicProfile;
  }>
> {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const email = query.email?.trim().toLowerCase();

    let member = email
      ? await db.member.findFirst({
          where: { email },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            linkedInUrl: true,
            websiteUrl: true,
            enrichmentData: true,
          },
        })
      : null;

    const firmographics =
      member && parseEnrichmentData(member.enrichmentData)
        ? parseEnrichmentData(member.enrichmentData)!
        : enrichProspect({
            email: email ?? undefined,
            company: member?.company,
            jobTitle: member?.jobTitle,
            linkedInUrl: member?.linkedInUrl,
            websiteUrl: member?.websiteUrl,
            pageUrl: query.domain ? `https://${query.domain}` : undefined,
          });

    return {
      ok: true,
      data: {
        member: member
          ? {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
              company: member.company,
              profileUrl: `/${staff.orgSlug}/members/${member.id}`,
            }
          : null,
        firmographics,
      },
    };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getMemberProspectContext(orgSlug: string, memberId: string) {
  try {
    const staff = await requireCapability("member:read", { orgSlug });
    const db = getOrgDb(staff.orgId);

    const member = await db.member.findFirst({
      where: { id: memberId },
      include: {
        notes: { orderBy: { createdAt: "desc" }, take: 8, include: { author: { select: { name: true } } } },
        contactSources: { orderBy: { capturedAt: "desc" }, take: 5 },
        crmWorkflowRuns: {
          where: { status: "ACTIVE" },
          take: 5,
          include: { workflow: { select: { name: true } } },
        },
        registrations: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: { event: { select: { title: true } } },
        },
      },
    });
    if (!member) return { ok: false as const, error: "Member not found" };

    const firmographics =
      parseEnrichmentData(member.enrichmentData) ??
      enrichProspect({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        company: member.company,
        jobTitle: member.jobTitle,
        linkedInUrl: member.linkedInUrl,
        websiteUrl: member.websiteUrl,
      });

    return {
      ok: true as const,
      data: {
        member: {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          company: member.company,
          jobTitle: member.jobTitle,
          relationshipHealth: member.relationshipHealth,
          lastTouchAt: member.lastTouchAt,
          nextFollowUpAt: member.nextFollowUpAt,
          profileUrl: `/${staff.orgSlug}/members/${member.id}`,
        },
        firmographics,
        notes: member.notes.map((n) => ({
          id: n.id,
          body: n.body,
          channel: n.channel,
          createdAt: n.createdAt,
          author: n.author?.name ?? "Staff",
        })),
        sources: member.contactSources.map((s) => ({
          kind: s.sourceKind,
          label: s.label,
          at: s.capturedAt,
        })),
        workflows: member.crmWorkflowRuns.map((r) => r.workflow.name),
        recentEvents: member.registrations.map((r) => r.event.title),
      },
    };
  } catch (e) {
    return { ok: false as const, error: messageFromActionError(e) };
  }
}

export async function applyProspectEnrichment(
  orgSlug: string,
  memberId: string,
  firmographics: FirmographicProfile,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    const member = await db.member.findFirst({ where: { id: memberId } });
    if (!member) return { ok: false, error: "Member not found" };

    await db.member.update({
      where: { id: memberId },
      data: {
        company: member.company || firmographics.companyName,
        websiteUrl: member.websiteUrl || firmographics.socialProfiles.website || null,
        linkedInUrl: member.linkedInUrl || firmographics.socialProfiles.linkedin || null,
        enrichmentData: firmographics as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/${staff.orgSlug}/members/${memberId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

function resolveStayInTouchDate(when: string): Date | null {
  const now = Date.now();
  if (when === "7d") return new Date(now + 7 * 86400000);
  if (when === "30d") return new Date(now + 30 * 86400000);
  if (when === "90d") return new Date(now + 90 * 86400000);
  const d = new Date(when);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function prospectorStayInTouch(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = prospectStayInTouchSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid date" };

    const due = resolveStayInTouchDate(parsed.data.when);
    if (!due) return { ok: false, error: "Invalid when value" };

    const db = getOrgDb(staff.orgId);
    await db.member.update({
      where: { id: parsed.data.memberId },
      data: { nextFollowUpAt: due, lastTouchAt: new Date() },
    });

    revalidatePath(`/${staff.orgSlug}/members/${parsed.data.memberId}`);
    revalidatePath(`/${staff.orgSlug}/crm/prospector`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function prospectorQuickNote(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ noteId: string }>> {
  try {
    const staff = await requireCapability("member:notes", { orgSlug });
    const parsed = prospectNoteSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid note" };

    const db = getOrgDb(staff.orgId);
    const note = await db.memberNote.create({
      data: {
        orgId: staff.orgId,
        memberId: parsed.data.memberId,
        authorUserId: staff.userId,
        body: parsed.data.body,
        noteType: parsed.data.noteType ?? "RELATIONSHIP",
        channel: parsed.data.channel || "prospector",
      },
    });

    await db.member.update({
      where: { id: parsed.data.memberId },
      data: { lastTouchAt: new Date() },
    });

    revalidatePath(`/${staff.orgSlug}/members/${parsed.data.memberId}`);
    return { ok: true, data: { noteId: note.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

/** Token-authenticated note (browser extension / bookmarklet). */
export async function prospectorQuickNoteWithToken(
  orgId: string,
  raw: unknown,
): Promise<ActionResult<{ noteId: string }>> {
  const parsed = prospectNoteSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid note" };

  const db = getOrgDb(orgId);
  const note = await db.memberNote.create({
    data: {
      orgId,
      memberId: parsed.data.memberId,
      authorUserId: null,
      body: parsed.data.body,
      noteType: parsed.data.noteType ?? "RELATIONSHIP",
      channel: parsed.data.channel || "prospector_extension",
    },
  });

  await db.member.update({
    where: { id: parsed.data.memberId },
    data: { lastTouchAt: new Date() },
  });

  return { ok: true, data: { noteId: note.id } };
}

export async function prospectorStayInTouchWithToken(
  orgId: string,
  raw: unknown,
): Promise<ActionResult> {
  const parsed = prospectStayInTouchSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid date" };

  const due = resolveStayInTouchDate(parsed.data.when);
  if (!due) return { ok: false, error: "Invalid when value" };

  const db = getOrgDb(orgId);
  await db.member.update({
    where: { id: parsed.data.memberId },
    data: { nextFollowUpAt: due, lastTouchAt: new Date() },
  });

  return { ok: true };
}
