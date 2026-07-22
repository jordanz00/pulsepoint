# Cursor Workflow — PulsePoint / Quake OS

**Purpose:** One repeatable process so every session ships verified work—not endless retries.

**Read first every session:** [PROJECT-PULSE.md](./PROJECT-PULSE.md)

---

## The 5-step loop (non-negotiable)

| Step | You do | AI must do |
|------|--------|------------|
| **1. Scope** | Pick **one product** + one outcome | Read `PROJECT-PULSE.md`; refuse cross-repo edits |
| **2. Plan** | Plan mode for shared CSS, deploy, data | List files, blast radius, verify commands |
| **3. Prompt** | Use template below | Implement minimal diff only |
| **4. Verify** | Run gates before “done” | Paste gate output; no fake PASS |
| **5. Close** | Say “commit” only when happy | Write `data/quake-os/waves/YYYY-MM-DD-*.md` + update backlog; run `pnpm dev:ensure` |

---

## Local dev (do not skip)

**Symptom:** `http://localhost:3000/` blank or connection refused after an agent session.

**Cause:** Playwright E2E (`pnpm test:e2e`, `pnpm quake:execute`) starts and **stops** its own dev server when tests finish.

**Fix:**

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm dev:ensure    # background — preferred after gates/E2E
# or
pnpm dev           # foreground — keep terminal open
pnpm dev:check     # verify homepage returns PulsePoint HTML
```

`pnpm quake:execute` runs Phase 8 (`dev:ensure`) automatically. Cursor session hooks also try to restore dev on start/stop.

---

## Session start (copy/paste)

```
Read @docs/PROJECT-PULSE.md first.

Scope: [pulse | 340b-dashboard | pa-media-arts] — [one sentence outcome]
Files: @[exact files]
Do NOT touch: [shared assets / other products]
Verify: pnpm quake:gates (or python3 dashboard-audit.py for the 340B dashboard)
Done when: [measurable result]
```

---

## Verify commands

```bash
cd /Users/jordanzabady/Desktop/pulse

# Full engineering gate (run before every “ship”)
pnpm workflow:session --gates

# Quick status only
pnpm workflow:session

# Quake OS wave log
pnpm quake:os:wave

# Automations checklist + clipboard
pnpm quake:automation:install
```

---

## Repo map

| Product | Path | Deploy |
|---------|------|--------|
| **PulsePoint AMS** | `/Users/jordanzabady/Desktop/pulse` | GitHub / staging |
| **340B dashboard** | `Cursor Projects/` (340b*, state-data.js) | GitHub Pages |
| **PA Media Arts** | `Cursor Projects/PA-Media-Arts-*` | PDF/email only |

Never mix products in one commit.

---

## Human gates (AI cannot close)

- BL-003 staging pilot (Entra, Stripe, legal) — `docs/SPRINT-A-OPERATOR-PACKET.md`
- Cursor Automations UI save — `data/quake-os/automation-prompts/*.workflow.json`
- Counsel-approved privacy policy

---

## Wave closure template

Every shipped session adds:

`data/quake-os/waves/YYYY-MM-DD-short-name.md`

```markdown
# Wave — [title]
**Scope:** …
## Shipped
| Item | Path |
## Verify
`pnpm quake:gates`
**VERDICT:** APPROVED | NEEDS REVISION
```

---

*Rule enforced in Cursor: `.cursor/rules/pulse-session-workflow.mdc`*
