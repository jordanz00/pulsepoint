import Link from "next/link";
import type { PilotSetupChecklist } from "@/lib/onboarding/pilot-setup-checklist";

export function PilotSetupChecklist({
  checklist,
}: {
  checklist: PilotSetupChecklist;
}) {
  if (!checklist.showChecklist) return null;

  const pct = Math.round(
    (checklist.completedRequired / checklist.requiredTotal) * 100,
  );

  return (
    <section className="pilot-setup" aria-labelledby="pilot-setup-heading">
      <div className="pilot-setup__head">
        <div>
          <h2 id="pilot-setup-heading" className="pilot-setup__title">
            Pilot setup
          </h2>
          <p className="pilot-setup__lead">
            Complete these steps to go live with MemberCore and Events.
          </p>
        </div>
        <p className="pilot-setup__progress" aria-live="polite">
          {checklist.completedRequired} of {checklist.requiredTotal} required
          <span className="pilot-setup__progress-pct"> · {pct}%</span>
        </p>
      </div>

      <ol className="pilot-setup__steps">
        {checklist.steps.map((step, index) => (
          <li
            key={step.id}
            className={`pilot-setup__step${step.done ? " pilot-setup__step--done" : ""}${step.required ? "" : " pilot-setup__step--optional"}`}
          >
            <span className="pilot-setup__step-index" aria-hidden>
              {step.done ? "✓" : index + 1}
            </span>
            <div className="pilot-setup__step-body">
              <p className="pilot-setup__step-title">
                {step.title}
                {!step.required ? (
                  <span className="pilot-setup__optional-tag">Recommended</span>
                ) : null}
              </p>
              <p className="pilot-setup__step-detail">{step.detail}</p>
            </div>
            {step.done ? (
              <span className="pilot-setup__step-status">Done</span>
            ) : (
              <Link href={step.href} className="pilot-setup__step-action">
                Open
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
