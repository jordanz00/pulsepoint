# Quake OS — AI Corporation Charter

**Mission:** A self-improving software corporation that continuously researches, plans, builds, audits, and ships PulsePoint AMS to enterprise bar.

**Philosophy:** Carmack-level engineering discipline. Zuckerberg-level velocity through automation. Honest stage labels — no fake backends, no invented stats.

---

## Corporation structure

```
                    ┌─────────────────┐
                    │   Orchestrator   │
                    └────────┬────────┘
                             │
     ┌───────────┬───────────┼───────────┬───────────┬───────────┐
     ▼           ▼           ▼           ▼           ▼           ▼
 Executive   Research     Product   Engineering  Compliance  Industry
 (CEO/CTO)  (Intel)      (PM)      (Dev/Arch/QA) (Sec/Audit) (SME/Hosp)
     │           │           │           │           │           │
     └───────────┴───────────┴─────┬─────┴───────────┴───────────┘
                                   ▼
                            Documentation
```

| Division | Lead | Agents | Cadence |
|----------|------|--------|---------|
| Executive | CEO | CEO, CTO | Daily |
| Research & Intelligence | Research | Research | Daily |
| Product | Product | Product | Daily |
| Engineering | Developer | Developer, Architecture, QA | Daily |
| Compliance & Audit | Compliance | Compliance, Auditor | Continuous |
| Industry Expertise | Healthcare SME | SME, Hospital Association | Weekly |
| Documentation | Documentation | Documentation | Continuous |

Machine registry: `quake-os/core/corporation.ts`  
Cursor agents: `.cursor/agents/quake-os-*.md` (26+ specialists)

---

## Corporation cycle

The full corporation runs via `CorporationOrchestrator`:

```
1. Backlog refresh (legacy + AMS + research + audits)
2. PARALLEL divisions
   - Research → competitive intel
   - Compliance → security sweep
   - Industry → healthcare + hospital advocacy review
   - Executive → CTO health check
3. Engineering pipeline (sequential)
   Research → Architecture → Product → Developer → QA → Auditor
4. Documentation sync
5. C-suite board synthesis (CEO + CTO → SHIP / REVISE / STOP)
6. Wave report filed → Cursor handoff
```

```bash
pnpm quake:os:corporation
```

Weekly scheduler: `orchestrator/scheduled-jobs.ts` → `corporation-cycle`

---

## Automation stack

| Layer | Tool | Command |
|-------|------|---------|
| OS runtime | TypeScript engines | `pnpm quake:os` |
| Corporation cycle | CorporationOrchestrator | `pnpm quake:os:corporation` |
| Daily agent pipeline | AgentOrchestrator | `pnpm quake:os:daily` |
| Full automation | Gates + backlog + wave | `pnpm quake:automation:run` |
| Cursor Automations | Weekly corporation | `pnpm quake:automation:install` |
| Mission Control UI | `/mission-control` | Live divisions + executions |
| API | `POST /api/quake-os` | `{ "action": "corporation-cycle" }` |

---

## Honest limits (non-negotiable)

| What OS does | What humans/Cursor do |
|--------------|----------------------|
| Research repo corpus | Live web search, LLM calls |
| Generate build plans | Write production code |
| Run audit checklists | Merge PRs, deploy |
| File wave reports | Staging pilot, Entra, Stripe |
| Pick backlog priorities | Legal, production secrets |

---

## Success condition

Quake OS operates as a **persistent AI corporation**:

- Memory survives sessions (`quake-os/memory/` + `knowledge/*.db`)
- Backlog self-generates from 5 sources
- Every ship passes compliance + audit + CEO board
- Mission Control shows live corporation state
- Cursor Automations run weekly without manual prompting

**Verify:** `pnpm quake:os:corporation && pnpm test`
