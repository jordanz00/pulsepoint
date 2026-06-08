# Backup requirements (mandatory)

**Status:** Policy — enforce on every environment with non-demo member data.

---

## Requirement

> **Every environment that stores association member or financial data must have automated, restorable backups with documented RPO/RTO and a quarterly restore drill.**

This is **not optional** for pilot or production.

---

## Implementation tiers

| Tier | When | Mechanism |
|------|------|-----------|
| **T0 — Dev** | Local SQLite | `pnpm continuity:backup` before migrations |
| **T1 — Pilot** | Neon Postgres | Provider PITR + weekly `continuity:backup` artifact in encrypted storage |
| **T2 — Production** | Azure Postgres | Automated Azure Backup + Blob copy of logical exports |

---

## Commands

```bash
pnpm continuity:backup    # SQLite copy or logical JSON
pnpm continuity:export    # Warehouse CSV bundle
pnpm continuity:health    # Stack check
```

**CI:** `.github/workflows/continuity.yml` — set `DATABASE_URL` secret for scheduled backups.

---

## Agent / PR gates

Before merging Prisma schema changes:

1. Run `pnpm continuity:backup`
2. Update `scripts/continuity/backup-database.ts` and `export-warehouse.ts` if new **persistent** models added
3. Note backup impact in PR description

**Models that must be in backup scope:** all tables in `ORG_SCOPED_MODELS` (`lib/org-models.ts`) plus `Organization`, `User`, `OrgMembership`.

---

## RPO / RTO targets (honest)

| Environment | RPO | RTO |
|-------------|-----|-----|
| Demo local | Best effort | Re-seed `pnpm db:seed:demo` |
| Pilot | 24h (daily backup) | 4h |
| Production | 1h (PITR) | 1h after decision |

---

## Quarterly restore drill

1. Restore backup to scratch database
2. Run `pnpm test`
3. Smoke: login → members list → one event registration
4. Log result in `docs/` or `data/archive/`

---

## Related

- `docs/BUSINESS-CONTINUITY.md`
- `docs/FREE-CONTINUITY-TOOLKIT.md`
- `docs/ENTERPRISE-ARCHITECTURE.md`
