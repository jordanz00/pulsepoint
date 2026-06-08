# Enterprise integration (future) — Microsoft Azure + HAP web

**Status:** Not started. PulsePoint today is a **standalone demo product**.

Do **not** wire this repo to HAP production systems, `www.haponline.org`, or Azure tenants until the AMS wedge is complete and stakeholders sign off on integration.

This document is the **swap map** so that work is a configuration + adapter pass, not a rewrite.

---

## Principles

1. **Demo profile now** — `INTEGRATION_PROFILE=demo` (default): PulsePoint branding, demo auth, no HAP SSO, no Azure resources required.
2. **One boundary per concern** — auth, database, hosting, email, payments, public marketing, and brand theme each have a single integration point in code.
3. **Env-driven** — production HAP/Azure values live in host secret stores (Azure Key Vault, App Service settings), never committed.
4. **Honest product scope** — MemberCore + Events first; haponline.org links are navigation only until IT defines CMS/embed contracts.

---

## Integration profile switch

| Profile | When | Brand | Auth | Typical host |
| --- | --- | --- | --- | --- |
| `demo` | **Now** | PulsePoint | Demo cookie and/or Clerk (optional) | Local, Vercel preview, any Node host |
| `hap-azure` | **Later** | HAP + PulsePoint co-brand | Microsoft Entra ID / Azure AD B2C | Azure App Service or Container Apps + Azure Database for PostgreSQL |

Set in `.env.local` (see `.env.local.example`):

```env
INTEGRATION_PROFILE=demo
```

Future:

```env
INTEGRATION_PROFILE=hap-azure
# Plus Azure-specific vars documented in the hap-azure section below.
```

Code entry: `lib/integration-profile.ts`, `components/brand-logo.tsx`.

---

## Swap map: today → Azure / HAP

| Concern | Today (demo / prototype) | Future (HAP + Azure) | Touch files |
| --- | --- | --- | --- |
| **Staff auth** | Demo mode (`lib/demo-mode.ts`) or Clerk | **Microsoft Entra ID** (workforce) or **Azure AD B2C** (external) | `lib/auth.ts`, `middleware.ts`, `components/app-providers.tsx` |
| **Member portal auth** | Clerk user ↔ `Member.clerkUserId` | Entra/B2C subject ID column + mapping table | `prisma/schema.prisma`, `app/actions/portal.ts` |
| **Database** | SQLite file or Neon Postgres | **Azure Database for PostgreSQL** Flexible Server | `lib/prisma.ts`, `DATABASE_URL`, migrations |
| **Hosting** | Vercel / local Node | **Azure App Service** (Linux + Node 22) or **Azure Container Apps** | `docs/DEPLOY.md` → add `docs/DEPLOY-AZURE.md` |
| **Secrets** | `.env.local` | **Azure Key Vault** references in App Service | New deploy doc only |
| **File / CDN assets** | `public/` on app host | **Azure Blob** + CDN (optional) | Static asset URLs in env |
| **Email** | Resend (optional) | **Azure Communication Services Email** or org SMTP relay | `lib/email.ts` (create adapter) |
| **Payments** | Stripe (optional) | Stripe and/or org finance system — **business decision**, not forced by Azure | `lib/stripe.ts`, webhooks |
| **Errors / APM** | Vercel logs / optional Sentry | **Azure Application Insights** | `instrumentation.ts`, Sentry swap |
| **Public marketing** | In-app `(marketing)/` routes | **haponline.org** CMS pages deep-linking to PulsePoint app URL | Marketing routes + env `NEXT_PUBLIC_MARKETING_SITE_URL` |
| **Brand / theme** | PulsePoint demo palette | HAP April 2025 tokens + official logo | `themes/hap-enterprise.css` (future), `components/brand-logo.tsx` |
| **SSO from HAP site** | None | Entra app registration redirect URIs → PulsePoint `/sign-in` callback | Entra app reg + `lib/auth.ts` adapter |

---

## www.haponline.org (website) — how it should connect later

**Today:** No embed, no shared cookies, no API calls to HAP infrastructure.

