# Quake OS Wave — Hospital Association Full AMS

**Date:** 2026-06-07  
**ID:** wave-hospital-association-ams-2026-06-07  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Mission:** Fully featured hospital association AMS — live data, Apple liquid glass, minimalist executive IA.

## Verdict

**SHIP (engineering)** — demo + command center + enterprise hub show hospital roster, advocacy, governance, emergency. Production pilot still **BL-003 human**.

## Shipped

| Area | Change |
|------|--------|
| **Data layer** | `lib/hospital-association-snapshot.ts` — live rollups (no invented stats) |
| **Component** | `components/enterprise/hospital-association-strip.tsx` — glass KPI tiles + deep links |
| **Demo home** | Hospital association strip (compact) + Command center CTA |
| **Command center** | `AdminPage`, frosted hero, full HA strip (8 metrics) |
| **Enterprise hub** | Full liquid glass redesign — stats, departments, modules, integrations table |
| **Suite** | Live hospital/member/advocacy counts in module subtitles |
| **CSS** | `liquid-glass-overhaul.css` Pass 3 — `.pp-ha-strip`, `.pp-enterprise-hub`, CEO hero |

## Hospital association data surfaces

| Metric | Source | Route |
|--------|--------|-------|
| Hospital accounts | `memberOrganization` | `/enterprise/organizations` |
| Members on roster | `member.organizationAccountId` | `/members/analytics` |
| Hospital engagement % | MemberPulse tiers by hospital | `/enterprise/advocacy` |
| Take-action responses | `advocacyCampaignResponse` | `/enterprise/advocacy` |
| Committees | `committee` active | `/committees` |
| Emergency contacts | `emergencyContact` | `/enterprise/emergency` |
| Advocacy issues | `advocacyIssue` ACTIVE/TRACKING | `/enterprise/advocacy` |
| Live campaigns | `advocacyCampaign` isActive | `/enterprise/advocacy` |

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup   # if DB empty
pnpm dev
pnpm quake:gates
```

Routes:
- `/demo-healthcare` — welcome, bento, **hospital association**, engagement, modules
- `/demo-healthcare/command-center` — executive KPIs + full HA strip + domain panels
- `/demo-healthcare/enterprise` — glass enterprise hub
- `/demo-healthcare/suite` — all modules with live counts

## Still human / roadmap

- BL-003 staging pilot (Entra, Stripe drill, legal)
- Legislative feed (stub), FEC/PAC compliance, member SSO GA
- Finance/GL, Power BI embed, Protech nightly sync

## Executive summary

Demo-ready **hospital association AMS** with CEO command center, enterprise modules, and seeded Sterling Healthcare data. Engineering gates target green; external pilot gates unchanged.
