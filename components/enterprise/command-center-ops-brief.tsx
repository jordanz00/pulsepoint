import Link from "next/link";
import {
  buildCommandCenterOpsCards,
  buildCommandCenterOperatorPanels,
  type CommandCenterOpsSnapshot,
} from "@/lib/command-center-ops";
import type { CeoCommandCenterData } from "@/lib/ceo-command-center-data";

export function CommandCenterOpsBrief({
  data,
  ops,
  orgSlug,
}: {
  data: CeoCommandCenterData;
  ops: CommandCenterOpsSnapshot;
  orgSlug: string;
}) {
  const cards = buildCommandCenterOpsCards(data, ops, orgSlug);

  return (
    <section className="pp-ops-brief" aria-labelledby="pp-cc-ops-brief-title">
      <header className="pp-ops-brief__head">
        <p className="pp-ops-brief__eyebrow">Executive briefing</p>
        <h2 id="pp-cc-ops-brief-title" className="pp-ops-brief__title">
          Five questions this command center answers
        </h2>
      </header>
      <ol className="pp-ops-brief__grid">
        {cards.map((card, index) => (
          <li
            key={card.id}
            className={`pp-ops-brief__card glass pp-glass-surface pp-ops-brief__card--${card.tone ?? "neutral"}`}
          >
            <span className="pp-ops-brief__num">{index + 1}</span>
            <h3 className="pp-ops-brief__question">{card.question}</h3>
            <p className="pp-ops-brief__answer">{card.answer}</p>
            {card.href ? (
              <Link href={card.href} className="pp-ops-brief__link">
                Open →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CommandCenterOperatorPanels({
  ops,
  orgSlug,
}: {
  ops: CommandCenterOpsSnapshot;
  orgSlug: string;
}) {
  const panels = buildCommandCenterOperatorPanels(ops, orgSlug);

  return (
    <section className="pp-cc-operator" aria-label="Operator status">
      {panels.map((panel) => (
        <Link
          key={panel.id}
          href={panel.href}
          className={`pp-cc-operator__panel glass pp-glass-surface pp-cc-operator__panel--${panel.status}`}
        >
          <p className="pp-cc-operator__title">{panel.title}</p>
          <p className="pp-cc-operator__value">{panel.value}</p>
          <p className="pp-cc-operator__detail">{panel.detail}</p>
        </Link>
      ))}
    </section>
  );
}
