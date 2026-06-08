# Cursor Automations × Quake OS — 5-Minute Setup

**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**You need:** Cursor with Automations + Cloud compute enabled

---

## The whole thing in one sentence

**Chat** = you ask · **`pnpm quake:*`** = scripts · **GitHub Actions** = tests on PR · **Cursor Automations** = cloud agent runs Quake OS playbooks on a schedule or when a PR opens — but only if the prompt tells it to read your agent files.

Automations do **not** auto-load `.cursor/agents/quake-os-*.md`. Saved definitions live in `data/quake-os/automation-prompts/` (`.md` + `.workflow.json`).

---

## Save automations to Cursor (your account)

**From this chat:** Automations cannot be saved to Cursor cloud from the editor pane — use **Agents Window** on `pulse`:

```
Create Cursor automations from data/quake-os/automation-prompts/*.workflow.json — all three.
```

**Or run:**

```bash
pnpm quake:automation:install
```

Then in Cursor → **Automations** → create each workflow → **Save**.

---

## Step 1 — Open the right folder (30 sec)

```bash
cd /Users/jordanzabady/Desktop/pulse
cursor .
```

Quick check:

```bash
pnpm quake:os && pnpm quake:gates
```

Both should pass before you automate anything.

---

## Step 2 — Try it once in chat (2 min)

Paste in Cursor chat:

```
@quake-os-continuous-runner Run continuous wave.
Pick top 3 pending items from data/quake-os/improvement-backlog.json.
Run pnpm quake:gates before marking done.
```

If that works, you're ready for Automations.

---

## Step 3 — Create your first Automation (2 min)

1. In Cursor: **Automations** → **New automation**
2. Or in **Agents Window**: *"Create a Cursor automation for Quake OS weekly continuous improvement"*
3. Enable **Cloud compute** if asked → [dashboard](https://cursor.com/dashboard?tab=cloud-agents)
4. Set **repo** = this `pulse` repo, **branch** = `main`

| Setting | Value |
|---------|--------|
| **Name** | Quake OS — Weekly continuous |
| **Trigger** | Schedule → Monday 9:00 AM (your timezone) |
| **Tools** | Open or update PRs |
| **Instructions** | Copy entire file → `data/quake-os/automation-prompts/weekly-continuous.md` |

Save. Done.

---

## Optional automations (same pattern)

| Automation | Trigger | Tools | Prompt file |
|------------|---------|-------|-------------|
| **PR audit comment** | PR opened or updated | Comment on PRs | `automation-prompts/pr-audit.md` |
| **Full wave on demand** | Manual or webhook | Open or update PRs | `automation-prompts/full-wave.md` |

---

## What runs where (don't duplicate)

| Layer | Command / file | Use for |
|-------|----------------|---------|
| You in chat | `@quake-os-orchestrator` | Big initiatives, UI overhauls |
| Terminal | `pnpm quake:gates` | Must pass before any ship |
| GitHub | `.github/workflows/quake-gates.yml` | CI tests on PR |
| GitHub | `.github/workflows/quake-os-daily.yml` | Daily scheduler only |
| **Cursor Automation** | Weekly + PR prompts above | Backlog work + audit comments |

**Rule:** Automations call `pnpm quake:gates` and write to `data/quake-os/waves/`. GitHub Actions keep running tests — don't replace them.

---

## Files the cloud agent must read

| File | Why |
|------|-----|
| `.cursor/rules/quake-os-orchestrator.mdc` | Phase matrix + rules |
| `.cursor/agents/quake-os-continuous-runner.md` | Weekly runner behavior |
| `.cursor/agents/quake-os-audit.md` | PR review format |
| `data/quake-os/improvement-backlog.json` | What to work on |
| `docs/QUAKE-OS-CONTINUOUS.md` | Cadence playbook |

---

## Verify first automation run

After the first scheduled run (or manual test):

- [ ] New file in `data/quake-os/waves/YYYY-MM-DD-continuous.md`
- [ ] PR opened (if backlog items were worked)
- [ ] `pnpm quake:gates` mentioned in PR body or wave report
- [ ] No invented stats; file paths cited

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Agent ignores Quake OS rules | Paste full prompt from `automation-prompts/` — don't shorten |
| Wrong repo | Automation must point at `pulse`, not `Cursor Projects` |
| Gates fail | Fix locally first; automation should stop, not force-merge |
| No Cloud compute | Enable in Cursor dashboard → Cloud Agents |

---

## Related

- `docs/QUAKE-OS.md` — org chart + six phases
- `docs/QUAKE-OS-CONTINUOUS.md` — weekly cadence
- `data/quake-os/automation-prompts/` — copy-paste prompts
