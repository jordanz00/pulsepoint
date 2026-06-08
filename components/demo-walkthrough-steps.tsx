import Link from "next/link";
import {
  PORTFOLIO_WALKTHROUGH_STEPS,
  WALKTHROUGH_STEPS,
  getWalkthroughStep,
  portfolioWalkthroughMinutes,
  walkthroughModuleHref,
  walkthroughPageHref,
  walkthroughTotalMinutes,
  type WalkthroughStepStatus,
} from "@/lib/demo-walkthrough";

function statusBadge(status: WalkthroughStepStatus) {
  if (status === "live") return <span className="badge-live">Live</span>;
  if (status === "alpha") return <span className="badge-alpha">Alpha</span>;
  return <span className="badge-roadmap">Partial</span>;
}

export function DemoWalkthroughSteps({
  orgSlug,
  activeIndex,
  simple = false,
}: {
  orgSlug: string;
  activeIndex: number;
  simple?: boolean;
}) {
  const active = getWalkthroughStep(activeIndex);

  return (
    <div className={simple ? "space-y-8" : "grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr]"}>
      <nav aria-label="Tour steps">
        <p className="text-sm font-medium text-[var(--pc-text-secondary)]">
          Step {activeIndex + 1} of {WALKTHROUGH_STEPS.length}
        </p>
        <p className="mt-1 text-xs text-[var(--pc-text-tertiary)]">
          Full tour ~{walkthroughTotalMinutes()} min · Portfolio highlights ~{portfolioWalkthroughMinutes()} min
        </p>
        <ol className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
          {WALKTHROUGH_STEPS.map((st) => {
            const isActive = st.index === activeIndex;
            return (
              <li key={st.id}>
                <Link
                  href={walkthroughPageHref(orgSlug, st.index)}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-[var(--pc-accent-soft)] font-semibold text-[var(--pc-text)]"
                      : "text-[var(--pc-text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className="tabular-nums opacity-70">{st.index + 1}.</span>
                  <span className="min-w-0 flex-1">
                    {st.title}
                    {st.portfolioHighlight ? (
                      <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-brand)]">
                        ★
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-[var(--pc-text-tertiary)]">
          ★ = 15-min portfolio script ({PORTFOLIO_WALKTHROUGH_STEPS.length} stops)
        </p>
      </nav>

      <article className="pc-simple-hero glass pp-glass-surface p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="pp-eyebrow">{active.module}</p>
          {statusBadge(active.status)}
          {active.portfolioHighlight ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent-brand)]">
              Portfolio stop
            </span>
          ) : null}
        </div>
        <h2 className="pc-simple-hero-title mt-2">{active.title}</h2>
        <p className="mt-1 text-sm text-[var(--pc-text-tertiary)]">
          ~{active.durationMin} min on this screen
        </p>
        <p className="pc-simple-hero-lead mt-4">{active.talkTrack}</p>

        {active.show.length > 0 ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--pc-text-tertiary)]">
              What to show
            </h3>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {active.show.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-[var(--ios-hairline-dim)] bg-white/40 px-3 py-2 text-sm text-[var(--pc-text-secondary)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {activeIndex > 0 ? (
            <Link
              href={walkthroughPageHref(orgSlug, activeIndex - 1)}
              className="pc-btn-secondary"
            >
              Previous
            </Link>
          ) : null}
          <Link
            href={walkthroughModuleHref(orgSlug, active.path, { guided: true })}
            className="pc-btn-secondary"
          >
            Open this screen
          </Link>
          {activeIndex < WALKTHROUGH_STEPS.length - 1 ? (
            <Link
              href={walkthroughPageHref(orgSlug, activeIndex + 1)}
              className="pc-btn-primary"
            >
              Next step
            </Link>
          ) : (
            <Link href={`/${orgSlug}`} className="pc-btn-primary">
              Finish tour
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
