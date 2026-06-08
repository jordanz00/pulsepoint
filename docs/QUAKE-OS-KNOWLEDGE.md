# Quake OS — Shared Knowledge Index

All agents **read before acting** and **update after shipping** when their domain changes.

## Product & requirements

| Asset | Path | Update when |
|-------|------|-------------|
| Product claims (Live/Alpha/Roadmap) | `docs/PRODUCT-CLAIMS.md` | Any user-facing capability changes |
| Module roadmap | `docs/ROADMAP-MODULES.md` | Module GA or scope shift |
| Requirements registry | `data/quake-os/requirements-registry.json` | New epics / acceptance criteria |
| Protech comparison | `docs/PROTECH-FEATURE-MAP.md` | Competitive positioning |
| Positioning | `docs/POSITIONING.md` | GTM or pitch changes |

## Architecture & engineering

| Asset | Path | Update when |
|-------|------|-------------|
| System design | `docs/SYSTEM-DESIGN.md` | Major structural change |
| Enterprise architecture | `docs/ENTERPRISE-ARCHITECTURE.md` | New service boundary |
| Engineering invariants | `docs/ENGINEERING-INVARIANTS.md` | New platform rule |
| Data dictionary | `docs/DATA-DICTIONARY.md` | New fields / entities |
| Power BI semantic layer | `docs/POWER-BI-SEMANTIC-LAYER.md` | New metrics |
| Integrations | `docs/INTEGRATIONS.md`, `docs/MICROSOFT-365-INTEGRATION.md` | New vendor |

## Compliance & security

| Asset | Path | Update when |
|-------|------|-------------|
| Data security plan | `docs/DATA-SECURITY-PLAN.md` | New data path |
| SECURE-FORCE | `SECURE-FORCE.md` | Security pattern change |
| Subprocessors | `docs/SUBPROCESSORS.md` | New vendor with PII |
| Tenant leak checks | `docs/TEN-MEMBER-LEAK-CHECKS.md` | Member query surface |

## Operations & pilot

| Asset | Path | Update when |
|-------|------|-------------|
| Pilot playbook | `docs/PILOT-PLAYBOOK.md` | Go-live step |
| Operator checklist | `docs/OPERATOR-CHECKLIST.md` | Gate status |
| Runbooks | `docs/RUNBOOK.md` | Incident class |

## Continuous improvement

| Asset | Path | Update when |
|-------|------|-------------|
| Improvement backlog | `data/quake-os/improvement-backlog.json` | Each continuous wave |
| Continuous playbook | `docs/QUAKE-OS-CONTINUOUS.md` | Cadence or agent changes |
| Scale & security | `docs/SCALE-AND-SECURITY.md` | New caps, indexes, security patterns |
| Gate script | `scripts/quake-os-gates.sh` | Gate command changes |

## Competitive & innovation

| Asset | Path | Update when |
|-------|------|-------------|
| Competitive intel DB | `data/quake-os/competitive-intel.json` | Competitor feature move |
| Lessons learned | `data/quake-os/lessons-learned.md` | Post-wave retrospective |

## Wave outputs (audit trail)

After each multi-agent wave, COO files summary:

`data/quake-os/waves/YYYY-MM-DD-[initiative].md`

Template:

```markdown
# Wave: [initiative]
## Phase 1 Research — [agent]: [1-line finding]
## Phase 4 Audit — VERDICT: [APPROVED|REVISION]
## Executive — CEO: [decision]
```
