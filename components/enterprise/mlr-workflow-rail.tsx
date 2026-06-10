import { CREATIVE_STATES } from "@/lib/compliance-ops";

const STATE_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  MLR_APPROVED: "MLR approved",
  LOCKED: "Locked",
  TRAFFICKED: "Trafficked",
  LIVE: "Live",
  RETIRED: "Retired",
};

/** Visual MLR lifecycle rail — reference + highlight current creative state. */
export function MlrWorkflowRail({ currentState }: { currentState?: string }) {
  const activeIndex = currentState
    ? CREATIVE_STATES.indexOf(currentState as (typeof CREATIVE_STATES)[number])
    : -1;

  return (
    <ol className="pp-mlr-rail" aria-label="Creative MLR lifecycle">
      {CREATIVE_STATES.map((state, index) => {
        const complete = activeIndex >= 0 && index < activeIndex;
        const current = state === currentState;
        return (
          <li
            key={state}
            className={`pp-mlr-rail__step${complete ? " is-complete" : ""}${current ? " is-current" : ""}`}
          >
            <span className="pp-mlr-rail__marker" aria-hidden />
            <span className="pp-mlr-rail__label">{STATE_LABELS[state] ?? state}</span>
          </li>
        );
      })}
    </ol>
  );
}
