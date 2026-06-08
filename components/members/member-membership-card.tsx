import Link from "next/link";
import type { Member, MemberTier, MemberOrganization } from "@/app/generated/prisma/client";

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renewalStatus(renewalDueAt: Date | null, status: string) {
  if (!renewalDueAt || status !== "ACTIVE") return null;
  const now = new Date();
  const days = Math.ceil(
    (renewalDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return { label: "Renewal overdue", tone: "risk" as const };
  if (days <= 30) return { label: `Due in ${days} days`, tone: "warn" as const };
  return { label: `Due ${formatDate(renewalDueAt)}`, tone: "ok" as const };
}

export function MemberMembershipCard({
  member,
  tier,
  organizationAccount,
  orgSlug,
}: {
  member: Pick<
    Member,
    | "status"
    | "joinedAt"
    | "renewalDueAt"
    | "engagementTier"
    | "engagementScore"
    | "company"
    | "jobTitle"
  >;
  tier: Pick<MemberTier, "name" | "priceCents"> | null;
  organizationAccount: Pick<MemberOrganization, "name" | "type"> | null;
  orgSlug: string;
}) {
  const renewal = renewalStatus(member.renewalDueAt, member.status);

  return (
    <section
      className="mc-membership-card glass pp-readable-on-light"
      aria-labelledby="mc-membership-heading"
    >
      <div className="mc-membership-card-head">
        <h2 id="mc-membership-heading" className="mc-hub-feature-title">
          Membership record
        </h2>
        <Link href={`/${orgSlug}/members/analytics`} className="mc-hub-feature-link text-sm">
          Org analytics →
        </Link>
      </div>
      <dl className="mc-membership-grid mt-4">
        <div>
          <dt className="mc-field-label">Status</dt>
          <dd className="mc-field-value">{member.status}</dd>
        </div>
        <div>
          <dt className="mc-field-label">Dues tier</dt>
          <dd className="mc-field-value">{tier?.name ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt className="mc-field-label">Renewal</dt>
          <dd className="mc-field-value">
            {formatDate(member.renewalDueAt)}
            {renewal ? (
              <span className={`mc-renewal-badge mc-renewal-badge--${renewal.tone}`}>
                {renewal.label}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="mc-field-label">Joined</dt>
          <dd className="mc-field-value">{formatDate(member.joinedAt)}</dd>
        </div>
        <div>
          <dt className="mc-field-label">Hospital / system</dt>
          <dd className="mc-field-value">
            {organizationAccount?.name ?? "—"}
            {organizationAccount?.type ? (
              <span className="text-xs text-[var(--pc-text-tertiary)]">
                {" "}
                · {organizationAccount.type.replace(/_/g, " ")}
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="mc-field-label">Engagement</dt>
          <dd className="mc-field-value">
            {member.engagementTier.replace(/_/g, " ")} · {member.engagementScore}/100
          </dd>
        </div>
        {(member.company || member.jobTitle) && (
          <div className="mc-membership-span-2">
            <dt className="mc-field-label">Professional</dt>
            <dd className="mc-field-value">
              {[member.jobTitle, member.company].filter(Boolean).join(" · ")}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
