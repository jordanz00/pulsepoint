import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { loadComplianceOpsSnapshot } from "@/lib/compliance-ops";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import {
  ComplianceApprovalPanels,
  ComplianceAuditTimeline,
  ComplianceMlrSection,
  ComplianceOpsBrief,
} from "@/components/enterprise/compliance-center";

export default async function ComplianceCenterPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const snapshot = await loadComplianceOpsSnapshot(staff.orgId);
  const pendingTotal =
    snapshot.pendingImportBatches + snapshot.openExceptions + (snapshot.adOps?.pendingCreativeQa ?? 0);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Compliance center"
        subtitle={`Approvals, audit trail, and MLR workflow visibility · ${pendingTotal} item${pendingTotal === 1 ? "" : "s"} across queues`}
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <ComplianceOpsBrief snapshot={snapshot} orgSlug={orgSlug} />
      <ComplianceApprovalPanels snapshot={snapshot} orgSlug={orgSlug} />
      <ComplianceMlrSection adOps={snapshot.adOps} orgSlug={orgSlug} />
      <ComplianceAuditTimeline
        rows={snapshot.recentAudit}
        orgSlug={orgSlug}
        adOpsAudit={snapshot.adOps}
      />
    </AdminPage>
  );
}
