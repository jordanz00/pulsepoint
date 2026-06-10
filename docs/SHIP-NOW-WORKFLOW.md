# Ship Now workflow

**Purpose:** One standard for closing work — no partial handoffs.

## For humans

Prompt shape:

```
Scope: [one feature]
Verify: pnpm ship:now + browser /#why-pulsepoint
Done when: [screenshot / gate output]
Ship: commit
```

## For agents (mandatory)

1. Read `.cursor/rules/earn-worth-ship-protocol.mdc`
2. Implement full vertical slice in one pass
3. Run `pnpm ship:now`
4. Browser-check UI changes
5. Write `data/quake-os/waves/YYYY-MM-DD-<slug>.md`
6. Commit when user asks to ship/finish

## Command

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm ship:now
```

Runs: `claims:validate` → `leak:checks` → unit tests → `typecheck` → status board.

## Flagship surfaces (portfolio bar)

| Surface | Route | Standard |
|---------|-------|----------|
| Why PulsePoint | `/#why-pulsepoint` | Static compare table + module film |
| At a Glance | `/#at-a-glance` | PlatformGlanceBriefing |
| Admin suite | `/demo-healthcare/suite` | Same briefing + live stats |
| Career fair | `/demo-healthcare/e/nursing-career-fair-2026` | Booth grid |

## Pilot (human)

Sprint A only: `docs/SPRINT-A-OPERATOR-PACKET.md`
