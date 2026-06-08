import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrgDb } from "@/lib/db";

export default async function CommunitySpacePage({
  params,
}: {
  params: Promise<{ orgSlug: string; spaceSlug: string }>;
}) {
  const { orgSlug, spaceSlug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();
  const db = getOrgDb(org.id);
  const space = await db.communitySpace.findFirst({ where: { orgId: org.id, slug: spaceSlug } });
  if (!space) notFound();
  const [posts, documents, members] = await Promise.all([
    db.communityPost.findMany({ where: { spaceId: space.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.communityDocument.findMany({ where: { spaceId: space.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.communityMembership.findMany({
      where: { spaceId: space.id },
      include: { member: true },
      take: 50,
    }),
  ]);

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome border-b px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <Link href={`/${orgSlug}/my`} className="text-sm text-[var(--pc-brand)]">← Portal</Link>
          <h1 className="mt-2 text-xl font-bold">{space.name}</h1>
          <p className="text-sm text-[var(--pc-text-secondary)]">{space.description}</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <section className="pc-card">
          <h2 className="font-semibold">Discussion</h2>
          {posts.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">No posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="rounded-xl border border-[var(--pc-border)] p-4">
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">{p.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="pc-card">
          <h2 className="font-semibold">Documents</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {documents.map((d) => (
              <li key={d.id}>
                <a href={d.url} className="text-[var(--pc-brand)] hover:underline" target="_blank" rel="noopener noreferrer">
                  {d.title}
                </a>
              </li>
            ))}
            {documents.length === 0 ? <li className="text-[var(--pc-text-secondary)]">No documents shared.</li> : null}
          </ul>
        </section>
        <section className="pc-card">
          <h2 className="font-semibold">Members ({members.length})</h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {members.map((m) => (
              <li key={m.id} className="rounded-full bg-[var(--glass-bg-subtle)] px-3 py-1">
                {m.member.firstName} {m.member.lastName}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
