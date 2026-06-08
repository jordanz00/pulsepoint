# Quake OS Wave — Week 1 Learn Video Library

**Date:** 2026-06-07  
**ID:** wave-week1-learn-video-library-2026-06-07  
**Parent plan:** `data/quake-os/waves/2026-06-07-solo-comms-4week-sprint.md`  
**Verdict:** **SHIP (Alpha)** — portfolio demo ready; re-seed demo for embed URLs.

## Scope delivered

| Area | Change |
|------|--------|
| **Safe embeds** | `lib/learn/video-embed.ts` — YouTube/Vimeo allowlist only |
| **Public library** | `/demo-healthcare/learn/library` — member-facing playlists |
| **Admin workforce** | `/demo-healthcare/learn/workforce` — preview embeds + add video form |
| **MemberCore stitch** | `MemberWorkforceLearnPanel` on member profile |
| **Engage stitch** | `workforcePersona` audience filter + seeded nursing audiences |
| **Seed** | 3 playlists (nursing, allied-health, advocacy-101) with YouTube URLs |
| **Tests** | `tests/unit/video-embed.test.ts`, engage persona filter |
| **Registry** | `docs/PRODUCT-CLAIMS.md`, `lib/org-models.ts` Learn models |

## Demo path (8 min)

1. `/demo-healthcare/learn` → **Video library** / **Workforce**
2. `/demo-healthcare/learn/library` — play embedded clips (Alpha disclaimer)
3. `/demo-healthcare/members/[id]` — Workforce & Learn panel
4. `/demo-healthcare/engage` — audiences “Workforce — nursing pipeline” / “nursing students”
5. `/compare-protech` — CE & workforce row

## Before demo

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm db:seed:demo
pnpm dev
```

## Gates

```bash
pnpm quake:gates
```

## Agent digest

| Agent | Finding | Risk |
|-------|---------|------|
| market-research | Producer-curated video beats generic LMS bolt-on for hospital assoc | low |
| hospital-association | Workforce personas + library tie to pipeline priority | low |
| healthcare-sme | Illustrative YouTube URLs — replace with association-approved content | medium |
| product-manager | Alpha labels on library + CE watch-time roadmap | low |
| backend | `createLearnVideoItem` + `parseVideoEmbedUrl` validation | low |
| frontend | Public library + admin preview | low |
| healthcare-compliance | No policy claims in video titles | low |
| qa | Unit tests for embed parser + Engage filter | low |
| ceo | **SHIP Week 1** — proceed to Week 2 advocacy media | low |

## Week 2 next

```
@quake-os-orchestrator Run Phases 1–6 for: Advocacy issue hero media + toolkit downloads.
Wave: data/quake-os/waves/2026-[date]-week2-advocacy-media-hub.md
```

## Files touched

- `lib/learn/video-embed.ts`
- `components/learn/video-embed-player.tsx`
- `components/learn/playlist-library.tsx`
- `components/members/member-workforce-learn-panel.tsx`
- `app/[orgSlug]/learn/library/page.tsx`
- `app/actions/learn-workforce.ts`
- `lib/engage/recipient-filter.ts`
- `app/actions/engage.ts`
- `prisma/seed-demo.ts`
- `docs/PRODUCT-CLAIMS.md`
- `lib/org-models.ts`
