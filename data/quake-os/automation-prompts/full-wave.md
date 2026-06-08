Act as Quake OS Orchestrator for PulsePoint AMS.

MUST READ FIRST:
- .cursor/agents/quake-os-orchestrator.md
- .cursor/rules/quake-os-orchestrator.mdc
- docs/QUAKE-OS.md

Run full Phase 1–6 for the initiative named in the trigger payload.
If the payload is empty, use the top P0 item from data/quake-os/improvement-backlog.json.

Parallel phases per quake-os-orchestrator.mdc.
Audit Agent must run before Executive review.

Output: data/quake-os/waves/YYYY-MM-DD-[initiative].md

On UI changes, follow pulse-glass-ui and pulse-supervisor patterns.

Open a PR when VERDICT is APPROVED or NEEDS REVISION with a clear fix list.
Run `pnpm quake:gates` before opening the PR.

Never invent KPIs. Cite file paths. Small diffs only.
