# Subprocessors (IT & privacy questionnaire)

**Owner:** Security / ops (assign name before go-live).  
**Last reviewed:** May 2026 — replace stub privacy page with counsel-approved policy.

| Vendor | Purpose | Data categories | Region / residency | DPA / notes |
|--------|---------|-----------------|-------------------|-------------|
| **Clerk** | Authentication, org membership, session | Email, name, org role, session tokens | US (verify contract) | BAA not required (no PHI); sign DPA |
| **Stripe** | Event registration payments | Email, name, payment metadata, card (Stripe-hosted) | Per Stripe account | PCI scope reduced (Checkout); webhook secrets in env only |
| **Neon** (or host Postgres) | Primary database | All tenant PII in app tables | Configure per contract | Encryption at rest; connection string in Vercel env |
| **Resend** | Transactional email (registration confirm) | Email, name, event title | Resend policy | Soft-fail queue if send fails |
| **Vercel** | Hosting, edge, logs | HTTP logs, env secrets | Vercel region setting | No member DB on Vercel filesystem |
| **Sentry** | Error monitoring | Stack traces, request context (scrub PII) | Sentry project settings | Enable scrubbing; no PHI by policy |

## Not subprocessors (in-repo only)

- Application logic (Next.js) — your deployment
- Vitest / Playwright — dev only

## Customer obligations

- Clerk is identity provider; customers manage their Clerk org admins
- Stripe Connect/account owned by customer for production payouts
- Export/delete: ADMIN CSV export + member delete today; formal DSAR workflow roadmap

## Updates

Add a row before integrating any new SaaS (analytics, chat, AI API). Update `app/privacy/page.tsx` the same week.
