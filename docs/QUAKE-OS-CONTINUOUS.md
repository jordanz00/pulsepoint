# Quake OS — Continuous Improvement

**Goal:** A self-improving AMS org that runs parallel specialist agents on a cadence—design, healthcare association fit, security, scale, and feature depth—without inventing stats or breaking tenant isolation.

**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## How to run (human or CI)

```bash
# Every wave — automated gates
pnpm quake:gates

# Full agency wave in Cursor
@quake-os-continuous-runner Run continuous wave. Pick top 3 items from improvement-backlog.json. Parallel specialists. Audit then ship.
```

**CI:** `.github/workflows/quake-os-gates.yml` — weekly + PR paths + manual dispatch.

---

## Parallel specialist roster (extended)

| Agent | ID | Focus |
|-------|-----|--------|
| **Continuous runner** | `quake-os-continuous-runner` | Picks backlog, launches parallel wave |
| **Professional designer** | `quake-os-designer` | Visual system, marketing, glass UI, a11y |
| **AMS specialist** | `quake-os-ams-specialist` | Fonteva/iMIS/Protech parity, module depth |
| **Security** | `quake-os-security` | Tenant, capabilities, caps, audit, SECURE-FORCE |
| **Scale** | `quake-os-scale` | Query limits, pagination, indexes, large rosters |
| *(existing 26 agents)* | `quake-os-*` | Executive, industry, product, engineering, QA, audit |

---

## Wave cadence (recommended)

| Cadence | Activity |
|---------|----------|
| **Every PR** | `pnpm quake:gates` (or CI workflow) |
| **Weekly** | Continuous runner: 1 design + 1 security + 1 feature from backlog |
| **Monthly** | CEO review of `improvement-backlog.json` + competitive intel update |
| **Pre-pilot** | Full Phase 1–6 wave on Membership, Advocacy, Pilot |

---

## Backlog (living)

`data/quake-os/improvement-backlog.json` — prioritized by impact × effort. COO updates after each wave.

---

## Non-negotiables (every wave)

1. `getOrgDb(orgId)` + `pnpm leak:checks`
2. `requireCapability()` on mutations
3. `pnpm claims:validate`
4. Query caps — `lib/query-limits.ts`, `lib/tenant-guards.ts`
5. No invented KPIs
6. Audit Agent before executive SHIP

---

## Related

- `docs/QUAKE-OS.md` — org chart + six phases
- `docs/SCALE-AND-SECURITY.md` — data volume + security contract
- `data/quake-os/waves/` — audit trail
