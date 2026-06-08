# Scale & security — PulsePoint AMS

**Audience:** Engineering, IT, Quake OS security/scale agents  
**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## Tenant isolation (non-negotiable)

| Control | Implementation |
|---------|----------------|
| Org-scoped DB | `getOrgDb(orgId)` — all member/org queries |
| Runtime guard | `assertAllRowsBelongToOrg()` on list returns |
| CI | `pnpm leak:checks` — 10 checks |
| Capabilities | `requireCapability()` on export, import, delete, money |
| Integration test | `tests/integration/member-tenant-isolation.test.ts` |

---

## Query & export caps (large data)

| Constant | Value | File |
|----------|-------|------|
| `MAX_MEMBER_LIST_ROWS` | 500 | `lib/tenant-guards.ts` |
| `MAX_IMPORT_ROWS` | 10,000 | `lib/member-import-limits.ts` |
| `IMPORT_BATCH_SIZE` | 500 | `lib/pagination.ts` |
| `DEFAULT_ADMIN_LIST_CAP` | 500 | `lib/query-limits.ts` |
| `DEFAULT_DASHBOARD_LIST_CAP` | 100 | `lib/query-limits.ts` |
| `ADVOCACY_LIST_CAP` | 50 | `lib/query-limits.ts` |
| `ENGAGE_SEND_LIMIT` | 50 (env) | `app/actions/engage.ts` |

**Rule:** New `findMany` without cursor pagination must use `clampTake()` or document why unbounded is safe.

---

## State hospital association scale targets

| Scenario | Target | Today |
|----------|--------|-------|
| Member roster | 5,000–50,000 contacts | Virtual directory + caps |
| Hospital accounts | 200–500 | `MemberOrganization` + facility roster |
| Import cutover | 10k rows/batch | Staged import |
| Advocacy campaigns | 50 issues/page cap | `ADVOCACY_LIST_CAP` |

**Postgres:** Use pooled `DATABASE_URL`; index on `(orgId, status)`, `(orgId, engagementTier)` — see Prisma schema `@@index`.

---

## Security patterns

- No secrets in source — env only (`.env.local.example`)
- Parameterized Prisma queries only
- Safe DOM — `textContent` / `createElement`; no `innerHTML` with user input
- Audit log on sensitive actions — `lib/audit.ts`
- Renewal/billing cron gated — `PULSE_CRON_RENEWALS` / `PULSE_CRON_SUBSCRIPTIONS`
- Rate limits on public registration — see `docs/SECURITY-PARANOID.md`

---

## Quake OS verification

```bash
pnpm quake:gates
# claims + leak + test + typecheck + status board
```

---

## Roadmap (scale)

- Cursor-based pagination on all admin tables >500 rows
- Read replicas / warehouse for analytics (Power BI path)
- Postgres RLS as defense-in-depth (reference DDL in IT handoff)
