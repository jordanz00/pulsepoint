import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { QuakeMissionControlPanel } from "@/components/executive/quake-mission-control-panel";
import { MissionControlOpsBrief } from "@/components/enterprise/mission-control-ops-brief";
import { loadQuakeMissionControl } from "@/lib/quake-mission-control";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mission Control — PulsePoint",
  description: "Quake OS build telemetry, ship workflow, and wave audit trail.",
};

export default async function MissionControlPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const quake = loadQuakeMissionControl();

  return (
    <AdminPage orgSlug={orgSlug}>
      <div className="mission-control-page pp-route-enter">
        <PageHeader
          eyebrow="Operator"
          title="Mission control"
          subtitle="Quake OS ship workflow, backlog truth, and build pulse — for builders and pilot operators."
          badge="live"
          backHref={`/${orgSlug}/leadership`}
          backLabel="Leadership loop"
          actions={
            <Link href={`/${orgSlug}/command-center`} className="pc-btn-secondary text-sm">
              Command center
            </Link>
          }
        />
        <MissionControlOpsBrief data={quake} />
        <QuakeMissionControlPanel data={quake} orgSlug={orgSlug} showOperator />
      </div>
    </AdminPage>
  );
}
