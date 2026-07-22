# PulsePoint

**The modern AMS built for healthcare associations.**

*Built by an association that got tired of paying millions for outdated software.*

PulsePoint is a multi-tenant AMS for healthcare associations, delivered as a product suite:

| Product | Status |
|---------|--------|
| **PulsePoint Work** | Available — staff admin workspace |
| **MemberCore** | Available — directory, tags, CSV import/export, audited notes |
| **PulsePoint Events** | Available — registration, Stripe payments, check-in |
| **PulsePoint Learn** | Alpha — credit types, courses, audited credit awards |
| **PulsePoint Giving** | Alpha — campaigns and donations |
| **PulsePoint Commerce** | Alpha — products + checkout via vendor-agnostic adapter |
| **PulsePoint Engage** | Alpha — templates, audiences, sends through email failover chain |
| **PulsePoint Insights** | Alpha — live KPIs + reproducible snapshots |

Status ladder: **Available** = shipped, full UX. **Alpha** = real schema + actions + admin UI; rough edges; not GA. **Coming soon** = stub only.

**Design:** [docs/DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) · tokens in `app/globals.css`

**Engineering (anti–vibe-code):** [docs/SECURITY-PARANOID.md](docs/SECURITY-PARANOID.md) · [docs/VIBE-CODE-RISKS.md](docs/VIBE-CODE-RISKS.md) · [docs/SYSTEM-DESIGN.md](docs/SYSTEM-DESIGN.md) · [docs/DATA-DICTIONARY.md](docs/DATA-DICTIONARY.md) · [docs/OPERATOR-CHECKLIST.md](docs/OPERATOR-CHECKLIST.md) · [docs/RUNBOOK.md](docs/RUNBOOK.md)

**Enterprise AMS (statewide hospital association):** [docs/ENTERPRISE-AMS-OPTIMIZED-PROMPT.md](docs/ENTERPRISE-AMS-OPTIMIZED-PROMPT.md) · [docs/ENTERPRISE-ARCHITECTURE.md](docs/ENTERPRISE-ARCHITECTURE.md) · [docs/BACKUP-REQUIREMENTS.md](docs/BACKUP-REQUIREMENTS.md) · admin hub `/[orgSlug]/enterprise`

**Quake OS (multi-agent AMS org):** [docs/QUAKE-OS.md](docs/QUAKE-OS.md) — 30+ specialist agents, continuous improvement. End each wave with **`pnpm quake:execute`** ([workflow](docs/QUAKE-EXECUTE-WORKFLOW.md)); quick check: `pnpm quake:gates`. Invoke `@quake-os-continuous-runner` or `@quake-os-orchestrator` in Cursor. [Continuous playbook](docs/QUAKE-OS-CONTINUOUS.md) · [Scale & security](docs/SCALE-AND-SECURITY.md)

After code changes: `pnpm test` · `pnpm test:e2e` (demo mode) · `pnpm security:audit`

**CI:** Unit/lint in `ci.yml`; Playwright demo wedge in `e2e.yml` — both should be required checks on `main` ([docs/E2E-CI.md](docs/E2E-CI.md)).

**Feature pillars** (operational): Members, Events, Commerce, Committees, Communications, Insights — see [docs/POSITIONING.md](docs/POSITIONING.md).

| | |
|---|---|
| **Brand** | PulsePoint |
| **Package / repo folder** | `pulsepoint` (`/Users/jordanzabady/Desktop/pulse`) |
| **Stack** | Next.js 16 · Postgres · Prisma · Clerk/Demo · Stripe · Resend (all behind adapters — see [docs/VENDOR-PORTABILITY.md](docs/VENDOR-PORTABILITY.md)) |
| **MVP data** | PII only (no PHI) |
| **Enterprise** | **Deferred** — demo only; optional Azure enterprise profile per [docs/ENTERPRISE-INTEGRATION.md](docs/ENTERPRISE-INTEGRATION.md) |

## Product mode: standalone demo

PulsePoint is a **demo AMS** today. Default env: `INTEGRATION_PROFILE=demo` (PulsePoint branding, optional demo auth — no enterprise SSO required). Enterprise integration profiles are documented in `docs/ENTERPRISE-INTEGRATION.md` when approved.

**Realization (18-month):** [docs/REALIZATION-PLAN.md](docs/REALIZATION-PLAN.md) · **UI bar:** [docs/UI-QUALITY-BAR.md](docs/UI-QUALITY-BAR.md) · **Ops gates:** [docs/SUPPORTABILITY-GATES.md](docs/SUPPORTABILITY-GATES.md) · [docs/GO-TO-MARKET-6MONTH.md](docs/GO-TO-MARKET-6MONTH.md)

