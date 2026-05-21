import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href={`/${orgSlug}/events/new`}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        >
          New event
        </Link>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-4"
          >
            <div>
              <Link
                href={`/${orgSlug}/events/${e.id}`}
                className="font-semibold text-teal-800 hover:underline"
              >
                {e.title}
              </Link>
              <p className="text-sm text-zinc-500">
                {e.startsAt.toLocaleString()} · {e.status} ·{" "}
                {e._count.registrations} registrations
              </p>
            </div>
            {e.status === "PUBLISHED" && (
              <Link
                href={`/${orgSlug}/e/${e.publicSlug}`}
                className="text-sm text-teal-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Public page ↗
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
