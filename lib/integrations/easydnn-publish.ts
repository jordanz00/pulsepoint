/**
 * EasyDNN publish orchestration — events + member directory exports.
 */

import { getCmsAdapter, getEasyDnnSiteConfig } from "@/lib/adapters/cms";
import type { EasyDnnExportBundle } from "@/lib/adapters/cms/types";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function publishEventToEasyDnn(
  orgId: string,
  orgSlug: string,
  orgName: string,
  eventId: string,
): Promise<EasyDnnExportBundle> {
  const db = getOrgDb(orgId);
  const siteConfig = await getEasyDnnSiteConfig(orgId);
  const cms = getCmsAdapter();

  const event = await db.event.findFirst({
    where: { id: eventId },
    include: {
      speakers: { orderBy: { sortOrder: "asc" } },
      sponsors: { orderBy: { sortOrder: "asc" } },
      sessions: { orderBy: { startsAt: "asc" } },
      assets: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!event) throw new Error("EVENT_NOT_FOUND");

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const registrationUrl = `${base.replace(/\/$/, "")}/${orgSlug}/e/${event.publicSlug}`;
  const microsite = (event.micrositeConfig as { accent?: string; heroImage?: string } | null) ?? {};
  const logo = event.assets.find((a) => a.kind === "LOGO");

  const bundle = cms.buildEventModule({
    orgName,
    orgSlug,
    siteConfig,
    event: {
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      publicSlug: event.publicSlug,
      venueName: event.venueName,
      format: event.format,
    },
    registrationUrl,
    accent: microsite.accent ?? "#2563eb",
    heroImage: microsite.heroImage,
    logoUrl: logo?.url,
    speakers: event.speakers.map((s) => ({
      name: s.name,
      title: s.title,
      role: s.role,
    })),
    sponsors: event.sponsors.map((s) => ({
      name: s.name,
      tier: s.tier,
      logoUrl: s.logoUrl,
      boothNumber: s.boothNumber,
    })),
    sessions: event.sessions.map((s) => ({
      title: s.title,
      startsAt: s.startsAt,
      room: s.room,
      track: s.track,
    })),
  });

  await db.event.update({
    where: { id: eventId },
    data: {
      websiteExportConfig: {
        adapter: cms.id,
        lastExportedAt: bundle.generatedAt,
        manifest: bundle.manifest,
      },
    },
  });

  return bundle;
}

export async function publishMemberDirectoryToEasyDnn(
  orgId: string,
  orgName: string,
): Promise<EasyDnnExportBundle> {
  const db = getOrgDb(orgId);
  const siteConfig = await getEasyDnnSiteConfig(orgId);
  const cms = getCmsAdapter();

  const members = await db.member.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
    select: {
      firstName: true,
      lastName: true,
      jobTitle: true,
      company: true,
    },
  });

  return cms.buildMemberDirectoryModule({
    orgName,
    siteConfig,
    members: members.map((m) => ({
      name: `${m.firstName} ${m.lastName}`.trim(),
      title: m.jobTitle ?? "",
      organization: m.company ?? "",
    })),
  });
}
