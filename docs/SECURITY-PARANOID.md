# Security paranoia checklist — implementation status

Non-negotiable controls for PulsePoint. Update when code changes.

| Threat | Mitigation | Status |
|--------|------------|--------|
| **Cross-tenant IDOR** | `getOrgDb(orgId)` on all tenant models; `tests/unit/db-scope.test.ts`; `scripts/security-audit.sh` blocks raw `prisma.member` | 🟡 App layer + CI grep; Postgres RLS: `prisma/sql/rls-reference.sql` |
| **Webhook trust** | Stripe signature + idempotency; `metadataMatchesRegistration()` before update | 🟢 |
| **Staff god mode** | `requireCapability()` on all actions; export/import/delete = ADMIN | 🟢 |
| **Public registration abuse** | IP + email + org rate limits; confirmation email cap | 🟢 |
| **CSV exfiltration** | `member:export` ADMIN; `member.exported` audit | 🟢 |
| **CSV pollution** | `member:import` ADMIN; dedup email; 500 row cap | 🟢 |
| **Secrets** | `security-audit.sh` secret grep | 🟢 Policy |
| **Session/org confusion** | Layout org check; `assertOrgSlugForStaff` on actions; portal `assertPortalOrgAccess` | 🟢 |
| **Supply chain** | `.npmrc` `only-built-dependencies`; lockfile in CI | 🟢 |
| **Deletion & retention** | Block delete if registrations exist; audit snapshot on delete | 🟢 |

Run: `pnpm security:audit` and `pnpm test`.
