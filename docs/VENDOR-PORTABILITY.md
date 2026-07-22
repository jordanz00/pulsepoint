# PulsePoint Vendor Portability — Bulletproof Stack

**Why this doc exists.** The user requirement is explicit: *"Stack it the best way you can to keep it working right for good. Make it work no matter what happens to the other platforms. Always have a backup plan if one of those platforms fails or goes under or dissolves. This needs to be bullet proof."*

PulsePoint follows an **adapter pattern** for every external dependency. Each layer ships with a **primary** vendor, a **fallback**, and a **self-host** option. Code never imports a vendor SDK directly outside the adapter folder — features go through `lib/adapters/<layer>/`.

This is not "infrastructure-as-marketing." Every adapter listed below either ships today or is a stub with a documented swap path.

## Principles (non-negotiable)

1. **No vendor lock-in at the call site.** Application code talks to typed interfaces in `lib/adapters/types.ts`, never to a vendor SDK directly.
2. **Primary, fallback, self-host.** Every layer documents three options. If the primary vanishes, the fallback can run next-day. If both vanish, the self-host option always works.
3. **Failover is automatic where possible** (e.g. email chain). Where automatic failover is unsafe (e.g. payments), the swap is one env var + a deploy.
4. **Adapters expose `isConfigured()`** so resolvers pick the most useful active adapter instead of crashing.
5. **No invented capabilities.** If we don't actually wrap a vendor, the adapter is marked `stub` and the swap path is documented honestly.

## Status legend

- **shipped** — adapter file exists and is wired into application code
- **stub** — interface implemented; vendor SDK call documented but not exercised in production
- **planned** — interface defined; no implementation yet

---

## Layer-by-layer fallback matrix

### 1. Authentication (`lib/adapters/auth/`)

| Role | Adapter | File | Notes |
|---|---|---|---|
| Primary (today) | Clerk | `clerk.ts` | Hosted auth + orgs. Fastest path to GA. |
| Fallback (free, standalone) | Demo signed cookie | `demo.ts` | HMAC-signed cookie; runs without any vendor. Ships with the app. |
| Enterprise target | Microsoft Entra ID | `entra.ts` | **shipped** — PKCE SSO + Graph adapter (`lib/adapters/microsoft365/`). |
| Self-host | Lucia / Auth.js + Postgres | _planned_ | When a customer demands "no SaaS auth." |

**Resolver:** `lib/adapters/auth/index.ts` picks Demo > Clerk > Entra in that priority. Status: **shipped**.

**Failure plan:**

- Clerk goes down: ops sets `DEMO_MODE=true` (env), redeploys, login resumes within minutes for staff.
- Clerk dissolves: data is in our DB (`User`, `OrgMembership`); migrate to Auth.js + Postgres in days, not months.
- Customer mandates Entra: enable `INTEGRATION_PROFILE=hap-azure`, finish `entra-stub.ts`, deploy.

### 2. Database (`prisma/`)

| Role | Vendor | Notes |
|---|---|---|
| Primary (production) | Postgres on Neon | Managed, branch DBs, generous free tier. |
| Fallback | Postgres on Supabase / Render / RDS / Azure Database | Same engine — connection string swap. |
| Local / demo | SQLite (`prisma/dev.db`) | File-based; ships with repo. |
| Enterprise | Azure Database for PostgreSQL | Same Prisma schema. |

**Failure plan:** Neon outage → restore PITR backup to any Postgres host; change `DATABASE_URL`; redeploy. Schema portability proven by SQLite/Postgres dual support today.

### 3. Hosting (App)

| Role | Vendor | Notes |
|---|---|---|
| Primary | Vercel | Next.js native. Fastest CI/CD. |
| Fallback | Self-host on a single Linux box (Caddy + Node) | App is plain Next.js; runs anywhere Node runs. |
| Enterprise | Azure Container Apps / App Service | Containerized via standard `Dockerfile`. |

**Failure plan:** Vercel pricing change or outage → build the container, push to any registry, run on the fallback box. No Vercel-specific code (no `next/server` Edge runtime hard requirements outside middleware).

### 4. Payments (`lib/adapters/payments/`)

| Role | Adapter | File | Status |
|---|---|---|---|
| Primary | Stripe | `stripe.ts` | **shipped**. Used by Commerce module. |
| Fallback | Manual / offline + HMAC webhook | `manual.ts` | **shipped**. Always available. Use when ops needs to record a wire / check / cash payment. |
| Alt processor | Adyen / Square | _planned_ | Same `PaymentAdapter` interface. |

**Resolver:** `lib/adapters/payments/index.ts` picks Stripe if configured, else Manual. **Manual is always available** so payments never block.

**Failure plan:**

- Stripe outage: orders still record at `PENDING` status; staff close them later via manual adapter.
- Stripe dissolves: implement Adyen against `PaymentAdapter`, change `PAYMENT_ADAPTER` env, redeploy.

### 5. Email (`lib/adapters/email/`)

| Role | Adapter | File | Status |
|---|---|---|---|
| Primary | Resend | `resend.ts` | **shipped**. |
| Fallback | Generic SMTP (nodemailer) | `smtp.ts` | **shipped**. Optional dep loaded only when SMTP is used. |
| Last resort | Log-only | `log.ts` | **shipped**. Records to server logs so audit trail never breaks. |

**Resolver:** `lib/adapters/email/index.ts` provides `sendEmailWithFailover()` — tries Resend → SMTP → log. Used by event registration confirmation today.

