# PulsePoint — Portfolio showcase plan

**Audience:** Solo builder · off-hours · LinkedIn / board / pilot conversations  
**Demo org:** Sterling Healthcare Association · `/demo-healthcare`  
**Factory:** Quake OS + Cursor six-phase waves + `pnpm quake:gates`

## One-liner

Healthcare-focused AMS prototype: executive narratives, liquid glass UI, advocacy stories, workforce video, board-ready reports — honest Live/Alpha labeling.

## Top 10 showcase features

| # | Feature | Route |
|---|---------|-------|
| 1 | Executive home v2 | `/demo-healthcare` |
| 2 | Executive Briefing | Home → briefing panel |
| 3 | Liquid glass UI | All admin surfaces |
| 4 | Member engagement | Home → engagement |
| 5 | Membership analytics | `/demo-healthcare/members/analytics` |
| 6 | Insights + board pack | `/demo-healthcare/insights/board-pack` |
| 7 | Advocacy issue hub | `/demo-healthcare/enterprise/advocacy` |
| 8 | Learn / workforce videos | `/demo-healthcare/learn/workforce` |
| 9 | Member 360° | `/demo-healthcare/members/[id]` |
| 10 | Protech compare + import | `/compare-protech` · `/members/imports` |

## 15-minute demo script

1. Marketing `/` → hero tour CTA  
2. `/demo-healthcare` → KPIs + briefing + revenue  
3. Members → profile → analytics  
4. Advocacy → nursing workforce public issue  
5. Learn workforce → video playlist  
6. Insights board pack → print/export  
7. Compare Protech → import staging  

## Quake OS cadence (weekly, ~45 min)

See **`docs/QUAKE-OS-PORTFOLIO-WORKFLOW.md`** for the full closure checklist.

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm quake:os:daily          # research + backlog sync
# Cursor: @quake-os-orchestrator Phase 3 for 1 backlog item
pnpm quake:gates
```

## Honest scope

MemberCore + Events = **Live**. Advocacy, Learn, Insights, workforce = **Alpha / demo preview**. No full Protech parity claim.
