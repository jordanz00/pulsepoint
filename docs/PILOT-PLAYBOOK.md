# PulsePoint — Pilot playbook (30-day)

**Audience:** Operator, IT liaison, pilot association staff  
**Org:** First sandbox tenant on staging

## Named owners (fill before go-live)

| Area | Owner | Backup |
|------|-------|--------|
| Entra SSO + user provisioning | _TBD_ | _TBD_ |
| Stripe payments + webhooks | _TBD_ | _TBD_ |
| Member import cutover | _TBD_ | _TBD_ |
| Runbook / on-call | _TBD_ | _TBD_ |
| Privacy / legal sign-off | _TBD_ | _TBD_ |

## Week 1 — Access

1. Set `INTEGRATION_PROFILE=pilot-entra` on staging
2. Complete `docs/ENTRA-PILOT-SETUP.md` app registration
3. Add 3–5 pilot users to Entra security group
4. Confirm `ENTRA_DEFAULT_ORG_SLUG` org exists (`pnpm demo:setup`)

## Week 2 — Data cutover

1. Obtain sanitized Protech export (see `docs/PROTECH-IMPORT.md`)
2. Dry-run: `tests/fixtures/protech-member-export.csv` in Import review
3. Pilot file: stage → review → apply (never blind insert)
4. Verify duplicate handling (email dedup)

## Week 3 — Money path

1. Stripe test mode on staging — one paid event
2. Run webhook drill per `docs/RUNBOOK.md` § Stripe
3. Document refund path once
4. Sign off: PENDING → CONFIRMED state machine

## Week 4 — Demo + pitch

1. Sterling Healthcare tour (`docs/PROTECH-FEATURE-MAP.md`)
2. Executive copilot on home (`ExecutiveBriefing`)
3. Microsoft 365 connect + inbox sync on `/enterprise/integrations`
4. Generate `status-board.html` for deck screenshot
5. Privacy policy live at `/privacy` (counsel review flag if draft)

## Smoke script (30 min)

| Step | Route | Pass |
|------|-------|------|
| Sign in | Entra SSO | ☐ |
| Add member | `/{org}/members/new` | ☐ |
| Import CSV | `/{org}/members/imports` | ☐ |
| Publish event | `/{org}/events` | ☐ |
| Paid register | Public event link + Stripe test card | ☐ |
| Check-in | Event admin check-in | ☐ |
| Export CSV | Members export | ☐ |
| Insights | `/{org}/insights` + Power BI export CTA | ☐ |

## CI gates

```bash
pnpm typecheck && pnpm test && pnpm leak:checks && pnpm claims:validate
pnpm test:e2e   # .github/workflows/e2e.yml
```

## Honest claims for pilot deck

**Live:** MemberCore, Events, Imports, Entra SSO (pilot), Graph mail read, executive copilot  
**Alpha:** Learn, Commerce, Engage, Insights  
**Roadmap:** Power BI embed, renewals automation, GL sync, member B2C SSO
