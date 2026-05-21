# PulsePoint scope wedge

**We are not cloning Protech.** Twenty years of edge cases live in legacy AMS products; rebuilding them in one release is how trust dies.

## Ship first (narrow wedge)

| Capability | What “done” means |
|------------|-------------------|
| **MemberCore** | Tenant-scoped directory, staff notes, staged CSV import (review → apply), ADMIN-gated export, audit log |
| **PulsePoint Events** | Published events, public registration, capacity/waitlist, Stripe checkout, check-in, registration state machine |
| **PulsePoint Work** | Admin shell, org routing, exceptions queue for soft-fail automations |
| **Honest migration** | Import staging—not blind production inserts; documented subprocessors; runbooks for payment drift |

## Explicitly out of v0.1 (gates before expansion)

- Protech parity: exhibits, complex sponsorships, CE tracking, GL integration, chapter hierarchies
- PulsePoint Learn, Giving, Commerce, Engage, Insights, AI — **roadmap** until `lib/products.ts` status is `available` *and* admin routes exist
- Automated renewals, full SSO, Power BI embed, GDPR automation — roadmap per `docs/PRODUCT-CLAIMS.md`

## Expansion gate (each new module)

1. State machines + tenant scope + idempotency in the same PR as the feature
2. `requireCapability` on every sensitive action
3. Runbook row + exception workflow if async
4. Update `docs/PRODUCT-CLAIMS.md` and pass `pnpm claims:validate`
5. Human review for auth/money paths per `CONTRIBUTING.md`

## Positioning line for grants and boards

> “PulsePoint ships **MemberCore** and **PulsePoint Events** today; Learn, Commerce, Insights, and the rest are on the roadmap with Live/Roadmap labels in product.”

Do not say “we have Commerce/Insights” in funding decks unless the module is live in `PULSE_PRODUCTS`.
