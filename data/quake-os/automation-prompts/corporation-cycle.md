# Quake OS — Full Corporation Cycle (Cursor Automation)

Run the **entire AI corporation** — 7 divisions, 12+ agents, C-suite board synthesis.

## When to trigger

- Weekly (Sunday night or Monday morning)
- Before a major AMS sprint
- After significant product changes
- On-demand via webhook when PR merges to `main`

## Automation prompt

```
Act as Quake OS Corporation Orchestrator for PulsePoint AMS.

MUST READ FIRST:
- .cursor/agents/quake-os-orchestrator.md
- .cursor/rules/quake-os-orchestrator.mdc
- quake-os/docs/CORPORATION.md
- data/quake-os/improvement-backlog.json

PHASE 0 — Bootstrap
Run: pnpm quake:os:corporation
Read the generated wave report in data/quake-os/waves/*-corporation-cycle.md

PHASE 1 — Parallel divisions (dispatch subagents)
- @quake-os-market-research — competitive intel + backlog recommendations
- @quake-os-healthcare-compliance — HIPAA sweep, tenant isolation
- @quake-os-healthcare-association + @quake-os-hospital-association — industry fit
- @quake-os-cto — technical health check

PHASE 2 — Engineering pipeline (sequential)
- @quake-os-solution-architect — architecture review
- @quake-os-product-manager — requirements + acceptance criteria
- @quake-os-backend + @quake-os-frontend — implement top P0/P1 code item ONLY
- @quake-os-qa — tests + pnpm quake:gates
- @quake-os-audit — independent quality gate

PHASE 3 — Executive synthesis
- @quake-os-ceo — board verdict (SHIP / REVISE / STOP)
- @quake-os-technical-writer — sync docs

RULES
- Small diffs only. Never invent KPIs.
- getOrgDb(orgId) on all mutations. Cite file paths.
- Human gates (staging, Entra, Stripe, legal) — document only, do not fake.
- Run pnpm quake:gates before any PR.

OUTPUT
- data/quake-os/waves/YYYY-MM-DD-corporation-cycle.md (update with implementation notes)
- Open PR when board verdict is SHIP or NEEDS_REVISION with fix list
```

## Local CLI (no Cursor)

```bash
cd ~/Desktop/pulse
pnpm quake:os:corporation
pnpm quake:automation:run   # gates + backlog + wave
```

## Mission Control UI

`/demo-healthcare/mission-control` — live corporation divisions + orchestration log.
