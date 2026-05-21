import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const [memberCount, eventCount, upcoming] = await Promise.all([
    db.member.count(),
    db.event.count(),
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="mt-1 text-zinc-600">
          PulseCore dashboard for {org.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={String(memberCount)} href={`/${orgSlug}/members`} />
        <StatCard label="Events" value={String(eventCount)} href={`/${orgSlug}/events`} />
        <StatCard label="Plan" value={org.plan} href={`/${orgSlug}/settings`} />
      </div>

      <section>
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No published upcoming events.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border border-zinc-200 bg-white">
            {upcoming.map((e) => (
              <li key={e.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{e.title}</span>
                <span className="text-zinc-500">
                  {e.startsAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-teal-200"
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-teal-800">{value}</p>
    </Link>
  );
}