**Later (typical patterns — pick one with IT):**

| Pattern | Description |
| --- | --- |
| **A. Link-out** | HAP site menus link to `https://ams.haponline.org` (or similar) — simplest, lowest risk |
| **B. Reverse proxy** | Azure Front Door / App Gateway path `/pulsepoint/*` → app origin — single domain, IT-managed |
| **C. iframe embed** | Only if IT + security approve CSP and session model — usually avoided for admin apps |

PulsePoint should expose:

- `NEXT_PUBLIC_MARKETING_SITE_URL=https://www.haponline.org` for “Back to HAP” chrome in `hap-azure` profile
- `NEXT_PUBLIC_APP_URL` for the AMS origin (never hardcode haponline.org as the app host unless proxy pattern B is final)

---

## Microsoft auth swap (Clerk → Entra)

**Do not start until demo AMS is feature-complete.**

High-level steps:

1. Register app in **Microsoft Entra ID** (single tenant for HAP staff) or **B2C** if members self-serve.
2. Replace `clerkAuth()` in `lib/auth.ts` with `entraAuth()` that returns the same `StaffSession` shape (`userId`, `orgId`, `orgSlug`, `role`).
3. Map Entra groups → `OrgRole` (`OWNER` / `ADMIN` / `STAFF`) via `OrgMembership` or group claims.
4. Remove or gate `ClerkProvider` in `components/app-providers.tsx` when `INTEGRATION_PROFILE=hap-azure`.
5. Update `docs/SUBPROCESSORS.md` row: Clerk → Microsoft.

Member-facing portal may stay on B2C while staff uses Entra — two app registrations, one Postgres DB.

---

## Azure database swap (Neon / SQLite → Azure PostgreSQL)

1. Provision **Azure Database for PostgreSQL** (Flexible Server).
2. Set `DATABASE_URL` to Azure connection string (SSL required).
3. Run `pnpm exec prisma migrate deploy` against Azure once per environment.
4. Keep `getOrgDb(orgId)` unchanged — tenant logic stays in app code; optional **Postgres RLS** as second layer per `docs/SYSTEM-DESIGN.md`.

---

## Brand swap (demo → HAP)

1. Set `INTEGRATION_PROFILE=hap-azure`.
2. Import `themes/hap-enterprise.css` in `app/globals.css` (file added when HAP approves — not used in demo).
3. `BrandLogo` renders HAP mark; co-brand “PulsePoint” text per HAP guidelines PDF.
4. Re-run marketing claim validation (`pnpm claims:validate`).

Assets for HAP live in `public/` but are **inactive** until `hap-azure` profile is enabled.

---

## What stays the same (no swap)

- Multi-tenant `orgId` + `getOrgDb()`
- `requireCapability()` permission matrix
- Member import staging → review → apply
- Event registration state machine + webhook idempotency pattern (vendor-agnostic)
- Live vs Roadmap product claims (`lib/products.ts`, `docs/PRODUCT-CLAIMS.md`)
- Audit log model

---

## Checklist before flipping `hap-azure`

- [ ] MemberCore + Events pass operator checklist (`docs/OPERATOR-CHECKLIST.md`)
- [ ] Production Stripe/Entra runbooks owned by named staff
- [ ] Counsel-approved privacy + subprocessors include Microsoft/Azure rows
- [ ] Entra app registration + redirect URLs on non-production first
- [ ] IT security review for tenant isolation + export paths
- [ ] haponline.org link/proxy pattern signed off by HAP web team
- [ ] `DEMO_MODE` disabled in production

---

## Related docs

| Doc | Purpose |
| --- | --- |
| `docs/DEMO-MODE.md` | Standalone demo (no HAP, no Clerk required) |
| `docs/FREE-STACK.md` | $0 prototype hosting |
| `docs/SUBPROCESSORS.md` | Vendor table — update when Azure replaces Clerk/Neon/Vercel |
| `docs/DEPLOY.md` | Current deploy path — add Azure sibling when ready |
| `lib/integration-profile.ts` | Profile enum + helpers |
