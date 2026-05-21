# Security Policy — PulseCore

## Reporting a vulnerability

Email your association IT contact or project maintainer with:

- Description and impact
- Steps to reproduce
- Affected URLs or components

Do not open public issues for undisclosed security bugs.

## Scope

PulseCore stores **PII** (member names, emails, phones). It is **not** designed for PHI. Do not store patient clinical data without a separate HIPAA architecture review.

## Baseline controls (v0.1)

- Multi-tenant isolation via `orgId` on all domain tables and `getOrgDb(orgId)` Prisma extension
- Clerk authentication for staff; webhook signature verification (Svix)
- Stripe webhook signature verification + idempotency keys
- Zod validation on server actions and public APIs
- Rate limiting on public registration endpoint
- Sentry configured with `sendDefaultPii: false`
- Secrets only in environment variables (`.env.local`, Vercel)

## Deployment checklist

- [ ] Rotate all keys if `.env` was ever committed
- [ ] Enable Clerk Organizations + restrict sign-up if needed
- [ ] Configure Stripe webhook endpoints (Clerk + Stripe) to production URLs
- [ ] Use Neon or managed Postgres with TLS
- [ ] Finalize Terms and Privacy (replace stubs in `app/terms`, `app/privacy`)
