# Quake OS — Organizational Chart

```
Quake OS
│
├── CEO Agent
├── CTO Agent
├── Product Agent
├── Research Agent
├── Healthcare SME Agent
├── Hospital Association Agent
├── Compliance Agent
├── Architecture Agent
├── Developer Agent
├── QA Agent
├── Auditor Agent
├── Documentation Agent
│
└── Orchestrator
```

## Roles

| Agent | ID | Cursor |
|-------|-----|--------|
| CEO Agent | `ceo-agent` | `@quake-os-ceo` |
| CTO Agent | `cto-agent` | `@quake-os-cto` |
| Product Agent | `product-agent` | `@quake-os-product-manager` |
| Research Agent | `research-agent` | `@quake-os-market-research` |
| Healthcare SME Agent | `healthcare-sme-agent` | `@quake-os-healthcare-association` |
| Hospital Association Agent | `hospital-association-agent` | `@quake-os-hospital-association` |
| Compliance Agent | `compliance-agent` | `@quake-os-healthcare-compliance` |
| Architecture Agent | `architecture-agent` | `@quake-os-solution-architect` |
| Developer Agent | `developer-agent` | `@quake-os-backend` |
| QA Agent | `qa-agent` | `@quake-os-qa` |
| Auditor Agent | `auditor-agent` | `@quake-os-audit` |
| Documentation Agent | `documentation-agent` | `@quake-os-technical-writer` |
| **Orchestrator** | `orchestrator` | `@quake-os-orchestrator` |

## Delegates (optional specialists)

Core agents may invoke Cursor sub-agents:

- **Healthcare SME** → health-system-ops, nonprofit
- **Compliance** → security, risk
- **Developer** → frontend, database, integrations

Registry aliases: `quake-os/agents/registry.json` → `_aliases`

## Knowledge store (`/knowledge`)

| Database | Purpose |
|----------|---------|
| `research.db` | Research Agent output |
| `requirements.db` | Product / Developer requirements |
| `lessons.db` | Wave reports, daily cycles |
| `competitors.db` | Competitive intelligence |
| `roadmap.db` | Sprint plans, roadmaps |
| `decisions.db` | ADRs, executive decisions |

```bash
pnpm quake:knowledge:status
```

## Discovery pipeline

```
Research Agent   → discovers insight, creates ticket
Product Agent    → writes requirements (user stories + AC)
Developer Agent  → builds feature
QA Agent         → tests
Auditor Agent    → reviews
```

```bash
pnpm quake:discovery
# "Hospital associations need better PAC management."
```

## Feature review chain

```
Developer Agent  → builds feature
QA Agent         → tests
Auditor Agent    → critiques
Architecture Agent → critiques
Healthcare SME   → critiques
CEO Agent        → approves
```

```bash
pnpm quake:feature:review <task-id>
```

## Daily pipeline (Orchestrator)

```
Research Agent
    ↓
Architecture Agent
    ↓
Product Agent
    ↓
Developer Agent
    ↓
QA Agent
    ↓
Auditor Agent
```

```bash
pnpm quake:os:daily
```
