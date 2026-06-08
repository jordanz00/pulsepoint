import { memberStatusLabel } from "@/lib/admin-page-copy";
import {
  formatMemberRoleLine,
  groupRolesForProfile,
  memberHasCSuite,
  memberHasExternalBoard,
  memberHasOurBoard,
  type MemberRoleRow,
} from "@/lib/member-roles";
import { MemberRoleBadges } from "@/components/members/member-role-badges";
import { Badge } from "@/components/ui/badge";

type Props = {
  member: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    status: string;
    joinedAt: Date;
    engagementTier?: string;
    engagementScore?: number;
  };
  roles: MemberRoleRow[];
};

/**
 * Profile hero — name, status, governance highlights, grouped role sections.
 */
export function MemberProfileHeader({ member, roles }: Props) {
  const groups = groupRolesForProfile(roles);
  const currentCount = roles.filter((r) => r.isCurrent).length;

  return (
    <section className="pc-glass-panel mb-6 overflow-hidden rounded-xl">
      <div className="border-b border-[var(--pc-border)] bg-gradient-to-br from-slate-50 to-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Member profile
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--pc-text)]">
              {member.firstName} {member.lastName}
            </h2>
            <p className="mt-1 text-sm text-[var(--pc-text-secondary)]">
              {memberStatusLabel(member.status as "ACTIVE" | "INACTIVE" | "LAPSED")}
              {member.email ? ` · ${member.email}` : ""}
              {member.phone ? ` · ${member.phone}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {memberHasCSuite(roles) ? <Badge variant="live">C-Suite</Badge> : null}
            {memberHasOurBoard(roles) ? (
              <Badge variant="neutral">Our board</Badge>
            ) : null}
            {memberHasExternalBoard(roles) ? (
              <Badge variant="roadmap">External board</Badge>
            ) : null}
            {typeof member.engagementScore === "number" ? (
              <Badge variant="neutral">
                Engagement {member.engagementScore}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--pc-text-tertiary)]">
            Current roles ({currentCount})
          </p>
          <div className="mt-2">
            <MemberRoleBadges roles={roles} variant="full" max={8} />
          </div>
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id}>
              <h2 className="text-sm font-semibold text-[var(--pc-text)]">
                {group.heading}
              </h2>
              <ul className="mt-2 space-y-2">
                {group.roles.map((role) => (
                  <li
                    key={role.id}
                    className="rounded-lg border border-[var(--pc-border)] bg-white/60 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-[var(--pc-text)]">
                      {formatMemberRoleLine(role)}
                    </p>
                    {role.notes ? (
                      <p className="mt-1 text-xs text-[var(--pc-text-secondary)]">
                        {role.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-6 py-5 text-sm text-[var(--pc-text-tertiary)]">
          No leadership or board roles recorded. Add roles below to showcase this
          member&apos;s governance profile.
        </p>
      )}

      <div className="border-t border-[var(--pc-border)] px-6 py-3 text-xs text-[var(--pc-text-tertiary)]">
        Member since{" "}
        {member.joinedAt.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </section>
  );
}
