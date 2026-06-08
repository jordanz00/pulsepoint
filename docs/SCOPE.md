# PulsePoint scope wedge

**We are not cloning Protech.** Twenty years of edge cases live in legacy AMS products; rebuilding them in one release is how trust dies.

## Ship first (narrow wedge)

**Product = operational trust.** See [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) §0.

| Capability | What “done” means |
|------------|-------------------|
| **MemberCore** | Tenant-scoped directory, staff notes, staged CSV import (review → apply), ADMIN-gated export, audit log |
| **PulsePoint Events** | Published events, public registration, capacity/waitlist, Stripe checkout, check-in, registration state machine |
| **PulsePoint Work** | Admin shell, org routing, exceptions queue for soft-fail automations |
| **Honest migration** | Import staging—not blind production inserts; documented subprocessors; runbooks for payment drift |
| **Operational exports** | Members, registrations, revenue CSV—UI totals match export |

### Block 1 defer (do not creep into wedge GA)

| Deferred | Why |
|----------|-----|
| Learn, Giving, Insights (GA) | State-space explosion; alpha UI only until Block 2 gates |
| Committees, renewal automation | Governance + billing complexity |
| Portal expansion | After pilot unless blocking |
| Custom report builders / BI embed | Reporting becomes its own product—see REALIZATION-PLAN reporting phases |

## Explicitly out of v0.1 (gates before expansion)

- Protech parity: exhibits, complex sponsorships, CE tracking, GL integration, chapter hierarchies
- PulsePoint Learn, Giving, Commerce, Engage, Insights — **alpha** today; **GA** when `lib/products.ts` status is `available` *and* operator checklist is green
- Automated renewals, full SSO, Power BI embed, GDPR automation — roadmap per `docs/PRODUCT-CLAIMS.md`

## Expansion gate (each new module)

1. State machines + tenant scope + idempotency in the same PR as the feature
2. `requireCapability` on every sensitive action
3. Runbook row + exception workflow if async
4. [SUPPORTABILITY-GATES.md](./SUPPORTABILITY-GATES.md) checklist green
5. [UI-QUALITY-BAR.md](./UI-QUALITY-BAR.md) pass on new surfaces
6. Update `docs/PRODUCT-CLAIMS.md` and pass `pnpm claims:validate`
7. Human review for auth/money paths per `CONTRIBUTING.md`

## Positioning line for grants and boards

> “PulsePoint ships **MemberCore** and **PulsePoint Events** today; Learn, Commerce, Insights, and the rest are on the roadmap with Live/Roadmap labels in product.”

Do not say “we have Commerce/Insights” in funding decks unless the module is live in `PULSE_PRODUCTS`.
