import Link from "next/link";
import {
  LEADERSHIP_LOOP_STEPS,
  leadershipLoopHref,
  leadershipLoopStat,
  leadershipLoopTotalMinutes,
  type LeadershipLoopContext,
} from "@/lib/leadership-loop";

export function LeadershipLoopPanel({
  orgSlug,
  context,
  variant = "default",
}: {
  orgSlug: string;
  context: LeadershipLoopContext;
  variant?: "default" | "compact";
}) {
  const totalMin = leadershipLoopTotalMinutes();

  return (
    <section
      className={`leadership-loop glass pp-glass-surface${variant === "compact" ? " leadership-loop--compact" : ""}`}
      aria-labelledby="leadership-loop-title"
    >
      <header className="leadership-loop__head">
        <div>
          <p className="leadership-loop__eyebrow">Executive leadership loop</p>
          <h2 id="leadership-loop-title" className="leadership-loop__title">
            {variant === "compact" ? "15-minute CEO briefing" : "Morning leadership briefing"}
          </h2>
          <p className="leadership-loop__lead">
            Six stops — membership proof, advocacy story, workforce, renewals, board close.{" "}
            <strong>{totalMin} min</strong> scripted path with live data.
          </p>
        </div>
        <Link
          href={`/${orgSlug}/leadership?walkthrough=1`}
          className="pc-btn-primary text-sm leadership-loop__start"
        >
          Start briefing →
        </Link>
      </header>

      <ol className="leadership-loop__grid">
        {LEADERSHIP_LOOP_STEPS.map((step) => (
          <li key={step.id}>
            <Link
              href={leadershipLoopHref(orgSlug, step.path)}
              className="leadership-loop__card"
            >
              <span className="leadership-loop__step-num">{step.order}</span>
              <div className="leadership-loop__card-body">
                <div className="leadership-loop__card-top">
                  <span className="leadership-loop__module">{step.module}</span>
                  <span className={step.status === "live" ? "badge-live" : "badge-alpha"}>
                    {step.status}
                  </span>
                </div>
                <h3 className="leadership-loop__card-title">{step.title}</h3>
                <p className="leadership-loop__stat">{leadershipLoopStat(step.id, context)}</p>
                <p className="leadership-loop__pitch">{step.pitch}</p>
                <span className="leadership-loop__cta">
                  Open step · {step.durationMin} min →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
