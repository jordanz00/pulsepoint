# PulsePoint Data Security Plan

**Scope:** Main AMS (`/app`, `/lib`) + ad-ops API (`packages/api`, `packages/worker`).  
**Principle:** Fail closed — AI-generated code must pass the same gates as human code.

## 1. Defense layers (mandatory choke points)

| Layer | Control | Location |
|-------|---------|----------|
| **Ingress** | Zod + `normalizePayload()` | `lib/validations/*`, `lib/security/normalize-payload.ts` |
| **Tenant** | `getOrgDb(orgId)` + `assertAllRowsBelongToOrg` | `lib/db.ts`, `lib/tenant-guards.ts` |
| **SQL** | Prisma parameterized queries only; CI blocks raw SQL | `scripts/security-audit.sh` |
| **Auth** | Clerk / Entra + `requireCapability()` | `lib/auth.ts`, `lib/permissions.ts` |
| **Rate limit** | Public forms, registration, copilot | `lib/security/api-guard.ts`, `lib/rate-limit.ts` |
| **Outbound** | URL allowlist for fetch | `packages/shared/src/url-allowlist.ts` |
| **Audit** | `redactForAudit()` before persist | `lib/audit.ts`, `lib/security/audit-redact.ts` |
| **Copilot / LLM** | Template-only today; `llm-boundary.ts` before any model | `lib/security/llm-boundary.ts` |
| **Production** | `CRON_SECRET` required; demo mode blocked | `lib/security/production-guards.ts` |
| **Headers** | `X-Content-Type-Options`, `X-Frame-Options`, etc. | `next.config.ts` |

## 2. SQL injection — fail-safe

| Rule | Enforcement |
|------|-------------|
| No string-built SQL | Prisma client only in app code |
| No `$queryRawUnsafe` / `$executeRawUnsafe` | CI grep in `security-audit.sh` |
| No template literals in `.query()` / `.execute()` | CI grep |
| All API inputs bounded | Zod max lengths + enums |
| Postgres RLS (roadmap) | `prisma/sql/rls-reference.sql` |

**If a feature needs raw SQL:** use tagged `` prisma.$queryRaw`...` `` with **no** interpolation, security review required.

## 3. Prompt injection — fail-safe

| Today | Future LLM |
|-------|------------|
| Executive copilot = DB metrics → template strings | `PULSE_LLM_ENABLED=true` + org flag + staff auth |
| `sanitizeText()` on audit summaries in briefings | Never pass member notes / form text to system prompt |
| `sanitizeCopilotBriefOutput()` on API response | Structured JSON output via Zod schema only |
| CI blocks unguarded OpenAI/AI SDK imports | `assertLlmProviderAllowed()` at provider boundary |

See `SECURE-FORCE.md` for post-AI-session grep checklist.

## 4. Data classification

| Class | Examples | Storage | Export |
|-------|----------|---------|--------|
| PII | Name, email, phone | Tenant-scoped Postgres | ADMIN + audit |
| Financial | Stripe IDs, order totals | Tenant-scoped | Capability-gated |
| Auth secrets | OAuth tokens | `IntegrationConnection.config` — redact in audit | Never in client |
| PHI | Clinical records | **Out of scope** — do not store |

Ad-ops detail: `docs/ad-ops/DATA-CLASSIFICATION.md`.

## 5. Platform-specific surfaces

| Surface | SQLi risk | Injection risk | Mitigation |
|---------|-----------|----------------|------------|
| Server actions | Low (Prisma) | Low | Zod + capabilities |
| Public registration | Low | Medium (names) | Rate limit + Zod |
| Public web forms | Low | Medium | Rate limit + `normalizeFormPayload` |
| Webhooks (Stripe/Clerk) | Low | Low | Signature + idempotency |
| Microsoft Graph | N/A | Low | Fixed host; delegated scopes |
| EasyDNN export | N/A | Medium (HTML) | Escape attendee fields; staff-only export |
| Copilot API | Low | Medium (audit text) | Sanitize + template-only |

## 6. CI / human gates

```bash
pnpm security:audit    # tenant leaks, SQLi patterns, innerHTML, secrets, LLM imports
pnpm leak:checks       # 10 member directory leak tests
pnpm test              # includes lib/security unit tests
```

Before production deploy:

- [ ] `CRON_SECRET` set (≥24 chars)
- [ ] `DEMO_MODE` unset or `HOSTED_DEMO` preview only
- [ ] Clerk / Entra production apps configured
- [ ] Stripe webhook secrets rotated
- [ ] Optional: `PULSE_STRICT_PRODUCTION_GUARDS=true` to fail boot on violations

## 7. Incident response

See `docs/INCIDENT-RESPONSE.md`.

## 8. Related docs

- `SECURITY.md` — reporting + baseline controls
- `SECURE-FORCE.md` — AI coding session checklist
- `docs/SECURITY-PARANOID.md` — threat matrix
- `docs/ad-ops/SECURITY-AD-OPS.md` — Fastify ad-ops OWASP map
- `docs/ad-ops/THREAT-MODEL.md` — STRIDE
- `docs/VIBE-CODE-RISKS.md` — AI codegen failure modes
