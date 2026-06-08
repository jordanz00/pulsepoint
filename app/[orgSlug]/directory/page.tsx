import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberDirectoryFilters } from "@/components/members/member-directory-filters";
import { MemberRoleBadges } from "@/components/members/member-role-badges";
import { buildMemberListWhere } from "@/lib/member-role-filters";
import { isDirectoryPublic } from "@/lib/directory-public";
import { parseDirectoryConfig } from "@/lib/directory-config";
import { getOrgDb } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { parseMemberSearchFromQuery } from "@/lib/validations/member";

export default async function PublicDirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orgSlug } = await params;
  const rawSearch = await searchParams;

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) notFound();

  if (!isDirectoryPublic(org)) {
    return (
      <div className="pp-canvas flex min-h-screen items-center justify-center px-4">
        <div className="pc-card max-w-md text-center">
          <h1 className="text-lg font-semibold">Directory unavailable</h1>
          <p className="mt-2 text-sm text-[var(--pc-text-secondary)]">
            This organization has not enabled a public member directory.
          </p>
          <Link href={`/${orgSlug}/portal`} className="pc-link mt-4 inline-block text-sm">
            Member sign-in
          </Link>
        </div>
      </div>
    );
  }

  const filters = parseMemberSearchFromQuery(rawSearch);

  const db = getOrgDb(org.id);
  const members = await db.member.findMany({
    where: {
      ...buildMemberListWhere({ ...filters, status: "ACTIVE" }),
      status: "ACTIVE",
    },
    include: {
      roles: {
        where: { isCurrent: true },
        orderBy: [{ leadershipLevel: "asc" }, { title: "asc" }],
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 100,
  });

  const dirConfig = parseDirectoryConfig(org.directoryConfig);
  const showEmail = dirConfig.fields.includes("email");
  const showCredentials = dirConfig.fields.includes("credentials");

  return (
    <div className="pp-canvas min-h-screen">
      <header className="pc-glass-chrome border-b px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="font-semibold">{org.name}</h1>
            <p className="text-xs text-[var(--pc-text-secondary)]">Member directory</p>
          </div>
          <Link href={`/${orgSlug}/my`} className="pc-link text-sm">
            Member sign-in
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <p className="text-sm text-[var(--pc-text-secondary)]">
          Search active members by name, email, or role.
        </p>

        <MemberDirectoryFilters orgSlug={orgSlug} values={filters} action={`/${orgSlug}/directory`} />

        <ul className="pc-simple-list">
          {members.map((m) => {
            const custom = m.customFields as Record<string, unknown> | null;
            const credentials =
              showCredentials && custom?.credentials
                ? String(custom.credentials)
                : null;
            return (
              <li key={m.id} className="px-5 py-4">
                <p className="font-medium">
                  {m.firstName} {m.lastName}
                  {credentials ? (
                    <span className="ml-2 text-sm font-normal text-[var(--pc-text-tertiary)]">
                      {credentials}
                    </span>
                  ) : null}
                </p>
                {showEmail && m.email ? (
                  <p className="text-sm text-[var(--pc-text-secondary)]">{m.email}</p>
                ) : null}
                <MemberRoleBadges roles={m.roles} />
              </li>
            );
          })}
          {members.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-[var(--pc-text-secondary)]">
              No members match your filters.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
