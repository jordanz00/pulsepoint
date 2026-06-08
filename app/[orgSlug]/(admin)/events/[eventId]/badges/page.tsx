import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { buildBadgePrintHtml } from "@/lib/event-badge";

export default async function EventBadgesPrintPage({
  params,
}: {
  params: Promise<{ orgSlug: string; eventId: string }>;
}) {
  const { orgSlug, eventId } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const event = await db.event.findFirst({ where: { id: eventId } });
  if (!event) notFound();

  const regs = await db.eventRegistration.findMany({
    where: {
      eventId,
      status: { in: ["CONFIRMED", "PENDING"] },
      badgeCode: { not: null },
    },
    include: { member: true, ticketType: true },
    orderBy: { guestName: "asc" },
    take: 500,
  });

  const dateStr = event.startsAt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const microsite = (event.micrositeConfig as { accent?: string } | null) ?? {};

  const html = buildBadgePrintHtml(
    event.title,
    dateStr,
    regs.map((r) => ({
      displayName: r.member
        ? `${r.member.firstName} ${r.member.lastName}`.trim()
        : (r.guestName ?? "Guest"),
      email: r.guestEmail ?? r.member?.email ?? "",
      badgeCode: r.badgeCode!,
      ticketType: r.ticketType?.name,
      organization: r.member?.company ?? undefined,
    })),
    microsite.accent ?? "#2563eb",
  );

  return (
    <main
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  );
}
