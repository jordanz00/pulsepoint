# PulsePoint system design (non-negotiables)

## 1. Tenant boundary

- Every domain row has `orgId`.
- App code uses `getOrgDb(orgId)` only — see `lib/db.ts`, `lib/db-scope.ts`.
- **Target:** Postgres RLS as second layer.

## 2. Permissions (not UI-only)

- Capabilities in `lib/permissions.ts`.
- Server actions call `requireCapability()` — export/import/delete are ADMIN+.

## 3. State transitions

- Registration: `PENDING` → `CONFIRMED` (payment), `WAITLIST`, `CANCELLED`.
- Stripe webhook is idempotent (`WebhookIdempotency`).
- **Target:** explicit state machine module + tests.

## 4. Soft-fail automations

- Partial failures → `AutomationException` (`lib/automation-exception.ts`).
- Staff triage: `/{orgSlug}/exceptions`.
- **Target:** Slack/Sheet subscribers on new rows.

## 5. Contact integrity

- Email normalized; duplicate email skipped on import.
- **Target:** import staging + merge review queue.

## 6. Audit

- Sensitive actions log to `AuditLog` (export, delete, import counts).
