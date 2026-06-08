import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";
import { AdminPage } from "@/components/admin/admin-page";
import { PageHeader } from "@/components/ui/page-header";
import { CommunitySpaceForm } from "@/components/communities/community-space-form";

export default async function CommunitiesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return null;

  const db = getOrgDb(org.id);
  const spaces = await db.communitySpace.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <AdminPage orgSlug={orgSlug}>
      <PageHeader
        title="Communities"
        subtitle="Private spaces for committees, chapters, and board collaboration"
        badge="alpha"
        backHref={`/${orgSlug}`}
        backLabel="Home"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="pc-card">
          <h2 className="pc-section-title">Active spaces</h2>
          {spaces.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
              No communities yet. Create a board or committee space to get started.
            </p>
          ) : (
            <ul className="pc-simple-list mt-4">
              {spaces.map((s) => (
                <li key={s.id} className="px-5 py-4">
                  <Link href={`/${orgSlug}/communities/${s.id}`} className="pc-link font-medium">
                    {s.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
                    {s.visibility.toLowerCase().replace("_", " ")} · {s._count.memberships} members
                  </p>
                  <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-[var(--pc-text-secondary)]">
            Member directory:{" "}
            <Link href={`/${orgSlug}/members`} className="pc-link">
              searchable directory
            </Link>{" "}
            with tags and export.
          </p>
        </section>
        <CommunitySpaceForm orgSlug={orgSlug} />
      </div>
    </AdminPage>
  );
}
