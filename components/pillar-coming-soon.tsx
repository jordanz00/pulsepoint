import Link from "next/link";
import type { FeaturePillar } from "@/lib/feature-pillars";

export function PillarComingSoon({
  pillar,
  orgSlug,
}: {
  pillar: FeaturePillar;
  orgSlug: string;
}) {
  const alphaHref =
    pillar.status === "alpha" && pillar.path ? `/${orgSlug}/${pillar.path}` : null;

  return (
    <div className="mx-auto max-w-lg pc-card p-8 text-center">
      <p className="text-sm font-medium text-sky-600">{pillar.title}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        {alphaHref ? "Alpha — click through in demo" : "On the roadmap"}
      </h1>
      <p className="mt-2 text-slate-600">{pillar.description}</p>
      <p className="mt-4 text-sm text-slate-500">
        {alphaHref
          ? `PulsePoint ${pillar.title} has real admin UI and sample data. It is labeled alpha until the same operational gates as MemberCore.`
          : `PulsePoint is modular—${pillar.title} will ship after MemberCore and PulsePoint Events.`}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {alphaHref ? (
          <Link href={alphaHref} className="pc-btn-primary">
            Open {pillar.title}
          </Link>
        ) : null}
        <Link href={`/${orgSlug}/members`} className="pc-btn-secondary">
          MemberCore
        </Link>
        <Link href={`/${orgSlug}/events`} className="pc-btn-secondary">
          PulsePoint Events
        </Link>
      </div>
    </div>
  );
}
