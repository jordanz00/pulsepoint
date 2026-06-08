"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recomputeMemberPulse } from "@/app/actions/member-pulse";
import { MemberPulseGauge, MemberPulseDimensionBar } from "@/components/members/member-pulse-gauge";
import { MEMBER_PULSE_DIMENSION_META } from "@/lib/member-pulse/constants";
import type { MemberPulseSnapshot } from "@/lib/member-pulse/types";
import type { EngagementTier } from "@/lib/engagement-score";

export function MemberPulsePanel({
  orgSlug,
  memberId,
  pulse,
}: {
  orgSlug: string;
  memberId: string;
  pulse: MemberPulseSnapshot | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!pulse) {
    return (
      <section className="pc-glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold">MemberPulse</h2>
        <p className="mt-2 text-sm text-zinc-500">Engagement not computed yet.</p>
        <button
          type="button"
          className="pc-btn-primary mt-4 text-sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await recomputeMemberPulse(orgSlug, memberId);
              router.refresh();
            })
          }
        >
          Compute MemberPulse
        </button>
      </section>
    );
  }

  return (
    <section id="member-pulse" className="pc-glass-panel overflow-hidden rounded-xl">
      <div className="border-b border-[var(--pc-border)] bg-gradient-to-br from-sky-50/80 to-white px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-brand)]">
              MemberPulse
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Engagement across your association, comms, advocacy, board, and events.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Updated {new Date(pulse.computedAt).toLocaleString()}
            </p>
          </div>
          <MemberPulseGauge
            score={pulse.overall}
            tier={pulse.overallTier as EngagementTier}
            size="lg"
          />
        </div>
        <button
          type="button"
          className="pc-btn-secondary mt-4 text-xs"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await recomputeMemberPulse(orgSlug, memberId);
              router.refresh();
            })
          }
        >
          {pending ? "Refreshing…" : "Refresh MemberPulse"}
        </button>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {pulse.dimensions.map((d) => (
          <div key={d.id} className="rounded-xl border border-[var(--pc-border)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">{d.label}</h3>
              <span className="text-lg font-bold text-zinc-800">{d.score}</span>
            </div>
            <MemberPulseDimensionBar
              label={d.label}
              score={d.score}
              accent={MEMBER_PULSE_DIMENSION_META[d.id].accent}
            />
            <p className="mt-3 text-sm text-zinc-600">{d.summary}</p>
            {d.highlights.length > 0 ? (
              <ul className="mt-2 list-disc pl-4 text-xs text-zinc-500">
                {d.highlights.slice(0, 3).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {d.metrics.map((m) => (
                <div key={m.key}>
                  <dt className="text-zinc-400">{m.label}</dt>
                  <dd className="font-medium text-zinc-700">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--pc-border)] bg-zinc-50/80 px-6 py-3 text-xs text-zinc-500">
        <Link href={`/${orgSlug}/members/pulse`} className="text-[var(--pc-brand)]">
          Org-wide MemberPulse dashboard →
        </Link>
      </div>
    </section>
  );
}
