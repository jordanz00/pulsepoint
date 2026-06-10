# Quake Ship Workflow

**Purpose:** Every improvement ships as **visible product value** — not JSON reports.  
**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## The contract

| Phase | Action | Pass criteria |
|-------|--------|---------------|
| **1. Pick** | Top backlog item or leadership gap | Documented in `data/quake-os/improvement-backlog.json` |
| **2. Build** | Implement in app UI + tests | Staff can click the feature on `/demo-healthcare` |
| **3. Gates** | `pnpm quake:gates` | 10/10 leak checks, Vitest green, typecheck |
| **4. Wave** | `pnpm quake:os:wave` + markdown in `data/quake-os/waves/` | Audit APPROVED, demo script included |
| **5. Demo** | Leadership loop walkthrough | `/demo-healthcare/leadership` — six live-stat stops |
| **6. Ship** | Human merge + pilot checklist | BL-003 when money path ready |

---

## Commands (run in order)

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup && pnpm dev

# After implementation:
pnpm test
pnpm quake:gates
pnpm quake:execute 2026-06-08-sprint-k   # full proof stack incl. E2E
pnpm quake:os:wave
pnpm status:board   # optional static HTML
```

---

## In-app surfaces (stakeholder-visible)

| Route | Audience | What they see |
|-------|----------|---------------|
| `/demo-healthcare/leadership` | CEO, board liaison | **Leadership Loop** — 6-step briefing with live stats |
| `/demo-healthcare/command-center` | Executive | KPIs + loop panel + domain panels |
| `/demo-healthcare/mission-control` | Builder, operator | Quake OS telemetry + ship phases |
| `/demo-healthcare/members/[id]` | Membership staff | CE transcript download |
| `/demo-healthcare/portal` | Member | **Self-service CE transcript** + renewals |
| `/demo-healthcare/insights/board-pack` | Board liaison | Pack + **leadership loop** follow-up |

---

## Cursor orchestration

```
@quake-os-orchestrator Run Quake Ship Workflow for: [initiative].
Must ship clickable UI on /demo-healthcare. Log wave. Run pnpm quake:gates.
Ground truth: docs/PRODUCT-CLAIMS.md, getOrgDb, no invented stats.
```

Parallel agents per phase — see `docs/QUAKE-OS.md` six-phase matrix.

---

## Non-negotiables (every ship)

1. `getOrgDb(orgId)` + `pnpm leak:checks`
2. Honest Live / Alpha / Roadmap labels
3. Audit log on exports and mutations
4. Wave markdown with **90-second demo script**
5. Leadership loop stat line must match real DB counts

---

## Related

- `docs/QUAKE-OS.md` — agent org chart
- `docs/QUAKE-OS-CONTINUOUS.md` — weekly cadence
- `docs/DEMO-GUIDE.md` — full tour script
- `data/quake-os/waves/` — audit trail
