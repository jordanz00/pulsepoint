import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalSession } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { prisma } from "@/lib/prisma";

export default async function CommunitySpacePage({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceId: string }>;
}) {
  const { orgSlug, spaceId } = await params;
  const session = await requirePortalSession(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const space = await db.communitySpace.findFirst({
    where: { id: spaceId, orgId: org.id },
  });
  if (!space) notFound();

  const portal = await resolvePortalMember(orgSlug);
  const member = portal.ok ? portal.member : null;

  const membership = member
    ? await db.communityMembership.findFirst({
        where: { spaceId, memberId: member.id },
      })
    : null;

  if (!membership && space.visibility === "PRIVATE") {
    notFound();
  }

  const [roster, posts, documents] = await Promise.all([
    db.communityMembership.findMany({
      where: { spaceId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            roles: {
              where: { isCurrent: true },
              take: 1,
              select: { title: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
    db.communityPost.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.communityDocument.findMany({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/${orgSlug}/portal/communities`} className="pc-link text-sm">
          ← All communities
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[var(--pc-text)]">{space.name}</h1>
        {space.description ? (
          <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">{space.description}</p>
        ) : null}
      </div>

      <section className="pc-card">
        <h2 className="pc-section-title">Roster</h2>
        <ul className="pc-simple-list mt-4">
          {roster.map((r) => (
            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3">
              <span className="font-medium">
                {r.member.firstName} {r.member.lastName}
              </span>
              <span className="text-xs text-[var(--pc-text-tertiary)]">
                {r.role.toLowerCase()}
                {r.member.roles[0]?.title ? ` · ${r.member.roles[0].title}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pc-card">
        <h2 className="pc-section-title">Discussion</h2>
        {posts.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">No posts yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-[var(--pc-border)] pb-4 last:border-0">
                <p className="font-semibold text-[var(--pc-text)]">{post.title}</p>
                <p className="mt-1 text-sm text-[var(--pc-text-secondary)] whitespace-pre-wrap">
                  {post.body}
                </p>
                <p className="mt-2 text-xs text-[var(--pc-text-tertiary)]">
                  {post.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pc-card">
        <h2 className="pc-section-title">Documents</h2>
        {documents.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
            No documents yet. Association staff add board packets and minutes from the admin
            communities workspace.
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
                <p className="text-xs text-[var(--pc-text-tertiary)]">
                  Added {doc.createdAt.toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
