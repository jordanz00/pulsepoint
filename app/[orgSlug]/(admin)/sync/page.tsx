import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { loadSyncOpsSnapshot, syncHealthStatus } from "@/lib/sync-ops";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import {
  SyncFailureQueue,
  SyncOpsBrief,
  SyncRecoveryPaths,
} from "@/components/enterprise/sync-reliability-center";

export default async function SyncReliabilityPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const snapshot = await loadSyncOpsSnapshot(staff.orgId, orgSlug);
  const health = syncHealthStatus(snapshot);
  const issueCount =
    snapshot.openExceptions + snapshot.pendingImportBatches + snapshot.adOpsFailedJobs;

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Sync & reconciliation"
        subtitle={`${issueCount} open item${issueCount === 1 ? "" : "s"} · health ${health} · failures visible, recovery obvious`}
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <SyncOpsBrief snapshot={snapshot} orgSlug={orgSlug} />

      <div className="pp-sync-hub-grid">
        <SyncFailureQueue snapshot={snapshot} />
        <SyncRecoveryPaths orgSlug={orgSlug} />
      </div>
    </AdminPage>
  );
}
