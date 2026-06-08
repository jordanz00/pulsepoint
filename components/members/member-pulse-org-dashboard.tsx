"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recomputeOrgMemberPulse } from "@/app/actions/member-pulse";
import { MemberPulseDimensionBar } from "@/components/members/member-pulse-gauge";
import { MEMBER_PULSE_DIMENSION_META, MEMBER_PULSE_DIMENSION_IDS } from "@/lib/member-pulse/constants";
import type { MemberPulseOrgSummary } from "@/lib/member-pulse/types";
import { ENGAGEMENT_TIER_LABEL, type EngagementTier } from "@/lib/engagement-score";

export function MemberPulseOrgDashboard({
  orgSlug,
  summary,
}: {
  orgSlug: string;
  summary: MemberPulseOrgSummary;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {summary.totalMembers} members · averages from computed MemberPulse snapshots
        </p>
        <button
          type="button"
          className="pc-btn-primary text-sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await recomputeOrgMemberPulse(orgSlug);
              router.refresh();
            })
          }
        >
          {pending ? "Recomputing…" : "Recompute all MemberPulse"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {MEMBER_PULSE_DIMENSION_IDS.map((id) => (
          <div key={id} className="pc-stat-chip">
            <p className="text-xs text-zinc-500">{MEMBER_PULSE_DIMENSION_META[id].label}</p>
            <p className="text-2xl font-semibold">{summary.averages[id]}</p>
            <p className="mt-1 text-xs text-zinc-400">avg score</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="pc-card p-5">
          <h2 className="pc-section-title">Dimension averages</h2>
          <div className="mt-4 space-y-4">
            {MEMBER_PULSE_DIMENSION_IDS.map((id) => (
              <MemberPulseDimensionBar
                key={id}
                label={MEMBER_PULSE_DIMENSION_META[id].label}
                score={summary.averages[id]}
                accent={MEMBER_PULSE_DIMENSION_META[id].accent}
              />
            ))}
          </div>
        </div>

        <div className="pc-card p-5">
          <h2 className="pc-section-title">Overall tiers</h2>
          <ul className="mt-4 space-y-2">
            {(Object.keys(summary.tierCounts) as EngagementTier[]).map((t) => (
              <li key={t} className="flex justify-between text-sm">
                <span>{ENGAGEMENT_TIER_LABEL[t]}</span>
                <span className="font-semibold">{summary.tierCounts[t]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pc-card p-5">
        <h2 className="pc-section-title">Engagement champions</h2>
        <ul className="mt-4 divide-y divide-[var(--pc-border)]">
          {summary.topChampions.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <Link href={`/${orgSlug}/members/${m.id}`} className="font-medium text-[var(--pc-brand)]">
                {m.firstName} {m.lastName}
              </Link>
              <span className="text-lg font-bold text-zinc-800">{m.overall}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pc-card p-5">
        <h2 className="pc-section-title">What MemberPulse measures</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {MEMBER_PULSE_DIMENSION_IDS.map((id) => (
            <div key={id}>
              <dt className="font-medium text-zinc-900">{MEMBER_PULSE_DIMENSION_META[id].label}</dt>
              <dd className="mt-1 text-sm text-zinc-600">
                {MEMBER_PULSE_DIMENSION_META[id].description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
