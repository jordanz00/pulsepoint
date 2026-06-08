"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { messageFromActionError } from "@/lib/action-errors";
import { requireCapability } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { DirectoryConfig } from "@/lib/directory-config";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const configSchema = z.object({
  visibility: z.enum(["public", "members_only", "private"]),
  fields: z.array(z.enum(["name", "email", "phone", "credentials", "chapter", "tags"])),
  searchable: z.array(z.enum(["name", "email", "phone", "credentials", "chapter", "tags"])),
  showPhotos: z.boolean(),
});

export async function saveDirectoryConfig(
  orgSlug: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const staff = await requireCapability("org:settings", { orgSlug });
    const parsed = configSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, error: "Invalid directory config" };
    await prisma.organization.update({
      where: { id: staff.orgId },
      data: { directoryConfig: parsed.data as Prisma.InputJsonValue },
    });
    revalidatePath(`/${orgSlug}/members`);
    revalidatePath(`/${orgSlug}/directory`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: messageFromActionError(e) };
  }
}

export async function getDirectoryConfig(orgSlug: string): Promise<DirectoryConfig> {
  const staff = await requireCapability("member:read", { orgSlug });
  const org = await prisma.organization.findUnique({
    where: { id: staff.orgId },
    select: { directoryConfig: true },
  });
  const { parseDirectoryConfig } = await import("@/lib/directory-config");
  return parseDirectoryConfig(org?.directoryConfig);
}
