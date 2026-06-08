# Fundraising (PulsePoint Giving)

Complete fundraising module for hospital associations — campaigns, online gifts, offline recording, donor export, and payment reconciliation.

## Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/{orgSlug}/giving` | `giving:read` | Staff dashboard |
| `/{orgSlug}/giving/{campaignId}` | `giving:read` | Campaign detail + gift ledger |
| `/{orgSlug}/give` | Public | Active campaigns |
| `/{orgSlug}/give/{campaignId}` | Public | Online donate + checkout |

Public routes are allowlisted in `middleware.ts` (no staff login required).

## Permissions

| Capability | Minimum role | Actions |
|------------|--------------|---------|
| `giving:read` | STAFF | View campaigns and paid gifts |
| `giving:manage` | ADMIN | Create/update campaigns, record offline gifts, export CSV |

Finance/legal department staff receive `giving:read` via `lib/association/rbac-matrix.ts`.

Enforced in:

- `lib/admin-page-guard.ts` — page access
- `app/actions/giving.ts` — `requireCapability("giving:read" | "giving:manage")`

## Data model

- **Campaign** — name, description, `goalCents`, `status` (`DRAFT`, `ACTIVE`, `CLOSED`)
- **Donation** — donor name/email, `amountCents`, `paidAt` (null = pending checkout), `paymentAdapterId`, optional `memberId` when portal member is logged in

**Business rules:**

- Only `ACTIVE` campaigns accept online gifts on `/give/{campaignId}`.
- Raised totals count **paid** gifts only (`paidAt` set).
- Offline gifts recorded by staff are marked paid immediately (`paymentAdapterId: manual`).

## Flow

1. **Staff** creates campaign at `/{orgSlug}/giving` and sets status **Active**.
2. **Donor** visits `/{orgSlug}/give/{campaignId}` → enters amount → payment checkout.
3. **Stripe webhook** (`app/api/webhooks/stripe/route.ts`) or demo adapter marks `Donation.paidAt`.
4. **Staff** records check/wire gifts manually; exports paid donors to CSV.

## Server actions

| Action | Capability | File |
|--------|------------|------|
| `createCampaign` | `giving:manage` | `app/actions/giving.ts` |
| `updateCampaign` | `giving:manage` | |
| `recordDonation` | `giving:manage` | |
| `startDonationCheckout` | Public | |
| `exportDonorsCsv` | `giving:manage` | |
| `getGifts` | `giving:read` | |

## Shared libraries

- `lib/validations/giving.ts` — Zod schemas
- `lib/giving/campaign-stats.ts` — raised vs goal
- `lib/giving/load-giving.ts` — dashboard loaders
- `lib/giving/mark-donation-paid.ts` — payment completion (webhook + demo)
- `lib/giving/csv.ts` — CSV cell escaping

## Audit trail

Write actions log to `AuditLog` with actions prefixed `giving.*` (campaign create/update, offline gift, export, paid via webhook/demo).

## Production configuration

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Checkout success/cancel redirect URLs |
| Stripe webhook secret | `app/api/webhooks/stripe/route.ts` — marks donations paid |

Payment adapter per org: `getPaymentAdapterForOrg()` in `lib/adapters/payments`. Demo mode auto-completes checkout when `shouldSimulateDemoPayment()` is true.

## UI design

- **Flat list rows** replace glass cards — less chrome, one tap target per campaign on public pages.
- **Inline progress** on lists; full progress bar only on detail/donate pages.
- **Two KPIs** on staff dashboard (raised, active) — no redundant totals.
- **Typography:** `--ds-text-display` (page title) → `--ds-text-title` (section) → `--ds-text-headline` (row) → `--ds-text-caption` (meta).
- **Spacing:** `--ds-6` page rhythm, `--ds-4` section/row padding, `--ds-3` field gaps.

## Accessibility

- Progress bars use `role="progressbar"` with `aria-valuenow` / `aria-label`.
- Donate and admin forms use `FormField` with wired label/control ids.
- Amount presets use `aria-pressed`; status messages use `role="status"` / `role="alert"`.
- Gift ledger table uses `scope="col"` and horizontal scroll wrapper on small screens.

## Mobile

- Admin panels and status controls stack below 768px.
- Donate presets use a 2×2 grid on small screens.
- Touch targets ≥ 44px on presets, submit, and export actions.

## Tests

```bash
pnpm exec vitest run tests/unit/giving-campaign-stats.test.ts
pnpm exec vitest run tests/unit/giving-validation.test.ts
pnpm exec vitest run tests/unit/giving-csv.test.ts
pnpm exec vitest run tests/unit/giving-mark-donation-paid.test.ts
pnpm exec vitest run tests/unit/permissions.test.ts
```

## Demo

```bash
pnpm db:seed:demo
pnpm dev:web
```

- Staff: `/demo-healthcare/giving`
- Public: `/demo-healthcare/give`

PAC and Annual Fund campaigns are seeded with sample paid gifts.

## Definition of Done checklist

| Criterion | Status |
|-----------|--------|
| Feature works (campaigns, checkout, offline, export, webhook) | ✓ |
| UI complete (staff + public pages, progress, ledger) | ✓ |
| Tests written (stats, validation, CSV, payment mark, RBAC) | ✓ |
| Documentation updated (this file + `docs/IT-HANDOFF.md`) | ✓ |
| Mobile responsive (768px breakpoints, touch targets) | ✓ |
| Accessible (ARIA labels, form fields, progressbar, status) | ✓ |
| Production ready (audit logs, validation, tenant guards, CSV escape) | ✓ |

## Not in scope

- Recurring gift execution (schema flag only)
- PAC compliance reporting
- Pledge reminders and soft credits
