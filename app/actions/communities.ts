"use server";

/**
 * Private communities — committees, chapters, board spaces.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { getOrgDb } from "@/lib/db";
import { isAllowedCommunityDocumentUrl } from "@/lib/communities/document-url";
import { writeAuditLog } from "@/lib/audit";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const spaceSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "MEMBERS_ONLY", "PUBLIC"]).optional(),
});

const postSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});

const docSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url().max(500),
});

export async function createCommunitySpace(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = spaceSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid community" };
    const db = getOrgDb(staff.orgId);
    const space = await db.communitySpace.create({
      data: {
        orgId: staff.orgId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? "",
        visibility: parsed.data.visibility ?? "PRIVATE",
      },
    });
    revalidatePath(`/${orgSlug}/communities`);
    revalidatePath(`/${orgSlug}/portal/communities`);
    return { ok: true, data: { id: space.id } };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function createCommunityPost(
  orgSlug: string,
  spaceId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid post" };
    const db = getOrgDb(staff.orgId);
    await db.communityPost.create({
      data: {
        orgId: staff.orgId,
        spaceId,
        authorUserId: staff.userId,
        title: parsed.data.title,
        body: parsed.data.body,
      },
    });
    revalidatePath(`/${orgSlug}/communities`);
    revalidatePath(`/${orgSlug}/portal/communities`);
    revalidatePath(`/${orgSlug}/c`);
    revalidatePath(`/${orgSlug}/portal/communities`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addCommunityDocument(
  orgSlug: string,
  spaceId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const parsed = docSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid document" };
    if (!isAllowedCommunityDocumentUrl(parsed.data.url)) {
      return { ok: false, error: "Document URL must use https." };
    }
    const db = getOrgDb(staff.orgId);
    const space = await db.communitySpace.findFirst({
      where: { id: spaceId, orgId: staff.orgId },
    });
    if (!space) return { ok: false, error: "Community not found" };
    const created = await db.communityDocument.create({
      data: {
        orgId: staff.orgId,
        spaceId,
        title: parsed.data.title.trim(),
        url: parsed.data.url.trim(),
        uploadedByUserId: staff.userId,
      },
    });
    await writeAuditLog({
      orgId: staff.orgId,
      userId: staff.userId,
      action: "communities.document.add",
      entity: "CommunityDocument",
      entityId: created.id,
      diff: { spaceId, title: created.title },
    });
    revalidatePath(`/${orgSlug}/communities`);
    revalidatePath(`/${orgSlug}/communities/${spaceId}`);
    revalidatePath(`/${orgSlug}/portal/communities`);
    revalidatePath(`/${orgSlug}/portal/communities/${spaceId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function addCommunityMember(
  orgSlug: string,
  spaceId: string,
  memberId: string,
  role: "MEMBER" | "MODERATOR" | "ADMIN" = "MEMBER",
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("member:write", { orgSlug });
    const db = getOrgDb(staff.orgId);
    await db.communityMembership.upsert({
      where: { spaceId_memberId: { spaceId, memberId } },
      create: { orgId: staff.orgId, spaceId, memberId, role },
      update: { role },
    });
    revalidatePath(`/${orgSlug}/communities`);
    revalidatePath(`/${orgSlug}/portal/communities`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}
