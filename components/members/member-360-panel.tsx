import Link from "next/link";
import { ENGAGEMENT_TIER_LABEL, type EngagementTier } from "@/lib/engagement-score";
import type { Member360Profile } from "@/lib/member-360";
import { Badge } from "@/components/ui/badge";
import { Member360Timeline } from "@/components/members/member-360-timeline";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

const TIER_BADGE: Record<EngagementTier, "live" | "alpha" | "warning" | "roadmap"> = {
  active: "live",
  moderate: "alpha",
  at_risk: "warning",
  inactive: "roadmap",
};

export function Member360Panel({
  orgSlug,
  profile,
  dbBadges = [],
}: {
  orgSlug: string;
  profile: Member360Profile;
  dbBadges?: { code: string; label: string }[];
}) {
  const allBadges = [
    ...profile.badges,
    ...dbBadges.filter((b) => !profile.badges.some((p) => p.code === b.code)),
  ];

  return (
    <section className="space-y-6">
      <EngagementHeader profile={profile} />
      <EngagementStats profile={profile} />
      {allBadges.length > 0 ? <EngagementBadges badges={allBadges} /> : null}

      {profile.renewalDueAt ? (
        <div className="pc-card">
          <p className="text-sm font-semibold text-[var(--pc-text)]">Renewal</p>
          <p className="mt-1 text-[15px] text-[var(--pc-text-secondary)]">
            Due {profile.renewalDueAt.toLocaleDateString()}
            {profile.tierName ? ` · ${profile.tierName} tier` : ""}
          </p>
          <Link href={`/${orgSlug}/members/renewals`} className="pc-link mt-2 inline-block text-sm">
            Manage renewals →
          </Link>
        </div>
      ) : null}

      <div>
        <h2 className="pc-section-title">Activity timeline</h2>
        <p className="pc-section-lead">
          Events, commerce, giving, learning, email, and staff notes — filter by type or open the
          source module.
        </p>
        <Member360Timeline activities={profile.activities} />
      </div>
    </section>
  );
}

function EngagementHeader({ profile }: { profile: Member360Profile }) {
  return (
    <div className="pc-card flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--pc-text-tertiary)]">
          Engagement score
        </p>
        <p className="mt-1 font-[family-name:var(--pc-font-display)] text-4xl font-semibold tabular-nums tracking-tight">
          {profile.engagementScore}
        </p>
      </div>
      <Badge variant={TIER_BADGE[profile.engagementTier]}>
        {ENGAGEMENT_TIER_LABEL[profile.engagementTier]}
      </Badge>
    </div>
  );
}

function EngagementStats({ profile }: { profile: Member360Profile }) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {[
        { label: "Events", value: String(profile.totals.events) },
        { label: "Orders", value: String(profile.totals.orders) },
        { label: "Giving", value: formatUsd(profile.totals.donationsCents) },
        { label: "CE credits", value: String(profile.totals.ceCredits) },
      ].map((s) => (
        <div key={s.label} className="pc-stat-card">
          <p className="pc-stat-label">{s.label}</p>
          <p className="pc-stat-value">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function EngagementBadges({ badges }: { badges: { code: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.code}
          className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1 text-xs font-semibold text-[var(--pc-text)] backdrop-blur"
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
