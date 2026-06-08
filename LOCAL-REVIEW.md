# PulsePoint — local review (start here)

The app lives in **`/Users/jordanzabady/Desktop/pulse`** (canonical repo). The old `Cursor Projects/pulsepoint-ams` folder was merged here — see `packages/api`, `packages/worker`, `packages/shared`, and `/[orgSlug]/advertising`.

## 1. Start the server (required)

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup   # once — SQLite + Sterling Healthcare seed
# Optional ad-ops API (Docker required):
# docker compose up -d ams_db redis && pnpm ad-ops:setup
pnpm dev          # Next on :3000 (auto-clears hung servers)
# Full stack (API + worker — needs Docker/env): pnpm dev:stack
```

Wait until the terminal shows: `✓ Ready` and `Local: http://localhost:3000`

## 2. Open these URLs (in order)

| What | URL |
|------|-----|
| **Marketing site** | http://localhost:3000/ |
| **Demo launcher** | http://localhost:3000/demo |
| **Guided walkthrough** | http://localhost:3000/demo → **Start guided walkthrough** |
| **Full suite (all modules on)** | http://localhost:3000/demo → **Open full suite** |
| **Admin overview** | http://localhost:3000/demo-healthcare |
| **Healthcare ad ops** | http://localhost:3000/demo-healthcare/advertising (after ad-ops:setup) |

**Important:** `/demo-healthcare` redirects to `/demo` until you enter demo (signed cookie). Choose walkthrough, full suite, or overview-only.

## 3. What to review (Protech-style full suite)

**Script:** `docs/DEMO-GUIDE.md` · **Feature map:** `docs/PROTECH-FEATURE-MAP.md`

| Area | Path | Status |
|------|------|--------|
| Overview + tour checklist | `/demo-healthcare` | Live |
| Members + roles | `/demo-healthcare/members` | Live |
| Import staging | `/demo-healthcare/members/imports` | Live |
| Events + public register | `/demo-healthcare/events` · `/demo-healthcare/e/...` | Live |
| Work / exceptions | `/demo-healthcare/work` · `/demo-healthcare/exceptions` | Live |
| Learn (CE) | `/demo-healthcare/learn` | Alpha |
| Giving | `/demo-healthcare/giving` | Alpha |
| Commerce (dues / merch) | `/demo-healthcare/commerce` | Alpha |
| Engage (email) | `/demo-healthcare/engage` | Alpha |
| Insights (KPIs) | `/demo-healthcare/insights` | Alpha |
| Committees (governance rollup) | `/demo-healthcare/committees` | Preview |

## 4. If the page is blank

**Most common cause:** a **stale hung** Next process on port 3000 (browser spins forever, empty page).

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm dev:check    # fails fast if server is hung or wrong repo
pnpm dev          # kills non-responsive :3000, starts fresh Next
```

1. Run from **`/Users/jordanzabady/Desktop/pulse`** — not `Cursor Projects/pulsepoint-ams`.
2. Wait for terminal: `✓ Ready` and `Local: http://localhost:3000`.
3. Verify: `curl -s http://localhost:3000/api/health` → `{"ok":true,...}`.
4. If still blank: `pnpm demo:setup`, restart `pnpm dev`, open http://localhost:3000/demo
5. Check `.env.local` has `DEMO_MODE=true` and `DATABASE_URL=file:./prisma/demo.db`
6. Avoid `pnpm dev:stack` unless API/worker env is configured — use `pnpm dev` for marketing review.

## 5. Hosted demo (Vercel — not GitHub Pages)

GitHub Pages is static marketing only. For a **live** one-click demo with real data, deploy to **Vercel Preview** — see [docs/DEPLOY-HOSTED-DEMO.md](docs/DEPLOY-HOSTED-DEMO.md).

Do **not** set `DEMO_MODE=true` on Vercel **Production**; use `HOSTED_DEMO=true` on **Preview** only.
