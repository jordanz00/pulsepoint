import Link from "next/link";
import { LEADERSHIP_LOOP_STEPS, leadershipLoopTotalMinutes } from "@/lib/leadership-loop";

export function BoardPackLeadershipBanner({ orgSlug }: { orgSlug: string }) {
  const totalMin = leadershipLoopTotalMinutes();

  return (
    <section className="pp-board-pack-leadership glass pp-glass-surface">
      <div className="pp-board-pack-leadership__head">
        <div>
          <p className="pp-eyebrow">After the board pack</p>
          <h2 className="pp-demo-panel-title">Leadership loop — {totalMin}-minute follow-up</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Six live-stat stops from command center to advocacy, workforce, renewals, and back to
            board export. Included in printable HTML download.
          </p>
        </div>
        <Link href={`/${orgSlug}/leadership?walkthrough=1`} className="pc-btn-primary text-sm">
          Start leadership loop →
        </Link>
      </div>
      <ol className="pp-board-pack-leadership__steps">
        {LEADERSHIP_LOOP_STEPS.map((step) => (
          <li key={step.id}>
            <Link href={`/${orgSlug}${step.path}?walkthrough=1`} className="pp-board-pack-leadership__link">
              <span className="pp-board-pack-leadership__num">{step.order}</span>
              <span>
                <strong>{step.title}</strong>
                <span className="text-xs text-[var(--fg-muted)]"> · {step.durationMin} min</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
