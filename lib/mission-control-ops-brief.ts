import type { QuakeMissionControlData } from "@/lib/quake-mission-control";

export type MissionControlOpsCard = {
  id: string;
  question: string;
  answer: string;
};

/** Build five-question operator brief from real Quake telemetry. */
export function buildMissionControlOpsCards(data: QuakeMissionControlData): MissionControlOpsCard[] {
  const { os, backlog, recentWaves, workflow, build } = data;
  const lastWave = recentWaves[0];
  const nextPhase = workflow.phases.find((p) => p.id === "gates") ?? workflow.phases[0];
  const approvalPct = os.audits.total
    ? Math.round((os.audits.approved / os.audits.total) * 100)
    : 0;

  return [
    {
      id: "happening",
      question: "What is happening?",
      answer: `${backlog.done} of ${backlog.total} backlog items shipped · ${build.testFileCount} test files · audit approval ${approvalPct}%`,
    },
    {
      id: "attention",
      question: "What needs attention?",
      answer:
        os.tasks.pending > 0
          ? `${os.tasks.pending} open Quake tasks · review pending backlog items`
          : "No open Quake tasks — run gates before the next demo",
    },
    {
      id: "blocked",
      question: "What is blocked?",
      answer:
        backlog.openHuman.length > 0
          ? backlog.openHuman.join(" · ")
          : "No human-only gates blocking ship (pilot ops may still apply)",
    },
    {
      id: "changed",
      question: "What changed?",
      answer: lastWave
        ? `Latest wave: ${lastWave.title} (${lastWave.date})`
        : "No wave logs yet — run pnpm quake:os:wave after a ship pass",
    },
    {
      id: "next",
      question: "What should happen next?",
      answer: `${nextPhase?.label ?? "Verify"} — ${nextPhase?.command ?? "pnpm quake:gates"}`,
    },
  ];
}
