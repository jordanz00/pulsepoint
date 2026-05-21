import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { ImportBatchReview } from "@/components/members/import-batch-review";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MemberImportsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const batches = await db.memberImportBatch.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
    include: {
      rows: { orderBy: { rowIndex: "asc" }, take: 200 },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import review"
        subtitle="CSV rows are staged first. Apply creates member records; reject discards the batch. Never blind-insert from upload."
        badge="live"
        backHref={`/${orgSlug}/members`}
        backLabel="MemberCore"
      />

      {batches.length === 0 ? (
        <EmptyState
          title="No pending import batches"
          description="Stage a CSV from MemberCore to review rows before they become production members."
          action={
            <Link href={`/${orgSlug}/members`} className="pc-btn-primary text-sm">
              Go to MemberCore
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
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
                  status: r.status,
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
