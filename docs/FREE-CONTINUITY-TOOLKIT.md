# PulsePoint — $0 continuity toolkit (built in-repo)

**No paid monitoring, no second host required to start.** Tools run on your laptop, GitHub Actions (free tier), and Docker.

| Tool | Command | Cost |
|------|---------|------|
| Health check | `pnpm continuity:health` | $0 |
| DB backup | `pnpm continuity:backup` | $0 |
| Warehouse CSV export | `pnpm continuity:export` | $0 |
| Start warm standby | `pnpm continuity:standby` | $0 (local Docker) |
| Watch primary + alert | `pnpm continuity:watch` | $0 (your Mac) |
| Failover instructions | `pnpm continuity:cutover` | $0 |
| GitHub uptime | `.github/workflows/continuity.yml` | $0 (set repo variable) |
| E2E wedge smoke | `.github/workflows/e2e.yml` | $0 |
| Standby image | `ghcr.io/<repo>:latest` | $0 (GHCR public) |

---

## One-time setup (10 minutes)

### 1. Local demo DB

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup
```

### 2. GitHub repo variables (optional — remote monitoring)

Repo → **Settings → Secrets and variables → Actions → Variables**

| Name | Example |
|------|---------|
| `PRIMARY_URL` | `https://your-app.vercel.app` |

Secrets (optional — weekly cloud backup):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon pooled connection string |

### 3. Local cron (optional — daily backup on your Mac)

```bash
PRIMARY_URL=https://your-app.vercel.app pnpm continuity:install-cron
```

---

## Daily commands

```bash
# Is everything alive?
PRIMARY_URL=https://your-app.vercel.app pnpm continuity:health

# Backup SQLite or logical JSON export
pnpm continuity:backup

# CSV bundle for warehouse / Power BI import mode
pnpm continuity:export
```

Backups land in `backups/` (gitignored).

---

## If Vercel goes down ($0 failover)

**Honest RTO: 5–15 minutes** if your Mac is on and standby was started once.

```bash
# Terminal 1 — keep running while you rely on failover
pnpm continuity:standby

# Terminal 2 — optional watcher (opens cutover steps after 3 failures)
PRIMARY_URL=https://your-app.vercel.app pnpm continuity:watch
```

Staff use: **http://localhost:3000/demo** → Enter demo.

### Expose laptop standby to the internet (still $0)

[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) (free):

```bash
# With standby running on :3000
cloudflared tunnel --url http://localhost:3000
```

Share the `*.trycloudflare.com` URL — no port forwarding, no paid host.

---

## Pull pre-built standby image (no rebuild)

After CI publishes to GHCR:

```bash
docker pull ghcr.io/jordanz00/pulsepoint:latest
docker run -p 3000:3000 --env-file .env.standby ghcr.io/jordanz00/pulsepoint:latest
```

---

## What each risk uses (no extra vendors)

| Risk | $0 primary | $0 backup |
|------|------------|-----------|
| Hosting down | `pnpm continuity:standby` + tunnel | GHCR image + cutover script |
| DB loss | `pnpm continuity:backup` | Restore SQLite copy or logical JSON |
| Email down | Adapter failover (built-in) | `EMAIL_ADAPTER=smtp` |
| Payments down | Manual adapter (built-in) | Exceptions queue |
| Bad deploy | E2E workflow on PR | `pnpm test:e2e` local |
| Remote blind spot | GitHub scheduled health | Opens GitHub issue label `continuity` |
| Warehouse | `pnpm continuity:export` | CSV → Power BI import |

---

## What $0 cannot do (be honest)

| Want | Need |
|------|------|
| 24/7 standby while laptop sleeps | ~$5/mo always-on VM (later) |
| &lt;60s DNS failover | Paid DNS + warm VM |
| SOC 2 letter | Audit $$$ |
| Full Entra / Fabric | Microsoft tenant + IT time |

---

## File map

| Path | Role |
|------|------|
| `scripts/continuity/*.ts` | Health, backup, export, cutover |
| `scripts/continuity/*.sh` | Standby, watch, cron install |
| `.github/workflows/continuity.yml` | Uptime + backup artifact + GHCR |
| `.github/workflows/e2e.yml` | Demo wedge Playwright |
| `Dockerfile` | Portable app image |
| `docker-compose.standby.yml` | Local warm standby |

---

## Related

- [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md)
- [AMS-PLATFORM-RISKS-AND-MITIGATIONS.md](./AMS-PLATFORM-RISKS-AND-MITIGATIONS.md)
- [DEPLOY-HOSTED-DEMO.md](./DEPLOY-HOSTED-DEMO.md)

**Last updated:** May 2026
