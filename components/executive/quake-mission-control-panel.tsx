import Link from "next/link";
import type { QuakeMissionControlData } from "@/lib/quake-mission-control";

export function QuakeMissionControlPanel({
  data,
  orgSlug,
  showOperator = false,
}: {
  data: QuakeMissionControlData;
  orgSlug: string;
  showOperator?: boolean;
}) {
  const { os, corporation, divisions, recentExecutions, backlog, recentWaves, build, workflow } = data;
  const approvalPct = os.audits.total
    ? Math.round((os.audits.approved / os.audits.total) * 100)
    : 0;

  return (
    <section className="quake-mission glass pp-glass-surface" aria-labelledby="quake-mission-title">
      <header className="quake-mission__head">
        <div>
          <p className="quake-mission__eyebrow">Quake OS · Mission control</p>
          <h2 id="quake-mission-title" className="quake-mission__title">
            {workflow.name}
          </h2>
          <p className="quake-mission__lead">
            AI corporation — {corporation.divisions} divisions, {corporation.agents} agents,{" "}
            {backlog.done}/{backlog.total} backlog shipped, {build.testFileCount} test files.
          </p>
        </div>
        <span className="badge-live">v{os.version}</span>
      </header>

      <div className="quake-mission__kpis">
        <div className="quake-mission__kpi">
          <span className="quake-mission__kpi-val">{os.tasks.done}</span>
          <span className="quake-mission__kpi-label">Tasks done</span>
        </div>
        <div className="quake-mission__kpi">
          <span className="quake-mission__kpi-val">{os.tasks.pending}</span>
          <span className="quake-mission__kpi-label">Pending</span>
        </div>
        <div className="quake-mission__kpi">
          <span className="quake-mission__kpi-val">{approvalPct}%</span>
          <span className="quake-mission__kpi-label">Audit approval</span>
        </div>
        <div className="quake-mission__kpi">
          <span className="quake-mission__kpi-val">{build.tsFiles}</span>
          <span className="quake-mission__kpi-label">TS modules</span>
        </div>
      </div>

      <div className="quake-mission__divisions">
        <h3 className="quake-mission__subhead">Corporation divisions</h3>
        <ul className="quake-mission__division-list">
          {divisions.map((div) => (
            <li key={div.id} className="quake-mission__division">
              <strong>{div.name}</strong>
              <span className="quake-mission__division-meta">
                Lead: {div.lead} · {div.agentCount} agents · {div.cadence}
              </span>
              <span className="quake-mission__division-mandate">{div.mandate}</span>
            </li>
          ))}
        </ul>
      </div>

      {recentExecutions.length > 0 ? (
        <div className="quake-mission__executions">
          <h3 className="quake-mission__subhead">Recent orchestrations</h3>
          <ul className="quake-mission__wave-list">
            {recentExecutions.map((e) => (
              <li key={`${e.workflowId}-${e.startedAt}`}>
                <time dateTime={e.startedAt}>{e.startedAt.slice(0, 16).replace("T", " ")}</time>
                <span>
                  {e.workflowId} — {e.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="quake-mission__phases">
        <h3 className="quake-mission__subhead">Ship workflow</h3>
        <ol className="quake-mission__phase-list">
          {workflow.phases.map((phase, i) => (
            <li key={phase.id} className="quake-mission__phase">
              <span className="quake-mission__phase-num">{i + 1}</span>
              <div>
                <strong>{phase.label}</strong>
                <code className="quake-mission__cmd">{phase.command}</code>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {recentWaves.length > 0 ? (
        <div className="quake-mission__waves">
          <h3 className="quake-mission__subhead">Recent waves</h3>
          <ul className="quake-mission__wave-list">
            {recentWaves.map((w) => (
              <li key={w.filename}>
                <time dateTime={w.date}>{w.date}</time>
                <span>{w.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {backlog.openHuman.length > 0 && showOperator ? (
        <div className="quake-mission__human">
          <h3 className="quake-mission__subhead">Human gates</h3>
          <ul>
            {backlog.openHuman.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="quake-mission__actions">
        <Link href={`/${orgSlug}/leadership`} className="pc-btn-secondary text-sm">
          Leadership loop
        </Link>
        {showOperator ? (
          <a href="/status-board.html" className="pc-btn-secondary text-sm" target="_blank" rel="noopener noreferrer">
            Static status board
          </a>
        ) : null}
      </div>
    </section>
  );
}
