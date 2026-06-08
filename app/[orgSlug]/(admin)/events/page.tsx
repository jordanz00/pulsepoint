import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { EventCoreHub } from "@/components/events/eventcore-hub";
import { loadEventCoreSummary } from "@/lib/load-eventcore-summary";
import { EventEventsFilter } from "@/components/events/event-events-filter";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { ADMIN_PAGES, isEasyAdminMode, pageSubtitle } from "@/lib/admin-page-copy";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const easy = isEasyAdminMode(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const [events, summary] = await Promise.all([
    db.event.findMany({
      orderBy: { startsAt: "desc" },
      include: { _count: { select: { registrations: true } } },
      take: easy ? 50 : 100,
    }),
    loadEventCoreSummary(org.id),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={ADMIN_PAGES.events.title}
        subtitle={pageSubtitle(orgSlug, "events")}
        badge={easy ? undefined : "live"}
        backHref={easy ? `/${orgSlug}` : undefined}
        backLabel="Home"
        actions={
          <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary">
            New event
          </Link>
        }
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="events" />

      <EventCoreHub orgSlug={orgSlug} stats={summary} />

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create an event, then share the registration link or email your member list."
          action={
            <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary">
              New event
            </Link>
          }
        />
      ) : (
        <EventEventsFilter
          orgSlug={orgSlug}
          events={events.map((e) => ({
            id: e.id,
            title: e.title,
            status: e.status,
            startsAt: e.startsAt,
            venueName: e.venueName,
            format: e.format,
            registrationCount: e._count.registrations,
            capacity: e.capacity,
            publicSlug: e.publicSlug,
          }))}
        />
      )}
    </AdminPage>
  );
}
