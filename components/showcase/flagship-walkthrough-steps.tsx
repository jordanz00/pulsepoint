import Link from "next/link";
import {
  FLAGSHIP_WALKTHROUGH_STEPS,
  flagshipWalkthroughDemoHref,
  flagshipWalkthroughHubHref,
  flagshipWalkthroughPageHref,
  flagshipWalkthroughTotalMinutes,
  getFlagshipWalkthroughStep,
  type FlagshipWalkthroughStatus,
} from "@/lib/flagship-walkthrough";

function statusBadge(status: FlagshipWalkthroughStatus) {
  if (status === "live") return <span className="badge-live">Live</span>;
  if (status === "alpha") return <span className="badge-alpha">Alpha</span>;
  return <span className="badge-alpha">Demo preview</span>;
}

export function FlagshipWalkthroughSteps({
  orgSlug,
  activeIndex,
}: {
  orgSlug: string;
  activeIndex: number;
}) {
  const active = getFlagshipWalkthroughStep(activeIndex);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
      <nav aria-label="Flagship walkthrough steps">
        <p className="text-sm font-medium text-[var(--pc-text-secondary)]">
          Step {activeIndex + 1} of {FLAGSHIP_WALKTHROUGH_STEPS.length}
        </p>
        <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">
          Sales script ~{flagshipWalkthroughTotalMinutes()} min
        </p>
        <ol className="mt-3 space-y-1">
          {FLAGSHIP_WALKTHROUGH_STEPS.map((st) => {
            const isActive = st.index === activeIndex;
            return (
              <li key={st.id}>
                <Link
                  href={flagshipWalkthroughPageHref(orgSlug, st.index)}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-[var(--pc-accent-soft)] font-semibold text-[var(--pc-text)]"
                      : "text-[var(--pc-text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className="tabular-nums opacity-70">{st.index + 1}.</span>
                  <span>{st.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="pc-simple-hero glass pp-glass-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="pp-eyebrow">{active.module}</p>
          {statusBadge(active.status)}
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{active.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--pc-text-secondary)]">
          {active.talkTrack}
        </p>
        <ul className="mt-4 list-inside list-disc text-sm text-[var(--pc-text-secondary)]">
          {active.show.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--pc-text-tertiary)]">
          ~{active.durationMin} min · Open hub for narrative, then jump to live demo.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={flagshipWalkthroughHubHref(orgSlug, active)}
            className="pc-btn-primary text-sm"
          >
            Open hub
          </Link>
          <Link
            href={flagshipWalkthroughDemoHref(orgSlug, active)}
            className="pc-btn-secondary text-sm"
          >
            Jump to demo
          </Link>
          {activeIndex < FLAGSHIP_WALKTHROUGH_STEPS.length - 1 ? (
            <Link
              href={flagshipWalkthroughPageHref(orgSlug, activeIndex + 1)}
              className="pc-btn-secondary text-sm"
            >
              Next stop →
            </Link>
          ) : (
            <Link href={`/${orgSlug}/flagship`} className="pc-btn-secondary text-sm">
              Back to flagship hub
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
