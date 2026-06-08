# Quake OS — Multi-Agent AMS Development Organization

**Mission:** Design, audit, improve, test, document, and scale **PulsePoint AMS** for hospital associations, health system associations, healthcare nonprofits, and membership-based advocacy organizations.

**Canonical product repo:** `/Users/jordanzabady/Desktop/pulse`

---

## Who we serve

| Segment | Examples |
|---------|----------|
| Hospital associations | State hospital associations, regional councils |
| Health system associations | Multi-hospital membership orgs |
| Healthcare nonprofits | Foundations, professional societies |
| Advocacy orgs | PAC-adjacent policy, grassroots campaigns |
| Accreditation / CE orgs | Certification, continuing education |

---

## Organizational chart

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

Full role map: `quake-os/docs/ORG-CHART.md`

**Cursor agents:** `.cursor/agents/quake-os-*.md`  
**Orchestration rule:** `.cursor/rules/quake-os-orchestrator.mdc`  
**Legacy Pulse agents:** still valid; Quake OS extends them for full-business coverage.

---

## Six-phase collaboration framework

Every major initiative runs through six phases. Launch **parallel** specialists per phase; **Audit Agent** reviews after Engineering; **CEO/COO/CTO** close Phase 6.

| Phase | Name | Parallel agents |
|-------|------|-----------------|
| **1** | Research | Research Agent, Hospital Association Agent, Healthcare SME Agent |
| **2** | Planning | Product Agent, Architecture Agent |
| **3** | Build | Developer Agent (+ delegate specialists as needed) |
| **4** | Audit | QA Agent, Compliance Agent, Auditor Agent |
| **5** | Optimize | Documentation Agent, Research Agent (feedback loop) |
| **6** | Executive | CEO Agent, CTO Agent → verdict + next sprint |

### Orchestrator prompt (copy/paste)

```
@quake-os-orchestrator Run Phase [1-6] for: [initiative].
Scope: PulsePoint AMS — [module/feature].
Deliver: per-agent summaries → Audit digest → executive verdict.
Ground truth: docs/PRODUCT-CLAIMS.md, getOrgDb tenant rules, no invented stats.
```

### Parallel execution in Cursor

Use **multiple Task subagents in one message** for Phase 1–5, then sequential Audit + Executive:

1. `@quake-os-market-research` + `@quake-os-hospital-association` + … (same phase)
2. Merge outputs into `data/quake-os/waves/[date]-[initiative].md`
3. `@quake-os-audit` reviews merged diff
4. `@quake-os-ceo` approves or sends back

---

## Shared knowledge system

| Registry | Location | Owner agent |
|----------|----------|-------------|
| Requirements & user stories | `data/quake-os/requirements-registry.json` | AMS PM |
| Feature / module map | `docs/ROADMAP-MODULES.md` + registry | AMS PM |
| Architecture | `docs/ENTERPRISE-ARCHITECTURE.md`, `docs/SYSTEM-DESIGN.md` | Solution Architect, CTO |
| Data dictionary | `docs/DATA-DICTIONARY.md` | Database Architect |
| Competitive intelligence | `data/quake-os/competitive-intel.json` | Market Research |
| Compliance & risk | `docs/DATA-SECURITY-PLAN.md`, `SECURE-FORCE.md` | Healthcare Compliance, Risk |
| Product claims (honest) | `docs/PRODUCT-CLAIMS.md` | Audit, CEO |
| Lessons learned | `data/quake-os/lessons-learned.md` | All agents append |
| Wave audit trail | `data/quake-os/waves/` | COO, Audit |

---

## Non-negotiables (all Quake OS agents)

1. **Tenant isolation** — `getOrgDb(orgId)`; `pnpm leak:checks`
2. **No invented stats** — KPIs from DB or `validationStatus: pending_sme`
3. **Honest scope** — Live / Alpha / Roadmap per `docs/PRODUCT-CLAIMS.md`
4. **Healthcare context** — hospital roster, advocacy, dues, events, PAC—not generic chapter AMS
5. **Audit culture** — challenge assumptions; cite file paths; Audit Agent reviews before merge
6. **Measurable outcomes** — every proposal ties to member, revenue, or operational KPI

---

## Competitive landscape (standing brief)

Fonteva, iMIS, Higher Logic, MemberSuite, YourMembership, Salesforce AMS, **Protech AMS** (primary wedge — see `docs/PROTECH-FEATURE-MAP.md`).

Quake OS wins on: modern UX, Microsoft-native path, operational trust, honest pilot scope, executive glass dashboards.

---

## Quake OS (autonomous platform)

**Package:** `quake-os/` — persistent memory, engines, orchestrator, knowledge graph.

```bash
pnpm quake:os              # OS health
pnpm quake:os:wave         # run wave
pnpm quake:os:research     # research cycle
```

**Architecture:** `quake-os/docs/ARCHITECTURE.md`  
**21 OS agents:** `quake-os/agents/registry.json`  
**Memory:** `quake-os/memory/` (survives sessions)

---

## Continuous improvement

Run on cadence (weekly recommended) or every PR:

```bash
pnpm quake:gates   # claims + leak + test + typecheck + status board
```

**Cursor chat:** `@quake-os-continuous-runner Run continuous wave from improvement-backlog.json`

**Cursor Automations:** `docs/CURSOR-AUTOMATIONS-QUICKSTART.md` — optional cloud layer  
**Preflight:** `pnpm quake:automation:check`  
**Full pipeline:** `pnpm quake:automation:run` — see `docs/QUAKE-AUTOMATION-WORKFLOW.md`

**Backlog:** `data/quake-os/improvement-backlog.json`  
**Playbook:** `docs/QUAKE-OS-CONTINUOUS.md`  
**Scale & security:** `docs/SCALE-AND-SECURITY.md`  
**CI:** `.github/workflows/quake-os-gates.yml` (weekly + manual)

Extended agents: **designer**, **ams-specialist**, **security**, **scale**, **continuous-runner**.

## Quick commands

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm quake:gates
```

---

## Related docs

- `docs/ENTERPRISE-AMS-OPTIMIZED-PROMPT.md` — master build prompt
- `docs/PILOT-PLAYBOOK.md` — pilot operations
- `docs/QUAKE-OS-KNOWLEDGE.md` — registry index
- `.cursor/rules/quake-os-orchestrator.mdc` — activation matrix
- `docs/CURSOR-AUTOMATIONS-QUICKSTART.md` — Cursor Automations setup (5 min)
