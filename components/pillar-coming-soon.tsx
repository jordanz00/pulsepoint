import Link from "next/link";
import type { FeaturePillar } from "@/lib/feature-pillars";

export function PillarComingSoon({
  pillar,
  orgSlug,
}: {
  pillar: FeaturePillar;
  orgSlug: string;
}) {
  return (
    <div className="mx-auto max-w-lg pc-card p-8 text-center">
      <p className="text-sm font-medium text-sky-600">{pillar.title}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">On the roadmap</h1>
      <p className="mt-2 text-slate-600">{pillar.description}</p>
      <p className="mt-4 text-sm text-slate-500">
        PulsePoint is modular—{pillar.title} will ship as part of the platform
        rollout after MemberCore and PulsePoint Events.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={`/${orgSlug}/members`} className="pc-btn-primary">
          MemberCore
        </Link>
        <Link href={`/${orgSlug}/events`} className="pc-btn-secondary">
          PulsePoint Events
        </Link>
      </div>
    </div>
  );
}
