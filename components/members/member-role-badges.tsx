import {
  roleBadgesForMember,
  type MemberRoleRow,
  type RoleBadgeKind,
} from "@/lib/member-roles";

const badgeStyles: Record<RoleBadgeKind, string> = {
  c_suite:
    "bg-sky-100 text-sky-900 ring-1 ring-sky-200",
  our_board:
    "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200",
  external_board:
    "bg-violet-100 text-violet-900 ring-1 ring-violet-200",
  committee:
    "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
  executive:
    "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
  staff:
    "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200",
  former:
    "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
};

type Props = {
  roles: MemberRoleRow[];
  /** compact = inline chips; full = title + detail stacked */
  variant?: "compact" | "full";
  max?: number;
};

/**
 * Visual role badges for directory rows and profile headers.
 */
export function MemberRoleBadges({
  roles,
  variant = "compact",
  max = 4,
}: Props) {
  const badges = roleBadgesForMember(roles).slice(0, max);
  const overflow = roleBadgesForMember(roles).length - badges.length;

  if (badges.length === 0) {
    return (
      <span className="text-sm text-[var(--pc-text-tertiary)]">No roles on file</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, i) => (
        <span
          key={`${badge.kind}-${badge.label}-${i}`}
          className={`inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-xs font-medium ${badgeStyles[badge.kind]}`}
          title={badge.detail ? `${badge.label} — ${badge.detail}` : badge.label}
        >
          {variant === "full" ? (
            <span className="flex flex-col leading-tight">
              <span>{badge.label}</span>
              {badge.detail ? (
                <span className="text-[10px] font-normal opacity-80">{badge.detail}</span>
              ) : null}
            </span>
          ) : (
            <span className="truncate">{badge.label}</span>
          )}
        </span>
      ))}
      {overflow > 0 ? (
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
