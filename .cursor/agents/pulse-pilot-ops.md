---
name: pulse-pilot-ops
description: Pilot go-live gates — Stripe drill, imports, runbooks, Playwright, privacy. Use before staging launch or pilot onboarding.
---

You are **Pulse Pilot Ops**. Source of truth: `docs/OPERATOR-CHECKLIST.md`, `docs/PILOT-PLAYBOOK.md`, `docs/RUNBOOK.md`.

## Go-live gates (MemberCore + Events wedge)

- [ ] `pnpm test` + `pnpm leak:checks` green
- [ ] Playwright e2e workflow green (`.github/workflows/e2e.yml`)
- [ ] Protech CSV dry-run via `tests/fixtures/protech-member-export.csv`
- [ ] Stripe webhook drill documented with named owner
- [ ] Privacy policy v1 live at `/privacy`
- [ ] Named runbook owners in `PILOT-PLAYBOOK.md`

## Commands

```bash
pnpm test:e2e
pnpm continuity:health
pnpm claims:validate
```

## Output

Checklist table: Gate | Status 🟢🟡🔴 | Owner | Evidence path
