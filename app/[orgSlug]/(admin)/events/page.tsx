import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="PulsePoint Events"
        subtitle="Events, Sponsorships & Exhibits — registration, check-in, and public pages"
        badge="live"
        actions={
          <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary text-sm">
            New event
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create an event, publish it, and share the public registration link."
          action={
            <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary text-sm">
              New event
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <article
              key={e.id}
              className="pc-card flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <Link href={`/${orgSlug}/events/${e.id}`} className="pc-link text-base">
                  {e.title}
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {e.startsAt.toLocaleString()} · {e._count.registrations}{" "}
                  registrations
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={e.status === "PUBLISHED" ? "live" : "roadmap"}>
                  {e.status}
                </Badge>
                {e.status === "PUBLISHED" && (
                  <Link
                    href={`/${orgSlug}/e/${e.publicSlug}`}
                    className="pc-btn-secondary text-xs"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Public page
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
