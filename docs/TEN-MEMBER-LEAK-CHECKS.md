# Ten security checks — prevent association member list leaks

**Run:** `pnpm leak:checks` (included in `pnpm security:audit` and CI)

Each check blocks a real leak path: cross-tenant query, ungated export, or unauthenticated list API.

| # | Check | What it prevents |
|---|--------|------------------|
| 1 | No `prisma.member` in app code | Bypassing `getOrgDb(orgId)` |
| 2 | `Member` in `ORG_SCOPED_MODELS` | Extension forgetting the Member table |
| 3 | Every file with `member.find*` imports `getOrgDb` | Stray queries without tenant client |
| 4 | `requireOrgAccessForSlug` on admin layout | URL slug IDOR (view another association’s list) |
| 5 | `exportMembersCsv` requires `member:export` | Any staff downloading full directory |
| 6 | `assertAllRowsBelongToOrg` in `fetchMembers` | ORM/extension bug returning wrong `orgId` rows |
| 7 | No `member.findMany` in `app/api` | Public HTTP endpoint leaking directories |
| 8 | Integration test (two orgs in Postgres) | Proves org A cannot see org B by email or list |
| 9 | Unit tests for `lib/tenant-guards.ts` | Runtime guard cannot regress silently |
| 10 | Export writes `member.exported` audit | Accountability if a list leaves the system |

## Runtime layer (`lib/tenant-guards.ts`)

- **`assertAllRowsBelongToOrg`** — throws `TENANT_LEAK` before CSV or action response is returned  
- **`capMemberListRows`** — max 500 rows per list/export path  
- Used in: `app/actions/members.ts`, `app/[orgSlug]/(admin)/members/page.tsx`

## Integration test

`tests/integration/member-tenant-isolation.test.ts` runs when `DATABASE_URL` is set (CI after `prisma migrate deploy`). Skipped locally without a database.

## If a check fails

Do not pilot member export or cutover until fixed. A single cross-tenant row in a CSV is a reportable incident.

## Related

- `docs/ISOLATION-AUDIT.md` — LEGO-style audit summary  
- `docs/RUNBOOK.md` §5 — cross-org data concern  
- `lib/db.ts` — `getOrgDb` extension
