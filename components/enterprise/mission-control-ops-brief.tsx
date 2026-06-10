import { buildMissionControlOpsCards } from "@/lib/mission-control-ops-brief";
import type { QuakeMissionControlData } from "@/lib/quake-mission-control";

/**
 * Mission control — five executive questions (Dashboard Commander / Sprint 2).
 * Uses real Quake OS telemetry only; no fabricated ops data.
 */
export function MissionControlOpsBrief({ data }: { data: QuakeMissionControlData }) {
  const cards = buildMissionControlOpsCards(data);

  return (
    <section className="pp-ops-brief" aria-labelledby="pp-mc-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Operator briefing</p>
        <h2 id="pp-mc-ops-brief-title" className="pp-ops-brief__title">
          Five questions every mission control answers
        </h2>
      </header>
      <ol className="pp-ops-brief__grid">
        {cards.map((card, index) => (
          <li key={card.id} className="pp-ops-brief__card glass pp-glass-surface">
            <span className="pp-ops-brief__num">{index + 1}</span>
            <h3 className="pp-ops-brief__question">{card.question}</h3>
            <p className="pp-ops-brief__answer">{card.answer}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
