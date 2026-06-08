import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { AdvocacyIssueHub } from "@/components/advocacy/advocacy-issue-hub";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function AdvocacyIssuesHubPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const issues = await db.advocacyIssue.findMany({
    where: { orgId: org.id },
    orderBy: [{ issueArea: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Advocacy issue hub"
        subtitle="Healthcare topic templates, member landing pages, and admin CRUD — alpha; SME review required before public policy claims."
        badge="alpha"
        backHref={`/${orgSlug}/enterprise/advocacy`}
        backLabel="Advocacy"
        actions={
          <Link href={`/${orgSlug}/enterprise/advocacy`} className="pc-btn-secondary">
            Campaigns
          </Link>
        }
      />
      <AdvocacyIssueHub
        orgSlug={orgSlug}
        issues={issues.map((i) => ({
          id: i.id,
          title: i.title,
          summary: i.summary,
          status: i.status,
          issueArea: i.issueArea,
          publicSlug: i.publicSlug,
          billNumber: i.billNumber,
        }))}
      />
    </AdminPage>
  );
}
