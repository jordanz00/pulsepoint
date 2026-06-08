import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleLandingBriefing } from "@/components/platform/module-landing-briefing";
import { getOrgDb } from "@/lib/db";
import { ensureDefaultDealReports } from "@/app/actions/deal-reports";
import { ensureDefaultDealPipeline } from "@/app/actions/deals";

export const dynamic = "force-dynamic";

export default async function DealsHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  await ensureDefaultDealPipeline(orgSlug);
  await ensureDefaultDealReports(orgSlug);

  const db = getOrgDb(org.id);
  const [dealCount, openCount, wonSum, dashboardCount] = await Promise.all([
    db.deal.count(),
    db.deal.count({
      where: { stage: { in: ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"] } },
    }),
    db.deal.aggregate({
      where: { stage: "WON" },
      _sum: { amountCents: true },
    }),
    db.dealReportDashboard.count(),
  ]);

  const cards = [
    {
      title: "Partnership pipeline",
      body: "Track sponsorships and partnerships through stages — from lead to won or lost.",
      href: `/${orgSlug}/deals/pipeline`,
    },
    {
      title: "Partnership analytics",
      body: "Executive dashboards, custom widgets, and filters — pipeline by stage, forecast, conversion, and team performance.",
      href: `/${orgSlug}/deals/reports`,
    },
  ];

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="PulsePoint Partnerships"
        subtitle="Business development pipeline and executive reporting — built for association revenue and sponsorship teams."
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <ModuleLandingBriefing orgId={org.id} orgSlug={orgSlug} productId="deals" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="pc-glass-panel rounded-xl p-4">
          <p className="text-2xl font-semibold">{dealCount}</p>
          <p className="text-sm text-zinc-500">Total partnerships</p>
        </div>
        <div className="pc-glass-panel rounded-xl p-4">
          <p className="text-2xl font-semibold">{openCount}</p>
          <p className="text-sm text-zinc-500">Open in pipeline</p>
        </div>
        <div className="pc-glass-panel rounded-xl p-4">
          <p className="text-2xl font-semibold">
            ${((wonSum._sum.amountCents ?? 0) / 100).toLocaleString()}
          </p>
          <p className="text-sm text-zinc-500">Won revenue (all time)</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-zinc-600">
        {dashboardCount} report dashboard{dashboardCount === 1 ? "" : "s"} configured
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="pc-glass-panel block rounded-xl p-6 transition hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-zinc-900">{c.title}</h2>
            <p className="mt-2 text-sm text-zinc-600">{c.body}</p>
            <span className="mt-3 inline-block text-sm font-medium text-[var(--pc-brand)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
