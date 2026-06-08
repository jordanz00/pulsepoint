# PulsePoint pitch package

## One-liner

PulsePoint is the modern healthcare AMS with Microsoft-native auth, glass executive dashboards, and operational gates Protech can't match at this price.

## Demo flow (20 min)

1. **Marketing** — GitHub Pages or local `/` — honest Live vs Roadmap labels
2. **Enter demo** — `/demo` → Sterling Healthcare
3. **Executive home** — big KPIs + copilot briefing
4. **MemberCore** — directory, import staging, Protech CSV story
5. **Events** — publish, register, check-in, Stripe
6. **Insights** — trends + Export for Power BI
7. **Enterprise** — `/enterprise/integrations` — Microsoft 365 connect
8. **Ad-ops** (optional) — `/advertising/campaigns` if API running

## Comparison doc

`docs/PROTECH-FEATURE-MAP.md` — say Live / Alpha / Roadmap aloud.

## Microsoft story

- Entra SSO live (`docs/ENTRA-PILOT-SETUP.md`)
- Graph mail read (no send in v1)
- Power BI CSV export (`docs/POWER-BI-SEMANTIC-LAYER.md`)
- Azure deploy doc (`docs/STAGING-LAUNCH.md`)

## Screenshot assets

```bash
python3 scripts/generate-status-board.py
open status-board.html
```

## What not to claim

Full Power BI embed, automated renewals, GL/NetSuite sync, exhibit hall, voting, member B2C SSO, full Protech GA.

## Agents for ongoing build

`.cursor/agents/` — supervisor, research, microsoft, glass-ui, pilot-ops, exec-copilot, status-publisher
