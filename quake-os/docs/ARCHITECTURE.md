# Quake OS — System Architecture

**Version:** 1.0.0  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Mission:** Autonomous multi-agent organization that continuously researches, plans, builds, audits, tests, documents, and improves PulsePoint AMS.

---

## Layer model

```
┌─────────────────────────────────────────────────────────────┐
│  Quake OS (this package)                              │
│  orchestrator · memory · knowledge-graph · workflows        │
│  task · research · audit · planning · improvement engines   │
└──────────────────────────┬──────────────────────────────────┘
                           │ dispatches agents, persists state
┌──────────────────────────▼──────────────────────────────────┐
│  Cursor agents (.cursor/agents/quake-os-*.md)            │
│  Human + AI execution layer                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ implements features
┌──────────────────────────▼──────────────────────────────────┐
│  PulsePoint AMS (Next.js app at repo root)                  │
│  apps: admin · portal · api · marketing                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory map

| Path | Role |
|------|------|
| `quake-os/core/` | Types, engines, registry, communication |
| `quake-os/orchestrator/` | Wave runner, scheduler, daily cycle |
| `quake-os/core/workflow-engine.ts` | Executes `workflows/*.json` via service registry |
| `quake-os/core/backlog-engine.ts` | Self-generating backlog (legacy, AMS, research, audits) |
| `quake-os/agents/services/` | 12 independent agent services + `service-registry.ts` |
| `quake-os/memory/` | Persistent JSON memory (survives sessions) |
| `quake-os/knowledge-graph/` | Entity relationships + feature map |
| `quake-os/workflows/` | Scheduled + triggered workflow definitions |
| `quake-os/agents/` | Agent manifests (role, I/O, metrics) |
| `quake-os/apps/` | AMS surface boundaries (links to repo app) |
| `quake-os/tests/` | OS unit tests |
| `quake-os/scripts/` | CLI: `os-run`, `os-scheduler`, `os-research` |
| `data/quake-os/` | Legacy registries (bridged by memory store) |

---

## Core primitives

| Type | Purpose |
|------|---------|
| `AgentMessage` | Agent-to-agent communication |
| `AgentTask` | Backlog item with acceptance criteria |
| `AgentDecision` | Executive / architecture decisions (ADR) |
| `AgentAudit` | Audit findings with verdict |
| `AgentResearch` | Research summaries + sources |
| `AgentRecommendation` | Actionable proposals |

---

## Engines

| Engine | File | Cadence |
|--------|------|---------|
| **Task** | `core/task-engine.ts` | On demand + auto from research |
| **Research** | `core/research-engine.ts` | Daily workflow |
| **Audit** | `core/audit-engine.ts` | Per feature completion |
| **Planning** | `core/planning-engine.ts` | Phase 2 waves |
| **Improvement** | `core/improvement-engine.ts` | Post-ship reviews |
| **Backlog** | `core/backlog.ts` | Unified task queue |

---

## Continuous improvement loop

Every completed feature triggers (workflow: `workflows/feature-complete.json`):

1. Research review  
2. Architecture review  
3. QA review  
4. Security review  
5. Audit review  
6. Optimization review  
7. Documentation update  
8. Analytics review  

Only when all reviews pass → task marked `done`.

---

## Memory persistence

| Store | Path | Categories |
|-------|------|------------|
| **Knowledge SQLite** | `knowledge/*.db` | research, requirements, lessons, competitors, roadmap, decisions |
| **JSON memory** | `quake-os/memory/<category>/` | tasks, audits, messages, recommendations |
| **Index** | `quake-os/memory/index.json` | Searchable metadata for all writes |

```
knowledge/
├── research.db
├── requirements.db
├── lessons.db
├── competitors.db
├── roadmap.db
└── decisions.db
```

```bash
pnpm quake:knowledge:migrate   # import JSON → SQLite
pnpm quake:knowledge:status    # row counts
```

Legacy bridge: reads `data/quake-os/improvement-backlog.json`, `competitive-intel.json`.

---

## Security invariants (AMS)

- Tenant isolation: `getOrgDb(orgId)` — no cross-org queries  
- Capabilities: `requireCapability()` on mutations  
- Query caps: `lib/query-limits.ts`  
- No invented stats in product UI  
- Gates: `pnpm quake:gates`

---

## AgentOrchestrator (daily cycle)

```typescript
import { AgentOrchestrator } from "@/quake-os/orchestrator/agent-orchestrator";

const orchestrator = new AgentOrchestrator();
orchestrator.runDailyCycle();
// Research → Architecture → Product → Developer → QA → Auditor
```

## Daily scheduler (Python-style)

```typescript
import { schedule } from "@/quake-os/orchestrator/schedule";
import { AgentOrchestrator } from "@/quake-os/orchestrator/agent-orchestrator";

const orchestrator = new AgentOrchestrator();
schedule.every().day.do(orchestrator.runDailyCycle.bind(orchestrator), "daily-cycle");
```

Default jobs live in `orchestrator/scheduled-jobs.ts`. CI runs `pnpm quake:os:scheduler` daily via `.github/workflows/quake-os-daily.yml`.

| Step | Agent | Module |
|------|-------|--------|
| 1 | ResearchAgent | `agents/services/research-agent.ts` |
| 2 | ArchitectureAgent | `agents/services/architecture-agent.ts` |
| 3 | ProductAgent | `agents/services/product-agent.ts` |
| 4 | DeveloperAgent | `agents/services/developer-agent.ts` |
| 5 | QAAgent | `agents/services/qa-agent.ts` |
| 6 | AuditorAgent | `agents/services/auditor-agent.ts` |

## CLI

```bash
pnpm quake:os              # status + memory summary
pnpm quake:os:daily        # full daily agent cycle
pnpm quake:os:wave         # run orchestrated wave
pnpm quake:os:research     # research only
pnpm quake:os:scheduler    # run due scheduled jobs (daily cycle, research, weekly wave)
```

---

## Agent organization

26+ agents in `agents/registry.json`. Each agent folder contains `manifest.json` (machine) + `AGENT.md` (human/Cursor).

See `docs/OS-MASTER-DIRECTIVE.md` for full organizational charter.
