# Quake OS — Autonomous Agent Operating System

Quake OS manages the PulsePoint AMS roadmap through persistent memory, agent orchestration, self-generating backlogs, audit workflows, research pipelines, and scheduled daily improvement loops.

**Framework first.** AMS product code lives in the parent repo (`app/`, `lib/`). Quake OS coordinates agents — it does not auto-write production features without Cursor/human execution.

## Architecture

```
schedule.every().day.do(orchestrator.runDailyCycle)
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│ AgentOrchestrator                                         │
│  refreshBacklog → runWorkflow("daily-cycle")              │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────┐   ┌──────────────┐   ┌─────────────────────┐
│ Workflow    │──▶│ Service      │──▶│ Shared memory       │
│ Engine      │   │ Registry     │   │ JSON + SQLite /knowledge │
└─────────────┘   └──────────────┘   └─────────────────────┘
```

## Subsystems

| System | Path | Role |
|--------|------|------|
| Orchestrator | `orchestrator/` | Daily cycle, waves, scheduler |
| Agent services | `agents/services/` | 12 independent services + registry |
| Workflow engine | `core/workflow-engine.ts` | Executes `workflows/*.json` |
| Backlog engine | `core/backlog-engine.ts` | Self-generating tasks from 5 sources |
| Task engine | `core/task-engine.ts` | Task CRUD, priority pick |
| Research pipeline | `research/` | Search → Analyze → Summarize → Store |
| Discovery pipeline | `core/discovery-pipeline.ts` | Research → Product → Build review |
| Feature review | `core/feature-review-chain.ts` | 6-agent ship gate |
| Gate runner | `core/gate-runner.ts` | Optional `pnpm quake:gates` execution |
| Knowledge | `knowledge/` | SQLite: research, requirements, roadmap, … |
| AMS bridge | `ams/core/` | Module registry → backlog (no feature code) |

## Agent services (registry)

`ceo-agent`, `cto-agent`, `product-agent`, `research-agent`, `healthcare-sme-agent`, `hospital-association-agent`, `compliance-agent`, `architecture-agent`, `developer-agent`, `qa-agent`, `auditor-agent`, `documentation-agent`

Aliases (e.g. `backend-engineer-agent` → `developer-agent`) resolve in `core/agent-registry.ts`.

## CLI

```bash
pnpm quake:os                 # OS status
pnpm quake:os:daily            # Full daily cycle (backlog + workflow)
pnpm quake:os:scheduler        # Run due scheduled jobs
pnpm quake:os:wave             # Continuous improvement wave
pnpm quake:research            # Research pipeline only
pnpm quake:backlog             # Refresh self-generating backlog
pnpm quake:workflow daily-cycle  # Run workflow by id
pnpm quake:discovery           # PAC management discovery pipeline
pnpm quake:feature:review <id> # 6-agent feature review chain
```

## Scheduler

```typescript
import { schedule, runDueJobs } from "@/quake-os/orchestrator/schedule";
import { AgentOrchestrator } from "@/quake-os/orchestrator/agent-orchestrator";

const orchestrator = new AgentOrchestrator();
schedule.every().day.do(() => orchestrator.runDailyCycle(), "daily-cycle");
await runDueJobs();
```

CI: `.github/workflows/quake-os-daily.yml` (07:00 UTC).

## Persistent memory

| Store | Location |
|-------|----------|
| Tasks, messages, audits | `quake-os/memory/*.json` |
| Knowledge (SQLite) | `knowledge/*.db` at repo root |
| Legacy backlog bridge | `data/quake-os/improvement-backlog.json` |
| Roadmap snapshots | `knowledge/roadmap.db` |

## Honest limits

- **DeveloperAgent** writes build plans — Cursor/human implements code
- **Gates** skip unless `QUAKE_OS_RUN_GATES=1`
- **Research** searches local repo corpus — no live web/LLM
- **Human gates** for staging, Entra, Stripe, legal (P0 items marked `human: true`)

## Docs

- `docs/ARCHITECTURE.md` — technical architecture
- `docs/ORG-CHART.md` — 12-agent org chart
- `docs/OS-MASTER-DIRECTIVE.md` — charter
