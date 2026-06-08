import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { ImportBatchReview } from "@/components/members/import-batch-review";
import { MemberImportUpload } from "@/components/members/member-import-upload";
import { PageHeader } from "@/components/ui/page-header";
import { ADMIN_PAGES } from "@/lib/admin-page-copy";
import { requirePageCapability } from "@/lib/admin-page-guard";

export default async function MemberImportsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requirePageCapability(orgSlug, "member:import", `/${orgSlug}/members`);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const batches = await db.memberImportBatch.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      rows: { orderBy: { rowIndex: "asc" } },
    },
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Member import"
        subtitle="Stage a CSV, review duplicates, then apply — never blind insert."
        badge="alpha"
        backHref={`/${orgSlug}/members`}
        backLabel={ADMIN_PAGES.members.title}
      />

      <MemberImportUpload orgSlug={orgSlug} />

      {batches.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--pc-text-secondary)]">
          No pending import batches. Upload a CSV above or{" "}
          <Link href={`/${orgSlug}/members`} className="pc-link">
            return to the directory
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {batches.map((batch) => (
            <ImportBatchReview
              key={batch.id}
              orgSlug={orgSlug}
              batch={{
                id: batch.id,
                fileName: batch.fileName,
                rowCount: batch.rowCount,
                createdAt: batch.createdAt,
                rows: batch.rows.map((r) => ({
                  id: r.id,
                  rowIndex: r.rowIndex,
                  firstName: r.firstName,
                  lastName: r.lastName,
                  email: r.email,
                  phone: r.phone,
                  company: r.company,
                  jobTitle: r.jobTitle,
                  memberStatus: r.memberStatus,
                  tierName: r.tierName,
                  renewalDueAt: r.renewalDueAt,
                  organizationName: r.organizationName,
                  status: r.status,
                })),
              }}
            />
          ))}
        </div>
      )}
    </AdminPage>
  );
}
