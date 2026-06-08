# Quake OS — saved Cursor Automation definitions

Version-controlled automation drafts for **PulsePoint AMS** (`jordanz00/pulsepoint`).

| Saved workflow | Trigger | Tools | Files |
|----------------|---------|-------|-------|
| **Weekly continuous** | Mon 9:00 (`0 9 * * 1`) | Open/update PRs | `weekly-continuous.md` · `weekly-continuous.workflow.json` |
| **PR audit comment** | PR opened + updated | Comment on PRs | `pr-audit.md` · `pr-audit.workflow.json` |
| **Full wave on demand** | Webhook (manual test in UI) | Open/update PRs | `full-wave.md` · `full-wave.workflow.json` |

## Install in Cursor (save to your account)

This chat cannot push to Cursor’s Automations API. Use **Agents Window** on the `pulse` repo:

```
Create Cursor automations from data/quake-os/automation-prompts/*.workflow.json — all three: weekly continuous, PR audit, full wave.
```

Or manually for each file:

1. Open **`pulse`** in Cursor → **Automations** → **New**
2. Match **name**, **trigger**, and **tools** from the table above
3. Paste **Instructions** from the matching `.md` file (or copy fields from `.workflow.json`)
4. Set repo **`jordanz00/pulsepoint`**, branch **`main`** (weekly + full wave only)
5. **Save**

## CLI helper

```bash
pnpm quake:automation:list      # list *.workflow.json (repo-scoped; exit 0)
pnpm quake:automation:install   # opens repo + prints install checklist
pnpm quake:automation:check     # verify all prompt + workflow files exist
```

Do **not** run `find ~ ...` — permission errors on `$HOME` make `find` exit 1 even when files match. Use `pnpm quake:automation:list` instead.

## After save

- Run **Test** on weekly automation once
- Confirm Cloud compute enabled: https://cursor.com/dashboard?tab=cloud-agents
- First run should write `data/quake-os/waves/YYYY-MM-DD-continuous.md`
