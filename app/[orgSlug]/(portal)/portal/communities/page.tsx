import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalSession } from "@/lib/auth";
import { getOrgDb } from "@/lib/db";
import { resolvePortalMember } from "@/lib/portal/resolve-portal-member";
import { prisma } from "@/lib/prisma";

export default async function PortalCommunitiesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const session = await requirePortalSession(orgSlug);
  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  const db = getOrgDb(org.id);
  const portal = await resolvePortalMember(orgSlug);
  const member = portal.ok ? portal.member : null;

  const memberships = member
    ? await db.communityMembership.findMany({
        where: { memberId: member.id },
        include: { space: true },
        orderBy: { joinedAt: "desc" },
      })
    : [];

  return (
    <div className="portal-page pp-route-enter">
      <header className="portal-page__head">
        <div className="portal-section__icon portal-section__icon--page" aria-hidden>
          <MessageCircle size={24} strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="portal-page__title">Communities</h1>
          <p className="portal-page__lead">
            Private spaces for your board, committees, and chapters.
          </p>
        </div>
      </header>

      {memberships.length === 0 ? (
        <div className="portal-empty ds-card ds-glass">
          <p>You are not in any community spaces yet.</p>
          <p className="portal-empty__sub">
            Contact staff to be added to a committee or chapter group.
          </p>
          <Link href={`/${orgSlug}/portal#activity`} className="ds-btn ds-btn--ghost ds-btn--sm">
            Back to my portal
          </Link>
        </div>
      ) : (
        <ul className="portal-community-grid">
          {memberships.map((m) => (
            <li key={m.id}>
              <Link
                href={`/${orgSlug}/portal/communities/${m.space.id}`}
                className="portal-community-card ds-card ds-glass"
              >
                <p className="portal-community-card__name">{m.space.name}</p>
                <p className="portal-community-card__meta">
                  {m.space.visibility.toLowerCase().replace("_", " ")} · {m.role.toLowerCase()}
                </p>
                {m.space.description ? (
                  <p className="portal-community-card__desc">{m.space.description}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
