# E2E tests in CI

**Workflow:** `.github/workflows/e2e.yml` — job name **`playwright`**  
**Scope:** Demo wedge smoke + advocacy take-action (Playwright, Chromium)

## Run locally

```bash
pnpm demo:setup          # or: DEMO_MODE=true pnpm db:push && pnpm db:seed:demo
pnpm test:e2e            # starts dev server via playwright.config.ts when not in CI
```

Requires `DEMO_MODE=true` (set automatically in `playwright.config.ts`).

## What CI runs

1. Postgres service + `prisma migrate deploy` + `pnpm db:seed:demo`
2. Dev server on `127.0.0.1:3000` with `DEMO_MODE=true`
3. `pnpm test:e2e` — `tests/e2e/demo-wedge.spec.ts`, `advocacy-take-action.spec.ts`, etc.

Parallel to unit/lint workflow: `.github/workflows/ci.yml` (quality job).

## Required check on `main` PRs

Repo maintainers: enable branch protection so merges require:

| Check | Source |
|-------|--------|
| **CI / quality** | `.github/workflows/ci.yml` |
| **E2E (demo wedge) / playwright** | `.github/workflows/e2e.yml` |

**GitHub:** Settings → Branches → `main` → Require status checks → add both job names above.

Without branch protection, E2E still runs on every PR to `main`; it is not blocking until configured.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `no such table: AdvocacyCampaignResponse` | Run `pnpm demo:setup` locally; CI uses migrate deploy |
| Server health timeout | Increase wait in `e2e.yml` or check `/api/health` |
| Advocacy test skip | Set `DEMO_MODE=true` |

See also `scripts/demo-doctor.sh` (`pnpm demo:doctor`).
