import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Simple iCal export for published upcoming events.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await context.params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const events = await db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 100,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PulsePoint//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${org.name} Events`,
  ];

  for (const e of events) {
    const end = e.endsAt ?? new Date(e.startsAt.getTime() + 2 * 60 * 60 * 1000);
    const uid = `${e.id}@${org.slug}.pulsepoint.local`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(e.startsAt)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${e.title.replace(/[,;\\]/g, " ")}`,
      `DESCRIPTION:${(e.description || e.title).replace(/\n/g, "\\n").slice(0, 500)}`,
      `URL:${baseUrl}/${orgSlug}/e/${e.publicSlug}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${orgSlug}-events.ics"`,
    },
  });
}
