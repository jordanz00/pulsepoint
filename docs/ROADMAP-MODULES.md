# PulsePoint roadmap modules

Canonical specs live in code: `lib/roadmap-modules.ts` (keeps admin previews and docs aligned).

**Live today:** PulsePoint Work, MemberCore, PulsePoint Events.  
**Alpha today:** Learn, Giving, Commerce, Engage, Insights — phased to GA per [GO-TO-MARKET-6MONTH.md](./GO-TO-MARKET-6MONTH.md).

---

## PulsePoint Learn (M3–4)

**Vision:** CE credits and certificates on the member record—not a disconnected LMS.

| Area | Planned capability |
| --- | --- |
| Credits | Credit types, rules, manual + event-linked awards |
| Catalog | Courses / sessions, optional tie to Events |
| Transcript | Per-member history, export for compliance |
| Certificates | PDF issuance with audit trail (phase 2) |

**vs Protech:** Single member truth vs duplicate profiles across education add-ons.

| Wave 1 (alpha) | Capability |
| --- | --- |
| Workforce hub | `/learn/workforce` — playlists, pipeline programs, persona fields |
| Virtual career fair | `Event.eventKind = VIRTUAL_CAREER_FAIR` — draft event + microsite |
| Program enrollment | `LearnProgramEnrollment` stub tied to member record |

---

## PulsePoint Commerce (M3)

**Vision:** Dues and storefront in member context—finance can reconcile.

| Area | Planned capability |
| --- | --- |
| Catalog | Products, variants, member-visible pricing |
| Checkout | Stripe Checkout, idempotent webhooks |
| Finance | CSV export with GL codes; payout reconciliation runbook |
| History | Purchases on member profile |

**vs Protech:** Faster setup for common dues + event packages; transparent fees.

---

## PulsePoint Giving (M4)

**Vision:** Campaigns and gifts without enterprise fundraising bloat.

| Area | Planned capability |
| --- | --- |
| Donors | Profile linked or standalone |
| Campaigns | Funds, appeals, goals |
| Gifts | One-time + recurring (Stripe) |
| Acknowledgments | Email templates + send log |

---

## PulsePoint Engage (M4)

**Vision:** Segments from live data—routine email without CSV export.

| Area | Planned capability |
| --- | --- |
| Segments | Tags, roles, event attendees |
| Templates | Approved HTML/text |
| Campaigns | Throttled send, bounce handling |
| Compliance | Unsubscribe, suppression |

---

## PulsePoint Insights (M5)

**Vision:** Board-ready numbers that match staff exports.

| Area | Planned capability |
| --- | --- |
| KPIs | Members, retention proxy, event revenue |
| Reports | Saved filters, CSV export |
| Power BI | Semantic layer docs; embed when IT ready |

---

## Maintenance

When a module ships, update:

1. `lib/products.ts` → `status: "available"`
2. `docs/PRODUCT-CLAIMS.md`
3. `docs/OPERATOR-CHECKLIST.md`
4. Run `pnpm claims:validate`
