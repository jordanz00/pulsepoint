import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

export default async function EventCalendarPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const events = await db.event.findMany({
    where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 50,
  });

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome border-b px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <h1 className="font-semibold">{org.name}</h1>
          <Link
            href={`/${orgSlug}/calendar/feed.ics`}
            className="text-xs font-semibold text-[var(--pc-brand)]"
          >
            iCal feed
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">Event calendar</h1>
        <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
          Mobile-friendly event list (demo preview). Subscribe via iCal or open any event microsite to register.
        </p>
        <ul className="mt-6 space-y-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/${orgSlug}/e/${e.publicSlug}`}
                className="pc-card block transition hover:shadow-md"
              >
                <p className="font-semibold">{e.title}</p>
                <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
                  {e.startsAt.toLocaleString()}
                </p>
                <p className="mt-2 text-xs font-semibold text-[var(--pc-brand)]">View microsite →</p>
              </Link>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="pc-card text-sm text-[var(--pc-text-secondary)]">No upcoming events.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