**Failure plan:** Resend outage → `EMAIL_ADAPTER=smtp` env var → next send goes through SMTP. No code change.

### 6. Storage (`lib/adapters/storage/`)

| Role | Adapter | File | Status |
|---|---|---|---|
| Primary (cloud) | S3-compatible (AWS S3, Cloudflare R2, Backblaze B2, MinIO) | `s3.ts` | **shipped** (SDK loaded only when used). |
| Fallback / self-host | Local filesystem (`STORAGE_LOCAL_DIR`) | `local.ts` | **shipped**. Works on a laptop or single VM. |

**Failure plan:** AWS pricing change → point to R2 or B2 (S3-compatible) — same adapter, change env vars only. Total outage of object storage → switch to local mode on a NAS or VM disk.

### 7. Background work / scheduled tasks

| Role | Vendor | Notes |
|---|---|---|
| Primary (today) | Vercel Cron / GitHub Actions + server actions | Renewal sweeps, KPI snapshots, throttled sends. |
| Enterprise | Azure Functions / Logic Apps | Same handlers; swap trigger only. |

### 8. Observability

| Role | Vendor | Notes |
|---|---|---|
| Primary | Console + structured server logs | Always works. No vendor required. |
| Add-on | Sentry (errors) + Vercel Analytics (web vitals) | Optional. |
| Self-host | OpenTelemetry → any OTLP backend (Tempo/Loki/Grafana) | Standard format, vendor-agnostic. |

### 9. Search

| Role | Vendor | Notes |
|---|---|---|
| Today | Postgres `LIKE` / trigram | No vendor required for the current member directory scale. |
| Add-on | Typesense / Meilisearch (self-hostable) | When > ~50k members or full-text needs grow. |
| Cloud | Algolia | Optional — never required. |

### 10. Microsoft 365 (`lib/adapters/microsoft365/`)

| Role | Capability | File | Status |
|---|---|---|---|
| Primary | Graph mail / calendar / contacts (delegated) | `capabilities/*.ts` | **shipped** (read-only pilot). |
| SSO | Entra ID PKCE | `lib/adapters/auth/entra.ts` | **shipped** when `INTEGRATION_PROFILE=pilot-entra`. |
| Connection store | Org tokens + sync payload | `connection-store.ts` | **shipped** (`IntegrationVendor.MICROSOFT_365`). |

**Failure plan:** Graph outage → show last synced snapshot on integrations page; staff SSO unaffected if Entra login still works.

See `docs/MICROSOFT-365-INTEGRATION.md`.

### 11. Public CMS — EasyDNN (`lib/adapters/cms/`)

| Role | Capability | File | Status |
|---|---|---|---|
| Primary | HTML module export (events, directory) | `easydnn-html.ts` | **shipped**. |
| Site config | Org DNN base URL + paths | `easydnn-store.ts` | **shipped** (`IntegrationVendor.EASYDNN`). |

**Failure plan:** No live API dependency — exports are copy/paste HTML. Association IT pastes modules manually.

See `docs/EASYDNN-INTEGRATION.md`.

---

## What to do on Day 1 if a vendor breaks

| Vendor | Time to recover | Action |
|---|---|---|
| Clerk | 5–15 min | Set `DEMO_MODE=true`, redeploy. Plan Entra/Auth.js swap that week. |
| Resend | < 5 min | Set `EMAIL_ADAPTER=smtp` (or rely on log fallback) and redeploy. |
| Stripe | 0 min for receive; same-day for new charges | Manual adapter takes over; new charges via alt processor that week. |
| Neon | Hours (PITR restore) | Change `DATABASE_URL` to fallback Postgres host; redeploy. |
| Vercel | Hours (container deploy) | Build container, deploy to fallback host. |
| AWS S3 | Minutes (env swap) | Point to R2 / B2 / local storage via `STORAGE_*` envs. |

## What this is **not**

- This is **not** a guarantee that every fallback is fully exercised in production today. Some adapters remain stubs (alt payment processors, EasyDNN live API). The contract is: **the interface is real and the swap path is documented**, not that we have a hot standby for every vendor.
- This is **not** a promise of zero downtime. It's a promise that **no single vendor going dark kills the platform**.
- **RTO tiers:** [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md) — cold (hours) vs warm standby (minutes). **Instant** failover requires a **pre-running** second host (`Dockerfile`, `docker-compose.standby.yml`).
- **Full risk matrix:** [AMS-PLATFORM-RISKS-AND-MITIGATIONS.md](./AMS-PLATFORM-RISKS-AND-MITIGATIONS.md).

## Contract for new features

When you add a feature that touches an external service:

1. **Look for an adapter first** in `lib/adapters/<layer>/`.
2. **If there's no adapter, add one** under the appropriate layer with `id`, `isConfigured()`, and the typed methods from `lib/adapters/types.ts`.
3. **Never import a vendor SDK outside `lib/adapters/<layer>/`** in shipped code. Direct SDK use is acceptable temporarily during migration; mark with `// TODO(adapter)` and link to a tracking issue.
4. **Document the fallback** in this file and in `docs/ROADMAP-MODULES.md` if it's tied to a roadmap module.

## Related docs

- `docs/ENTERPRISE-INTEGRATION.md` — enterprise Azure swap profile.
- `docs/GO-TO-MARKET-6MONTH.md` — phased delivery aligned with these vendors.
- `docs/ROADMAP-MODULES.md` — which adapters each module needs.
- `lib/adapters/types.ts` — the source-of-truth interfaces.
