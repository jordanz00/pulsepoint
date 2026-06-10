# Quake OS automation workflow

**The standard path.** No hand-waving. One pipeline, wired locally, in CI, and in Cursor.

**Repo:** `/Users/jordanzabady/Desktop/pulse`

---

## Run it now

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm quake:automation:run
```

That single command:

1. Runs **`pnpm quake:gates`** (claims, leak checks, tests, tsc, status board)
2. Refreshes **`data/quake-os/improvement-backlog.json`**
3. Picks **top 3 pending** items (P0 first)
4. Runs **Quake OS wave** + **continuous-improvement workflow**
5. Writes **`data/quake-os/waves/YYYY-MM-DD-automation-*.md`** with audit digest + Cursor handoff

Exit code **0** = gates passed, ready for implementation. **1** = stop and fix.

---

## Full corporation cycle (weekly)

Runs all 7 divisions + C-suite board synthesis:

```bash
pnpm quake:os:corporation
```

Writes `data/quake-os/waves/YYYY-MM-DD-corporation-cycle.md` with board verdict (`SHIP` / `REVISE` / `STOP`) and Cursor handoff for top tasks.

**Scheduler:** weekly `corporation-cycle` job in `quake-os/orchestrator/scheduled-jobs.ts`  
**Cursor Automation:** `data/quake-os/automation-prompts/corporation-cycle.workflow.json`  
**Mission Control UI:** `/demo-healthcare/mission-control`

---

## Before every PR

```bash
pnpm quake:gates
```

---

## What runs automatically (no Cursor UI setup required)

| What | When | Where |
|------|------|--------|
| Full pipeline | Mon 09:00 UTC + manual | `.github/workflows/quake-os-automation.yml` |
| Gate suite on PR | PR to app/lib/components | `.github/workflows/quake-gates.yml` |
| Audit PR comment | PR open/update | `.github/workflows/quake-pr-audit.yml` |
| Daily scheduler | Daily 07:00 UTC | `.github/workflows/quake-os-daily.yml` |
| Corporation cycle | Mon 08:00 UTC | `.github/workflows/quake-os-corporation.yml` |
| Session context | Cursor open | `.cursor/hooks.json` |

---

## Cursor chat (implementation layer)

After `pnpm quake:automation:run` passes, implement code-ready items:

```
@quake-os-orchestrator Run Phase 3–4 for: [title from wave report].
Items: BL-026, …
pnpm quake:gates before PR.
```

---

## Optional: Cursor Cloud Automations

If you also want cloud agents on schedule, paste prompts from:

`data/quake-os/automation-prompts/*.workflow.json`

See `docs/CURSOR-AUTOMATIONS-QUICKSTART.md`. **Not required** — GitHub + CLI pipeline above is complete.

---

## Files

| Path | Role |
|------|------|
| `quake-os/core/automation-pipeline.ts` | Pipeline engine |
| `quake-os/scripts/automation-run.ts` | CLI |
| `.cursor/rules/quake-os-automation-workflow.mdc` | Agent rule (always on) |
| `scripts/quake-pr-audit-comment.sh` | PR audit comment |
| `data/quake-os/improvement-backlog.json` | Backlog source |
| `data/quake-os/waves/` | Audit trail |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Gates fail | Read terminal output; fix tsc/tests/leaks locally |
| Only human backlog items | Complete BL-003 operator work; pick BL-026 for code |
| Hooks not firing | Reload Cursor window; check `.cursor/hooks.json` |
| CI push fails | Ensure workflow has `contents: write` on default branch |

---

## Related

- `docs/QUAKE-OS.md` — org chart
- `docs/QUAKE-OS-CONTINUOUS.md` — cadence
- `.cursor/rules/quake-os-orchestrator.mdc` — six-phase matrix
