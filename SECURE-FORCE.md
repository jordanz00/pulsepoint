# SECURE-FORCE — AI session security checklist (PulsePoint)

Run after **every** AI coding session that touches data paths, auth, APIs, or integrations.

## Automated (run first)

```bash
cd /path/to/pulse
pnpm security:audit
pnpm test tests/unit/security-*.test.ts
```

## Manual grep (red flags)

```bash
# SQL injection — template literals in queries
grep -rnE '(query|execute|run)\s*\(\s*`[^`]*\$\{' --include='*.ts' --include='*.tsx' app lib packages

# Prisma unsafe raw SQL
grep -rn '\$queryRawUnsafe\|\$executeRawUnsafe' --include='*.ts' app lib packages

# XSS — unsafe DOM
grep -rn '\.innerHTML\s*=' --include='*.ts' --include='*.tsx' app components lib

# Phantom validators (called but not implemented)
grep -rn '_normalize\|_sanitize\|_validate' --include='*.ts' app lib

# Secrets in source
grep -rnE 'sk_live_|pk_live_|whsec_[a-zA-Z0-9]{20,}' --include='*' . --exclude-dir=node_modules

# Unguarded LLM SDKs
grep -rnE 'openai|@ai-sdk|anthropic|generateText' --include='*.ts' app lib
# Allowed only with lib/security/llm-boundary.ts integration
```

## Code rules (non-negotiable)

1. **SQL:** Prisma only. Parameterized. No unsafe raw helpers.
2. **Tenant:** `getOrgDb(orgId)` for member/event/audit models — never bare `prisma.member`.
3. **Mutations:** `requireCapability()` — not UI-only checks.
4. **Public APIs:** Zod + rate limit + body size cap.
5. **Audit:** `writeAuditLog()` only — diff auto-redacted.
6. **Fetch:** `isAllowedEndpoint()` before outbound URLs.
7. **LLM:** No model calls without `lib/security/llm-boundary.ts` + staff auth + structured output.
8. **Secrets:** Environment variables only — never commit `.env.local`.

## New feature checklist

- [ ] Input validated (Zod or `normalizeFormPayload` pattern)
- [ ] Org scoped (`getOrgDb` / `requireOrgAccessForSlug`)
- [ ] Capability checked for staff mutations
- [ ] Audit log for sensitive changes
- [ ] No PII in client error messages
- [ ] Rate limit if public or copilot route
- [ ] `pnpm security:audit` passes

## Production fail-safes

| Env | Requirement |
|-----|-------------|
| `CRON_SECRET` | Required in production (cron returns 401 without it) |
| `DEMO_MODE` | Blocked in production unless `HOSTED_DEMO=true` on Vercel Preview |
| `PULSE_STRICT_PRODUCTION_GUARDS` | Optional: throw on boot if guards fail |

See `docs/DATA-SECURITY-PLAN.md` for full architecture.
