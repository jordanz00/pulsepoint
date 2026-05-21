import Link from "next/link";
import { FeaturePillarsGrid } from "@/components/marketing/feature-pillars-grid";
import { ProductSuiteGrid } from "@/components/product-suite-grid";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { TAGLINE } from "@/lib/brand";
import { PULSE_PRODUCTS, productHref } from "@/lib/products";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const [memberCount, eventCount, openExceptions, upcoming] = await Promise.all([
    db.member.count(),
    db.event.count(),
    db.automationException.count({ where: { resolvedAt: null } }),
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
  ]);

  const membersProduct = PULSE_PRODUCTS.find((p) => p.id === "members")!;
  const eventsProduct = PULSE_PRODUCTS.find((p) => p.id === "events")!;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        subtitle={`${TAGLINE} · ${org.name}`}
        actions={
          <Link href={`/${orgSlug}/members/new`} className="pc-btn-primary text-sm">
            Add member
          </Link>
        }
      />

      <div className="pc-stat-grid">
        <Link href={productHref(orgSlug, membersProduct)} className="pc-stat-card">
          <p className="pc-stat-label">{membersProduct.name}</p>
          <p className="pc-stat-value">{memberCount}</p>
        </Link>
        <Link href={productHref(orgSlug, eventsProduct)} className="pc-stat-card">
          <p className="pc-stat-label">{eventsProduct.name}</p>
          <p className="pc-stat-value">{eventCount}</p>
        </Link>
        <Link href={`/${orgSlug}/exceptions`} className="pc-stat-card">
          <p className="pc-stat-label">Open exceptions</p>
          <p className="pc-stat-value">{openExceptions}</p>
        </Link>
        <Link href={`/${orgSlug}/settings`} className="pc-stat-card">
          <p className="pc-stat-label">Plan</p>
          <p className="pc-stat-value capitalize">{org.plan}</p>
        </Link>
      </div>

      <section className="pc-card">
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${orgSlug}/events/new`} className="pc-btn-primary text-sm">
            New event
          </Link>
          <Link href={`/${orgSlug}/members/imports`} className="pc-btn-secondary text-sm">
            Review imports
          </Link>
          <Link href={`/${orgSlug}/work`} className="pc-btn-secondary text-sm">
            PulsePoint Work
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No published upcoming events.</p>
        ) : (
          <div className="pc-table-wrap mt-3">
            <table className="pc-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link
                        href={`/${orgSlug}/events/${e.id}`}
                        className="pc-link"
                      >
                        {e.title}
                      </Link>
                    </td>
                    <td className="text-slate-500">
                      {e.startsAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">Product modules</h2>
        <div className="mt-4">
          <ProductSuiteGrid orgSlug={orgSlug} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[var(--pc-navy)]">Operational pillars</h2>
        <div className="mt-4">
          <FeaturePillarsGrid orgSlug={orgSlug} />
        </div>
      </section>
    </div>
  );
}
