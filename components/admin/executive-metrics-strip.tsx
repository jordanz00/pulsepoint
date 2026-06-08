import Link from "next/link";
import { loadExecutiveDashboard } from "@/lib/executive-metrics";
import { loadDashboardPeriodDeltas } from "@/lib/dashboard-glass";
import { prisma } from "@/lib/prisma";
import { GlassStatCard } from "@/components/admin/glass-stat-card";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export async function ExecutiveMetricsStrip({ orgSlug }: { orgSlug: string }) {
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const [data, periodDeltas] = await Promise.all([
    loadExecutiveDashboard(org.id),
    loadDashboardPeriodDeltas(org.id),
  ]);

  return (
    <section className="pp-executive-strip" aria-label="Revenue and member summary">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="pp-executive-strip-eyebrow">Executive view</p>
          <h2 className="pp-executive-strip-title mt-2">
            Dues and non-dues revenue—audited from your data
          </h2>
        </div>
        <Link href={`/${orgSlug}/insights`} className="pc-btn-primary text-sm shrink-0">
          Full reports
        </Link>
      </div>
      <div className="pp-glass-stat-grid mt-6" role="list">
        <GlassStatCard
          label="Total revenue"
          value={formatUsd(data.totalRevenueCents)}
          delta={periodDeltas.revenue}
        />
        <GlassStatCard label="Dues" value={formatUsd(data.duesRevenueCents)} />
        <GlassStatCard label="Non-dues" value={formatUsd(data.nonDuesRevenueCents)} />
        <GlassStatCard
          label="Active members"
          value={String(data.kpis.find((k) => k.id === "members.active")?.value ?? 0)}
          delta={periodDeltas.members}
        />
      </div>
      <p className="pp-executive-strip-footnote mt-5">
        Pulled live from Commerce, Giving, and Events ·{" "}
        <Link href={`/${orgSlug}/insights`} className="pc-link font-medium">
          See breakdown & audit log
        </Link>
      </p>
    </section>
  );
}
