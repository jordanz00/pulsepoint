# PulsePoint — near-free ($0) stack

Goal: run the **clickable prototype** for leadership without paid SaaS bills.

---

## Recommended $0 architecture

| Layer | Free choice | Skip for prototype |
| --- | --- | --- |
| **Hosting** | [Vercel Hobby](https://vercel.com/docs/plans/hobby) (personal / non-commercial) | Paid Pro |
| **Database** | **SQLite file** (`file:./prisma/demo.db`) — `pnpm demo:setup`, no Docker | Neon / Docker Postgres later |
| **Auth** | **Demo mode** (`DEMO_MODE=true`) — no Clerk | Clerk (free tier exists but adds setup + limits) |
| **Email** | Skip (registration confirm is soft-fail anyway) | Resend |
| **Payments** | Skip | Stripe |
| **Errors** | Browser + Vercel logs | Sentry |
| **Source** | GitHub private repo (free) | — |
| **Local dev** | `docker compose up -d` + `pnpm dev` | — |

**Monthly cost if you follow this:** **$0** (within free-tier limits).

---

## Three tiers (pick one)

### Tier 1 — $0, only you (simplest)

Run on your laptop. No cloud bills ever.

```bash
cd pulse
docker compose up -d
pnpm install
# .env.local: DEMO_MODE=true, DEMO_SESSION_SECRET=$(openssl rand -hex 32)
pnpm db:seed:demo
pnpm dev
```

Share screen in a meeting, or record a Loom. URLs:

- http://localhost:3000/demo
- http://localhost:3000/demo-healthcare

**Cost:** $0. **Downside:** not a link others can open on their own.

---

### Tier 2 — $0, shareable link (recommended)

Host on **Vercel Hobby** + **Neon free** + **demo mode only**.

1. Create free [Neon](https://neon.tech) project → copy `DATABASE_URL`.
2. Import https://github.com/jordanz00/pulsepoint on [Vercel](https://vercel.com) (Hobby).
3. Environment variables (Vercel → Settings → Environment Variables):

   | Variable | Value | Environments |
   | --- | --- | --- |
   | `DATABASE_URL` | Neon connection string | Production + Preview |
   | `DEMO_MODE` | `true` | **Preview only** (not Production) |
   | `DEMO_SESSION_SECRET` | `openssl rand -hex 32` | Preview only |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel preview URL | Preview |

4. **Leave empty** (prototype does not need them):

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_*`
   - `STRIPE_*`
   - `RESEND_*`
   - `SENTRY_*`

5. Deploy → run migrations once (Vercel build runs `prisma generate`; push schema via Neon SQL editor or one-off):

   ```bash
   DATABASE_URL="..." pnpm db:push
   DATABASE_URL="..." pnpm db:seed:demo
   ```

6. Share: `https://<preview-url>/demo`

**Cost:** $0 while within Neon + Vercel free limits.  
**Caveat:** Neon free projects **pause after inactivity** — first visit may be slow (cold start). Fine for demos.

---

### Tier 3 — $0 static brochure (optional)

GitHub Pages for a **marketing-only** static page — **not** the full app. See [GITHUB-PAGES.md](./GITHUB-PAGES.md). Usually not worth it if Tier 2 works.

---

## What NOT to pay for (prototype phase)

| Service | Why skip now |
| --- | --- |
| **Clerk** | Demo mode replaces sign-in; Clerk free tier still needs dashboard setup |
| **Stripe** | No real money in prototype |
| **Resend** | Emails optional; automations soft-fail |
| **Sentry** | Vercel function logs enough for prototype |
| **GitHub Pages** | Cannot run Next.js + Postgres prototype |
| **Dedicated VM** | Unnecessary cost vs Vercel free |

---

## Free-tier limits to know (not blockers for a demo)

| Vendor | Limit | Mitigation |
| --- | --- | --- |
| **Vercel Hobby** | Personal/non-commercial; bandwidth caps | Demo traffic is tiny |
| **Neon free** | Storage cap; auto-pause when idle | Wake on first request; re-seed if DB wiped |
| **GitHub private** | Pages on private repo may need paid plan | Use Vercel URL instead of Pages |

---

## Security note for free hosting

- Set `DEMO_MODE=true` only on **Preview**, never **Production**.
- `lib/demo-mode.ts` refuses demo when `NODE_ENV=production`.
- Do not put real member PII in the demo database — seed data only.

---

## When you might eventually pay (later, not for prototype)

- Real Clerk orgs + production auth
- Stripe live mode
- Vercel Pro (team / commercial use)
- Neon scale or HIPAA/BAA needs

None of that is required to **show** the prototype.

---

## Quick decision

| Need | Do this |
| --- | --- |
| Cheapest possible | Tier 1 (local) |
| Free link for leadership | Tier 2 (Vercel + Neon + demo mode) |
| Free code hosting only | GitHub repo (already done) |
