# Security Policy — PulsePoint

## Reporting a vulnerability

Email your association IT contact or project maintainer with:

- Description and impact
- Steps to reproduce
- Affected URLs or components

Do not open public issues for undisclosed security bugs.

## Scope

PulsePoint stores **PII** (member names, emails, phones). It is **not** designed for PHI. Do not store patient clinical data without a separate HIPAA architecture review.

## Baseline controls (v0.1)

- Multi-tenant isolation via `orgId` on all domain tables and `getOrgDb(orgId)` Prisma extension
- Capability-based permissions on server actions (`lib/permissions.ts`) — not UI-only
- Clerk authentication for staff; webhook signature verification (Svix)
- Stripe webhook signature verification + idempotency keys + `AutomationException` on failure
- Zod validation on server actions and public APIs
- Rate limiting on public registration endpoint
- CSV export/import: ADMIN-only; export audited; import dedupes email per org
- Canonical staff notes on `MemberNote` (not scattered custom fields)
- Sentry configured with `sendDefaultPii: false`
- Secrets only in environment variables (`.env.local`, Vercel)

See `docs/SECURITY-PARANOID.md`, `docs/VIBE-CODE-RISKS.md`, `docs/SYSTEM-DESIGN.md`, `docs/RUNBOOK.md`, `docs/AI-DATA-POLICY.md`.

Run after changes: `pnpm security:audit`

## Deployment checklist

- [ ] Rotate all keys if `.env` was ever committed
- [ ] Enable Clerk Organizations + restrict sign-up if needed
- [ ] Configure Stripe webhook endpoints (Clerk + Stripe) to production URLs
- [ ] Use Neon or managed Postgres with TLS
- [ ] Finalize Terms and Privacy (replace stubs in `app/terms`, `app/privacy`)
