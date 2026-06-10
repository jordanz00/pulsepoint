import Link from "next/link";
import { LEADERSHIP_LOOP_STEPS, leadershipLoopTotalMinutes } from "@/lib/leadership-loop";
import { FlagshipHubShell } from "./flagship-hub-shell";
import type { FlagshipFeatureStat } from "@/lib/flagship-features";

export function FlagshipBoardHub({
  orgSlug,
  stat,
}: {
  orgSlug: string;
  stat: FlagshipFeatureStat;
}) {
  const totalMin = leadershipLoopTotalMinutes();

  return (
    <FlagshipHubShell featureId="board-briefing-pack" orgSlug={orgSlug} stat={stat}>
      <section className="pp-board-pack-leadership glass pp-glass-surface">
        <div className="pp-board-pack-leadership__head">
          <div>
            <h2 className="pp-demo-panel-title">Board pack + leadership close</h2>
            <p className="pp-demo-panel-sub">
              Printable HTML export from Insights — pair with the {totalMin}-minute leadership loop
              after the board reviews KPIs.
            </p>
          </div>
          <Link href={`/${orgSlug}/insights/board-pack`} className="pc-btn-primary text-sm">
            Open board pack
          </Link>
        </div>
        <ol className="pp-board-pack-leadership__steps">
          {LEADERSHIP_LOOP_STEPS.slice(0, 3).map((step) => (
            <li key={step.id}>
              <Link
                href={`/${orgSlug}${step.path}`}
                className="pp-board-pack-leadership__link"
              >
                <span className="pp-board-pack-leadership__num">{step.order}</span>
                <span>
                  <strong>{step.title}</strong> — {step.pitch}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </FlagshipHubShell>
  );
}
