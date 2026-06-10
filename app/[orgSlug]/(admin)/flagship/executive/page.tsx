import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { FlagshipExecutiveHub } from "@/components/showcase/flagship-executive-hub";
import { loadFlagshipFeatureStats } from "@/lib/load-flagship-feature-stats";
import { loadCeoCommandCenter } from "@/lib/ceo-command-center-data";
import { getOrgDb } from "@/lib/db";

export const metadata = {
  title: "Executive Command Center — Flagship",
};

export default async function FlagshipExecutivePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const [stats, ceo] = await Promise.all([
    loadFlagshipFeatureStats(org.id, orgSlug, org.name),
    loadCeoCommandCenter(org.id, orgSlug, org.name),
  ]);
  const db = getOrgDb(org.id);
  const courseCount = await db.course.count();

  const fmtUsd = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const loopContext = {
    memberTotal: ceo.members.total,
    renewalsDue30: ceo.members.renewalsDue30,
    advocacyActive: ceo.advocacy.activeCount,
    courseCount,
    revenueMtdUsd: fmtUsd(ceo.revenue.mtdCents),
    exceptionCount: 0,
  };

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Executive Command Center"
        subtitle="One-screen briefing plus scripted leadership loop."
        badge="live"
        backHref={`/${orgSlug}/flagship`}
        backLabel="Flagship features"
      />
      <FlagshipExecutiveHub
        orgSlug={orgSlug}
        stat={stats["executive-command"]!}
        loopContext={loopContext}
      />
    </AdminPage>
  );
}
