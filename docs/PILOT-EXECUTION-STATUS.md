# 30-Day Pilot Plan — Execution Status

**Plan:** `.cursor/plans/pulsepoint_30-day_pilot_3fbca7be.plan.md`  
**Canonical repo:** `/Users/jordanzabady/Desktop/pulse`  
**As of:** June 2026  
**48h engineering closure:** Sprints B–F + BL-001–002, BL-004–010, **BL-026–027** **done**. Only **BL-003** (Sprint A) remains — see `docs/SPRINT-A-OPERATOR-PACKET.md`.

## Phase completion

| Phase | Theme | Status | Evidence |
|-------|--------|--------|----------|
| **0** | Merge + agents | ✅ Done | `packages/api`, `worker`, `shared`; `.cursor/agents/pulse-*`; `MIGRATED.md` |
| **1** | Microsoft | ✅ Done | `lib/adapters/auth/entra.ts`, `lib/adapters/microsoft365/`, `docs/ENTRA-PILOT-SETUP.md`, `docs/MICROSOFT-365-INTEGRATION.md`, `docs/EASYDNN-INTEGRATION.md` |
| **2** | Pilot ops gates | 🟡 Mostly | `docs/PILOT-PLAYBOOK.md`, `docs/STRIPE-PILOT-DRILL.md`, `e2e.yml`, renewal cron gated (`PULSE_CRON_RENEWALS`); **needs** named owners + live Stripe drill |
| **3** | Glass + copilot | ✅ Done | `ExecutiveKpiStrip`, `ExecutiveBriefing`, CEO overview topic colors, marketing glass showcases |
| **4** | Staging + pitch | 🟡 Human gates | `docs/STAGING-LAUNCH.md`, `docs/PITCH-PACKAGE.md`, `status-board.html`; **needs** staging deploy + 3–5 Entra users |

## Automated gates (run before every pilot demo)

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm claims:validate   # marketing honesty
pnpm leak:checks       # tenant isolation (10 checks) — ✅ 10/10 as of June 2026 wave
pnpm test              # unit + integration
pnpm typecheck
pnpm test:e2e          # demo wedge (local or CI)
python3 scripts/generate-status-board.py
```

## Day-30 checklist (human)

| Item | Owner | Status |
|------|-------|--------|
| Staging URL live | IT / operator | ☐ |
| Entra: 3–5 pilot users | IT | ☐ |
| Protech CSV import on staging | Data | ☐ |
| Paid event + refund drill | Finance | ☐ |
| Named runbook owners in `PILOT-PLAYBOOK.md` | Leadership | ☐ |
| Counsel-approved privacy policy | Legal | ☐ |

## Honest pilot claims

**Live:** MemberCore, Events, Imports, Entra SSO (pilot profile), Graph mail read, executive copilot, M365/EasyDNN adapters  
**Alpha:** Learn, Commerce, Engage, Insights (labeled on site)  
**Roadmap:** Power BI embed, renewals automation, GL sync, member B2C SSO

## Next operator actions

1. Fill named owners in `docs/PILOT-PLAYBOOK.md` § Named owners  
2. Deploy staging per `docs/STAGING-LAUNCH.md`  
3. Complete Entra app registration per `docs/ENTRA-PILOT-SETUP.md`  
4. Run 30-min smoke script in `PILOT-PLAYBOOK.md` on staging  
5. Screenshot `status-board.html` + Sterling overview for deck
