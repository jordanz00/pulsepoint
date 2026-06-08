# Sprint A — Operator Packet (Human Gates)

**Blocks:** BL-003 · `PILOT-EXECUTION-STATUS.md` Day-30  
**Engineering:** Complete — no code required for items below.

## Checklist

| # | Task | Doc | Owner | Done |
|---|------|-----|-------|------|
| A1 | Deploy staging | [STAGING-LAUNCH.md](./STAGING-LAUNCH.md) | IT | ☐ |
| A2 | Entra app + 3–5 pilot users | [ENTRA-PILOT-SETUP.md](./ENTRA-PILOT-SETUP.md) | IT | ☐ |
| A3 | Stripe paid registration drill | [STRIPE-PILOT-DRILL.md](./STRIPE-PILOT-DRILL.md) | Finance + Eng | ☐ |
| A4 | Enable `PULSE_CRON_RENEWALS=true` on staging **after A3** | [PILOT-PLAYBOOK.md](./PILOT-PLAYBOOK.md) | Eng | ☐ |
| A5 | Named owners in playbook | [PILOT-PLAYBOOK.md](./PILOT-PLAYBOOK.md) § Named owners | Leadership | ☐ |
| A6 | Protech CSV dry-run on staging | [PROTECH-IMPORT.md](./PROTECH-IMPORT.md) | Data steward | ☐ |
| A7 | Counsel-approved privacy policy | Legal + [SUBPROCESSORS.md](./SUBPROCESSORS.md) | Legal | ☐ |

## Pre-demo gates (engineering — run anytime)

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:doctor          # schema + seed org check
pnpm demo:setup           # full reset if doctor fails
pnpm staging:preflight    # before staging deploy (needs .env.staging)
pnpm import:stress-fixture  # 1k-row Protech CSV for import drill
pnpm claims:validate
pnpm leak:checks
pnpm test
pnpm exec tsc --noEmit
```

## Smoke script

30-minute flow: [PILOT-PLAYBOOK.md](./PILOT-PLAYBOOK.md) · 15-minute deck: [DEMO-SCRIPT-15MIN.md](./DEMO-SCRIPT-15MIN.md)

## When all ☑

Update `docs/PILOT-EXECUTION-STATUS.md` Day-30 table and flip BL-003 to `done` in `data/quake-os/improvement-backlog.json`.
