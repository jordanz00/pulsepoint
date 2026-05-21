# Isolation audit (LEGO checklist)

**Last verified:** May 2026 · Cross-checked by code review + `pnpm test` + `pnpm security:audit`

| Question (LEGO) | Verdict | Evidence |
|-----------------|---------|----------|
| **Separate piles?** (tenant model) | 🟢 **Solid** | `getOrgDb(orgId)` on all member/event/import queries; no raw `prisma.member` in app; admin layout requires `requireOrgAccessForSlug` |
| **Right kid only?** (permissions) | 🟢 **Solid** (mutations) · 🟡 reads | `requireCapability` on all server actions; ADMIN for export/import/delete; STAFF cannot export per tests |
| **Move LEGO safely?** (migration) | 🟢 **Solid** | Stage → `members/imports` → apply; `updateMany` claim prevents double-apply; no `importMembersCsv` |
| **Same message twice?** (webhooks) | 🟢 **Solid** | `claimWebhookEvent` on Stripe + Clerk; unit test proves duplicate → skip |
| **Someone tried to mix piles?** (tests) | 🟡 **Improved** | `tenant-isolation.test.ts`, `webhook-idempotency.test.ts`, `db-scope.test.ts`; no full DB integration test yet |

## Detail

### 1. Tenant model (`getOrgDb`)

- **Mechanism:** `lib/db.ts` merges `orgId` into reads/writes for models in `lib/org-models.ts`.
- **Fix applied:** Admin `layout.tsx` calls `requireOrgAccessForSlug` so URL slug cannot be used to view another org’s data without membership.
- **Latent:** Postgres RLS not enabled (`prisma/sql/rls-reference.sql` reference only).

### 2. Permission matrix

- **Mechanism:** `lib/permissions.ts` + `requireCapability` in `app/actions/*`.
- **Public routes:** `/api/public/register` added to `middleware.ts` public matcher.
- **Gap:** `event:delete`, `org:settings` capabilities exist but no actions yet (no UI to exploit).

### 3. Migration story

- **Flow:** `stageMembersCsvImport` → review UI → `applyMembersImportBatch` / `rejectMembersImportBatch`.
- **Fix applied:** Apply claims batch with `updateMany` (`PENDING_REVIEW` → `APPLIED`) before creating members.
- **Caveat:** `Member.email` is not unique in schema; duplicate emails still possible across separate batches—review UI flags `SKIPPED_DUPLICATE`.

### 4. Webhook idempotency

- **Mechanism:** `lib/webhook-idempotency.ts` — insert `source:id`; duplicate PK → return `duplicate: true`.
- **Stripe:** Claim before `eventRegistration.update` + `assertRegistrationTransition`.
- **Clerk:** Claim on `svix-id` or fallback `type:id`.
- **Ops caveat:** Fail-after-claim (handler crashes after insert) needs manual replay per `docs/RUNBOOK.md`.

### 5. Tests that break isolation

| Test file | What it proves |
|-----------|----------------|
| `tests/unit/db-scope.test.ts` | `mergeWhere` always adds `orgId` |
| `tests/unit/tenant-isolation.test.ts` | Guessed id + wrong org in where; model registry; state machine |
| `tests/unit/webhook-idempotency.test.ts` | Second webhook delivery skipped |
| `tests/unit/webhook-trust.test.ts` | Stripe metadata must match registration row |
| `tests/unit/permissions.test.ts` | STAFF blocked from export |
| `tests/unit/member-import-apply.test.ts` | Apply claim contract documented |

**Not yet:** Prisma integration test with two orgs in Postgres (recommended before scale).

## Ten automated leak checks

See **`docs/TEN-MEMBER-LEAK-CHECKS.md`** — run `pnpm leak:checks` (10 checks + integration test).

## Commands

```bash
pnpm test
pnpm leak:checks
pnpm security:audit
```