**Continuity ($0 tools):** [docs/FREE-CONTINUITY-TOOLKIT.md](docs/FREE-CONTINUITY-TOOLKIT.md) — `pnpm continuity:health` · `pnpm continuity:backup` · `pnpm continuity:standby`

## Live demo on GitHub (no Vercel)

Static marketing + click-through admin preview — deployed from `gh-pages-site/` via GitHub Actions.

| Link | Purpose |
|------|---------|
| [Landing](https://jordanz00.github.io/pulsepoint/) | Marketing homepage |
| [Enter demo](https://jordanz00.github.io/pulsepoint/demo/) | One-click demo (browser session) |
| [Admin preview](https://jordanz00.github.io/pulsepoint/demo-healthcare/) | Sterling Healthcare sample dashboard |

**Setup:** Repo **Settings → Pages → Source: GitHub Actions**. Public repo required for free Pages on private accounts. See [docs/GITHUB-PAGES.md](docs/GITHUB-PAGES.md).

For the **full** database-backed app (imports, Stripe, SQLite): local quick start below.

**Sterling Healthcare demo (Protech-style tour):** `pnpm demo:setup` → http://localhost:3000/demo → see `docs/DEMO-GUIDE.md` and `docs/PROTECH-FEATURE-MAP.md`.

## Quick start (local)

**Review on your machine:** see **[LOCAL-REVIEW.md](./LOCAL-REVIEW.md)** — start `pnpm dev`, open http://localhost:3000/demo, click **Enter demo**, then http://localhost:3000/demo-healthcare

### 1. Prerequisites

- Node 22+
- pnpm 9+
- Docker (optional, for local Postgres)

### 2. Install

```bash
cd /Users/jordanzabady/Desktop/pulse
cp .env.local.example .env.local
# Fill Clerk keys at minimum for auth; DATABASE_URL works with Docker below

pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Clerk setup

1. Create an application at [clerk.com](https://clerk.com).
2. Enable **Organizations**.
3. Add keys to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Webhook endpoint: `https://<your-host>/api/webhooks/clerk`  
   Events: `user.*`, `organization.*`, `organizationMembership.*`  
   Signing secret → `CLERK_WEBHOOK_SECRET`

### 4. Stripe / Resend (optional for v0.1)

- **Stripe:** paid event checkout + `STRIPE_WEBHOOK_SECRET` on `/api/webhooks/stripe`
- **Resend:** confirmation emails after registration

See [docs/DEPLOY.md](docs/DEPLOY.md) for Vercel + Neon production steps.

## Project layout

```
app/
  (marketing)/          Landing page
  [orgSlug]/(admin)/    Staff dashboard (work, members, events, learn, giving,
                        commerce, engage, insights, settings, portal)
  [orgSlug]/e/          Public event registration (no auth)
  api/webhooks/         Clerk + Stripe
  actions/              Server actions per module
lib/                    db, auth, audit, rate-limit, products, brand
lib/adapters/           Vendor portability — auth, payments, email, storage
                        (every external dependency goes through here)
prisma/                 Schema + migrations
tests/                  Vitest + Playwright
themes/                 optional enterprise theme CSS (integration profiles)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | Playwright (demo wedge + advocacy); see [docs/E2E-CI.md](docs/E2E-CI.md) |
| `pnpm db:migrate` | Apply migrations (dev) |
| `pnpm db:seed` | Demo org seed |

## Trademark

See [docs/TRADEMARK.md](docs/TRADEMARK.md). **PulsePoint** is used instead of plain “Pulse” to reduce collision with existing healthcare and CRM marks.

## Roadmap (plan)

- **Phase 0** — Scaffold (this repo)
- **Phase 1** — Member CRM polish
- **Phase 2** — Events + payments + email
- **Phase 3** — Member portal (Clerk-linked members)
- **Phase 4** — Platform billing, marketing site, beta
- **Phase 5** — Roadmap modules (Learn, Giving, Commerce, Engage, Insights) — **alpha today**, GA over the [6-month plan](docs/GO-TO-MARKET-6MONTH.md)

## Bulletproof stack (vendor-agnostic by design)

Every external service is behind a typed adapter under `lib/adapters/`:

| Layer | Primary | Fallback | Self-host |
|---|---|---|---|
| Auth | Clerk | Demo signed-cookie | Auth.js + Postgres |
| DB | Postgres on Neon | Any Postgres host | SQLite (dev) |
| Hosting | Vercel | Self-host Node | Azure Container Apps |
| Payments | Stripe | Manual + HMAC webhook | Adyen (planned) |
| Email | Resend | Generic SMTP | Log-only |
| Storage | S3-compatible (R2/B2/AWS) | Local FS | NAS / VM disk |

If any single vendor goes dark, swap by env var + redeploy. Full failure plan: [docs/VENDOR-PORTABILITY.md](docs/VENDOR-PORTABILITY.md).

## Security

See [SECURITY.md](SECURITY.md).
