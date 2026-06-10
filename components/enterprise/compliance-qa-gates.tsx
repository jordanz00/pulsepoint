/** Audience · Budget · Creative/MLR QA gate presentation for ad campaigns. */

export function ComplianceQaGates({
  audienceQaAt,
  budgetQaAt,
  creativeQaAt,
  audiencePassed,
  budgetPassed,
  creativePassed,
  compact = false,
}: {
  audienceQaAt?: string | null;
  budgetQaAt?: string | null;
  creativeQaAt?: string | null;
  audiencePassed?: boolean;
  budgetPassed?: boolean;
  creativePassed?: boolean;
  compact?: boolean;
}) {
  const gates = [
    {
      id: "audience",
      label: "Audience QA",
      passed: audiencePassed ?? Boolean(audienceQaAt),
      at: audienceQaAt,
    },
    {
      id: "budget",
      label: "Budget QA",
      passed: budgetPassed ?? Boolean(budgetQaAt),
      at: budgetQaAt,
    },
    {
      id: "creative",
      label: "Creative / MLR QA",
      passed: creativePassed ?? Boolean(creativeQaAt),
      at: creativeQaAt,
    },
  ] as const;

  return (
    <ul className={`pp-qa-gates${compact ? " pp-qa-gates--compact" : ""}`} aria-label="QA approval gates">
      {gates.map((gate) => (
        <li
          key={gate.id}
          className={`pp-qa-gates__gate${gate.passed ? " is-passed" : " is-pending"}`}
        >
          <span className="pp-qa-gates__icon" aria-hidden>
            {gate.passed ? "✓" : "—"}
          </span>
          <div className="pp-qa-gates__body">
            <span className="pp-qa-gates__label">{gate.label}</span>
            {!compact && gate.at ? (
              <time className="pp-qa-gates__time" dateTime={gate.at}>
                {new Date(gate.at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            ) : null}
            {!compact && !gate.passed ? (
              <span className="pp-qa-gates__pending-label">Pending review</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
