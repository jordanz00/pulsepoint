# PulsePoint — business continuity and failover

**Audience:** Founder, IT, on-call  
**Purpose:** What happens when a vendor fails, and how fast you can restore service—with **honest RTOs** and a path to **warm standby** hosting.

**Read first:** [AMS-PLATFORM-RISKS-AND-MITIGATIONS.md](./AMS-PLATFORM-RISKS-AND-MITIGATIONS.md)  
**$0 tooling (implemented):** [FREE-CONTINUITY-TOOLKIT.md](./FREE-CONTINUITY-TOOLKIT.md)

---

## What we promise (and do not)

| Promise | Status |
|---------|--------|
| **No single vendor kills the codebase** | ✅ Adapters + Postgres portability |
| **Data survives host loss** | ✅ If Neon backups enabled |
| **Automatic email/payment degrade** | ✅ Failover chain / manual adapter |
| **Zero downtime without standby cost** | ❌ Not claimed until Tier 1+ funded |
| **Instant DNS flip without prep** | ❌ Requires pre-provisioned second host |

---

## Failover tiers

### Tier 0 — Cold standby (implemented — $0)

**Artifacts:** GitHub repo, `Dockerfile`, `pnpm continuity:*` scripts, `.github/workflows/continuity.yml`, [FREE-CONTINUITY-TOOLKIT.md](./FREE-CONTINUITY-TOOLKIT.md).

**If Vercel dies tomorrow:**

1. Confirm Neon reachable (`DATABASE_URL`).
2. Build and run container (or deploy to Railway/Render/Fly):

   ```bash
   cd /path/to/pulse
   docker build -t pulsepoint:standby .
   docker run -p 3000:3000 --env-file .env.production pulsepoint:standby
   ```

3. Point DNS / share new URL to pilot users.
4. Re-register Stripe + Clerk webhooks to new base URL.

**RTO:** 1–4 hours (human-dependent).

---

### Tier 1 — Warm standby (target for pilot)

**Goal:** Second host **already running** the same image; cutover is DNS or URL announcement, not rebuild from scratch.

| Step | Action |
|------|--------|
| 1 | Build image in CI → push to GHCR (or Docker Hub) on every `main` merge |
| 2 | Run standby on Railway / Render / Fly / small Azure VM (~$5–25/mo) |
| 3 | Uptime monitor hits **primary** `https://app.example.com/api/health` every 60s |
| 4 | On 3 failures → page on-call; run `scripts/failover-preflight.sh` on standby |
| 5 | Flip DNS CNAME to standby **or** communicate backup URL to staff |

**RTO:** **5–15 minutes** after decision (DNS TTL dependent).

**Monthly drill (15 min):** Hit standby URL, enter demo or Clerk login, open member list.

---

### Tier 2 — Database replica (when pilot has real data)

| Step | Action |
|------|--------|
| 1 | Neon paid: enable PITR; weekly logical dump to secure storage |
| 2 | Optional: read replica or second provider restore test quarterly |
| 3 | Document `DATABASE_URL` swap in Vercel **and** standby host env |

**RTO:** 15–60 min for DB promote; app redeploy minutes after.

---

## Per-vendor quick actions

| Vendor fails | Detection | Primary action | Backup action | RTO |
|--------------|-----------|----------------|---------------|-----|
| **Vercel** | Uptime monitor | DNS → standby host | Communicate backup URL | 5–60 min |
| **Neon** | App 5xx / DB errors | Restore PITR; update `DATABASE_URL` | Restore dump to Supabase | 1–4 hr |
| **Clerk** | Auth 5xx | Enable demo mode (Preview) / emergency read-only comms | Entra or Auth.js project | 15 min – weeks |
| **Stripe** | Webhooks stale | Runbook: reconcile exceptions queue | Manual payment adapter | 0 – same day |
| **Resend** | Email exceptions queue | `EMAIL_ADAPTER=smtp` | Log-only (audit preserved) | &lt; 5 min |
| **GitHub** | Cannot deploy | Clone mirror; push to GitLab | Local bare remote | Hours |

---

## Health checks (enable Tier 1)

| Endpoint | Expected |
|----------|----------|
| `GET /api/health` | `200` + `{ "ok": true }` |
| `GET /demo` | `200` when `HOSTED_DEMO` or local demo |

Configure Better Stack / UptimeRobot / Pingdom on **production or preview** URL.

---

## DNS failover (example)

| Record | Primary | Standby |
|--------|---------|---------|
| `app.pulsepointams.com` CNAME | `cname.vercel-dns.com` | `standby.railway.app` |

**Lower TTL** to 300s before go-live week so flips propagate in minutes.

---

## Backup env template

Copy `.env.standby.example` → host secret store. Must match production vars except `NEXT_PUBLIC_APP_URL`.

---

## Drills calendar

| Drill | Frequency |
|-------|-----------|
| `pnpm test` + `leak:checks` | Every merge |
| Restore Neon backup to scratch DB | Quarterly |
| Standby host login + member list | Monthly |
| Full Vercel → standby cutover (tabletop) | Before external pilot |

---

## Related

- [DEPLOY-HOSTED-DEMO.md](./DEPLOY-HOSTED-DEMO.md)  
- [VENDOR-PORTABILITY.md](./VENDOR-PORTABILITY.md)  
- [RUNBOOK.md](./RUNBOOK.md)  

**Last updated:** May 2026
