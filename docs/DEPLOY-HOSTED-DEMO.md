# Deploy a hosted one-click demo (Vercel + Neon)

**Goal:** Share `https://your-app.vercel.app/demo` — Enter demo → full admin with seeded Sterling Healthcare data.

**Not GitHub Pages:** Next.js server routes, Postgres, and cookies need a runtime. Vercel provides that.

---

## Critical: demo mode on Vercel

| Vercel environment | `DEMO_MODE` | `HOSTED_DEMO` | Result |
|--------------------|-------------|---------------|--------|
| **Preview** (PR / branch deploys) | `true` | `true` | One-click demo works |
| **Production** | **unset** | **unset** | Real Clerk auth only — demo refused by design |

Vercel always runs `NODE_ENV=production`. Plain `DEMO_MODE=true` on Production **does not work** (and must not be enabled). Hosted demo uses **`HOSTED_DEMO=true` on Preview only** — see `lib/demo-mode-gates.ts`.

---

## Prerequisites

- Repo on GitHub: `https://github.com/jordanz00/pulsepoint` (already connected)
- [Neon](https://neon.tech) Postgres project (free tier)
- Optional for full wedge: Clerk + Stripe test keys (demo mode can skip Clerk)

---

## Step 1 — Neon database

1. Create a Neon project.
2. Copy the **pooled** connection string (`-pooler` in hostname).
3. Locally:

   ```bash
   cd /Users/jordanzabady/Desktop/pulse
   export DATABASE_URL="postgresql://…?sslmode=require"
   pnpm exec prisma migrate deploy
   DATABASE_URL="postgresql://…" pnpm db:seed:demo
   ```

> **Note:** Local dev may use SQLite (`file:./prisma/demo.db`). Hosted Vercel uses Postgres migrations in `prisma/migrations/`. CI expects Postgres.

---

## Step 2 — Vercel project

1. [vercel.com](https://vercel.com) → Add New Project → import `jordanz00/pulsepoint`.
2. Framework: Next.js (auto-detected). Root: `.`
3. Build: `pnpm build` (includes `prisma generate` via `postinstall`).

**CLI (optional):**

```bash
cd /Users/jordanzabady/Desktop/pulse
vercel login
vercel link
vercel env add DATABASE_URL
# … add vars below
vercel
```

---

## Step 3 — Environment variables

### Preview (hosted demo)

Set for **Preview** only:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon pooled URL |
| `NEXT_PUBLIC_APP_URL` | `https://<preview-url>.vercel.app` (update after first deploy) |
| `DEMO_MODE` | `true` |
| `HOSTED_DEMO` | `true` |
| `DEMO_SESSION_SECRET` | `openssl rand -hex 32` |
| `INTEGRATION_PROFILE` | `demo` |

Clerk / Stripe / Resend optional for demo walkthrough (paid events need Stripe test keys).

### Production (later — real pilot)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon URL (can be same DB or separate) |
| `NEXT_PUBLIC_APP_URL` | Production domain |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook |
| `STRIPE_*` | As needed |
| **Do not set** | `DEMO_MODE`, `HOSTED_DEMO`, `DEMO_SESSION_SECRET` |

---

## Step 4 — Deploy Preview

Push to `main` or open a PR. Vercel creates a **Preview** deployment.

1. Open `https://<branch>--<project>.vercel.app/demo`
2. Click **Enter demo as Sterling Healthcare owner**
3. Admin: `/demo-healthcare`

Update `NEXT_PUBLIC_APP_URL` in Preview env to match the stable preview URL if needed.

---

## Step 5 — Webhooks (optional)

Only if testing paid registration or Clerk org sync on Preview:

- Stripe → `https://<preview-host>/api/webhooks/stripe`
- Clerk → `https://<preview-host>/api/webhooks/clerk`

Add secrets to **Preview** env vars.

---

## Verify

- [ ] `/demo` shows Enter button (not “demo disabled”)
- [ ] Enter demo → `/demo-healthcare` Overview loads
- [ ] Members list has ~50 seeded members
- [ ] `pnpm claims:validate` still passes in CI

---

## Cost (demo phase)

| Service | Typical cost |
|---------|----------------|
| Vercel Hobby | $0 |
| Neon free | $0 |
| Domain (optional) | ~$12/year |
| Clerk / Stripe | $0 in test / low usage |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/demo` says demo disabled | Preview env missing `DEMO_MODE=true`, `HOSTED_DEMO=true`, or secret &lt; 32 chars |
| Build fails Prisma | `DATABASE_URL` set for build; run `prisma migrate deploy` on Neon first |
| Empty admin / DB errors | Re-run `pnpm db:seed:demo` against Neon URL |
| Enter demo 500 | Check Vercel function logs; verify `DEMO_SESSION_SECRET` on Preview |

---

## Related

- [DEMO-MODE.md](./DEMO-MODE.md) — behavior and safety rails
- [DEPLOY.md](./DEPLOY.md) — production Clerk deploy
- [LOCAL-REVIEW.md](../LOCAL-REVIEW.md) — localhost review
