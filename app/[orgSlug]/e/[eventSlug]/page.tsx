import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import {
  EventPublicMicrosite,
  type MicrositeConfig,
} from "@/components/events/event-public-microsite";
import {
  careerFairDisclaimer as fairDisclaimer,
  resolveCareerFairBooths,
} from "@/lib/events/career-fair-booths";

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string; eventSlug: string }>;
  searchParams: Promise<{ registered?: string; cancelled?: string }>;
}) {
  const { orgSlug, eventSlug } = await params;
  const query = await searchParams;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({
    where: { publicSlug: eventSlug, status: "PUBLISHED" },
  });
  if (!event) notFound();

  const [speakers, sponsors, sessions, tickets] = await Promise.all([
    db.eventSpeaker.findMany({ where: { eventId: event.id }, orderBy: { sortOrder: "asc" } }),
    db.eventSponsor.findMany({ where: { eventId: event.id }, orderBy: { sortOrder: "asc" } }),
    db.eventSession.findMany({ where: { eventId: event.id }, orderBy: { startsAt: "asc" } }),
    db.eventTicketType.findMany({
      where: { eventId: event.id, active: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const booths = resolveCareerFairBooths(event.micrositeConfig, sponsors);

  return (
    <EventPublicMicrosite
      org={{ name: org.name, slug: org.slug }}
      event={{
        title: event.title,
        description: event.description,
        startsAt: event.startsAt,
        publicSlug: event.publicSlug,
        priceCents: event.priceCents,
      }}
      micrositeConfig={(event.micrositeConfig as MicrositeConfig | null) ?? null}
      eventKind={event.eventKind}
      careerFairBooths={booths}
      careerFairDisclaimer={fairDisclaimer(event.micrositeConfig)}
      speakers={speakers.map((s) => ({
        id: s.id,
        name: s.name,
        title: s.title,
        role: s.role,
        organizationName: s.organizationName,
      }))}
      sponsors={sponsors.map((s) => ({
        id: s.id,
        name: s.name,
        tier: s.tier,
        boothNumber: s.boothNumber,
        logoUrl: s.logoUrl,
        websiteUrl: s.websiteUrl,
      }))}
      sessions={sessions.map((s) => ({
        id: s.id,
        title: s.title,
        startsAt: s.startsAt,
        room: s.room,
        track: s.track,
      }))}
      tickets={tickets.map((t) => ({ id: t.id, name: t.name, priceCents: t.priceCents }))}
      query={query}
    />
  );
}
