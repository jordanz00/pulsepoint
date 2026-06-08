import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { requireOrgAccessForSlug } from "@/lib/auth";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { CommunityDocumentForm } from "@/components/communities/community-document-form";

export default async function CommunitySpaceAdminPage({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceId: string }>;
}) {
  const { orgSlug, spaceId } = await params;
  const staff = await requireOrgAccessForSlug(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(staff.orgId);
  const space = await db.communitySpace.findFirst({
    where: { id: spaceId, orgId: staff.orgId },
  });
  if (!space) notFound();

  const [documents, posts, roster] = await Promise.all([
    db.communityDocument.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.communityPost.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.communityMembership.findMany({
      where: { spaceId },
      include: {
        member: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title={space.name}
        subtitle={`${space.visibility.toLowerCase().replace("_", " ")} · ${roster.length} members`}
        badge="alpha"
        backHref={`/${orgSlug}/communities`}
        backLabel="Communities"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pc-card">
          <h2 className="pc-section-title">Document library</h2>
          {documents.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
              No documents yet. Add board packets, minutes, or policy links below.
            </p>
          ) : (
            <ul className="pc-simple-list mt-4">
              {documents.map((doc) => (
                <li key={doc.id} className="px-5 py-3">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pc-link font-medium"
                  >
                    {doc.title}
                  </a>
                  <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">
                    Added {doc.createdAt.toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <CommunityDocumentForm orgSlug={orgSlug} spaceId={spaceId} />
      </div>

      <section className="pc-card mt-6">
        <h2 className="pc-section-title">Recent discussion</h2>
        {posts.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">No posts in this space yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-[var(--pc-border)] pb-3 last:border-0">
                <p className="font-semibold">{post.title}</p>
                <p className="text-xs text-[var(--pc-text-tertiary)]">
                  {post.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm text-[var(--pc-text-secondary)]">
          Member portal:{" "}
          <Link href={`/${orgSlug}/portal/communities/${spaceId}`} className="pc-link">
            open in portal
          </Link>
        </p>
      </section>
    </AdminPage>
  );
}
