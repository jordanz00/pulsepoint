# Quake OS Wave Plan — Solo Comms 4-Week Sprint

**Date:** 2026-06-07  
**ID:** wave-solo-comms-4week-sprint-2026-06-07  
**Repo:** `/Users/jordanzabady/Desktop/pulse`  
**Demo org:** Sterling Healthcare · slug `demo-healthcare`  
**Owner:** Hospital association digital comms / producer (solo, AI-assisted Cursor development)

## Mission

Ship four highly visible, highly achievable **Alpha / demo preview** features across the full AMS — Learn, Advocacy, Events, MemberCore, Engage, Insights, Command center, and Marketing — using Quake OS six-phase workflow each week.

## Story line (external)

> I'm a hospital association digital comms producer building a modern AMS with AI-assisted development — shipping visible advocacy, workforce, and member experience with honest **Live / Alpha / Roadmap** labels.

## Ground truth

- `docs/PRODUCT-CLAIMS.md` — never over-claim Live
- `docs/DEMO-GUIDE.md` + `docs/PROTECH-FEATURE-MAP.md` — demo routes and Protech mapping
- `getOrgDb(orgId)` on all tenant data · `pnpm leak:checks`
- No invented stats or unverified policy claims — SME review for advocacy copy
- PAC/FEC compliance boundaries per `docs/DATA-SECURITY-PLAN.md`

---

## Weekly Quake OS rhythm (~2–3 hrs admin)

| Day | Activity | Command |
|-----|----------|---------|
| **Mon** | Scope week; Phases 1–2 | `@quake-os-orchestrator Run Phases 1–2 for: [Week N feature]` |
| **Tue–Thu** | Producer assets + Phase 3 build | `@quake-os-orchestrator Run Phase 3 Wave 1 for: [feature]` |
| **Fri** | Gates + 3-min screen capture | `pnpm quake:gates` |
| **Fri PM** | Wave report + knowledge | Append lessons · `pnpm quake:knowledge:migrate` |

**Stitch rule:** Every week must touch **≥3 AMS modules** (see stitch map below).

---

## AMS stitch map

```
MemberCore ──┬── Learn (CE, playlists, personas)
             ├── Events (career fair, recaps)
             ├── Advocacy (issues, hospitals, take-action)
             ├── Engage (segments, templates)
             ├── Insights / Command center (KPIs, board view)
             └── Marketing (/compare-protech, comms showcase)
```

**Existing Wave 1 foundation (done):**

| Surface | Route |
|---------|-------|
| Advocacy issue hub | `/demo-healthcare/enterprise/advocacy/issues` |
| Public issue pages | `/demo-healthcare/advocacy/issues/[slug]` |
| Learn workforce shell | `/demo-healthcare/learn/workforce` |
| Protech comparison | `/compare-protech` |

---

## Week 1 — Branded Learn video library

**Feature:** Real embeds in workforce playlists + watch experience  
**Label:** **Alpha**  
**Gap today:** `LearnVideoItem.videoUrl` empty; hosted player / CE auto-award from watch time = roadmap

### Modules stitched

| Module | Route | Change |
|--------|-------|--------|
| Learn | `/demo-healthcare/learn/workforce` | YouTube/Vimeo embeds in playlists |
| Learn | `/demo-healthcare/learn` | CTA → Workforce library |
| MemberCore | `/demo-healthcare/members/[id]` | Enrollments + playlist suggestions on profile |
| Engage | `/demo-healthcare/engage` | Audience filter tag `workforce-nursing` |
| Insights | `/demo-healthcare/insights` | Manual widget: playlist engagement (stub OK) |

### Producer tasks (no code)

- [ ] Curate 3–5 clips per track: nursing, allied health, advocacy 101
- [ ] Write 2-sentence intro per playlist (8th–10th grade reading level)
- [ ] Export 16:9 thumbnail per playlist

### Orchestrator prompt (Mon)

```
@quake-os-orchestrator Run Phases 1–6 for: Learn workforce video library.
Week 1 scope: embed URLs in LearnVideoItem, member watch UI, seed demo-healthcare.
Stitch: Learn → Member profile → Engage audience tag. Alpha only. pnpm quake:gates.
Wave: data/quake-os/waves/2026-[date]-week1-learn-video-library.md
Agents: @quake-os-healthcare-sme @pulse-glass-ui @quake-os-backend
```

### Demo script (~8 min)

**Theme:** *Education that looks like our brand, not an LMS bolt-on.*

| Step | Route | Say |
|------|-------|-----|
| 1 | `/demo-healthcare` | Live member + event wedge; Learn workforce is **alpha**. |
| 2 | `/demo-healthcare/learn` → `/learn/workforce` | Producer-curated video, not generic LMS. Play one embed. |
| 3 | `/demo-healthcare/members` → `[id]` | One record — CE, enrollments, workforce persona together. |
| 4 | `/demo-healthcare/engage` | Same roster powers email — no CSV export. |
| 5 | `/compare-protech` | Row: CE & workforce → Alpha playlists + career fair shell. |

### Acceptance

- [ ] Embeds play in admin + member-facing view
- [ ] Alpha badge visible
- [ ] `pnpm quake:gates` green
- [ ] `docs/PRODUCT-CLAIMS.md` updated if new surface
- [ ] Wave file + `lessons-learned.md` append

---

## Week 2 — Advocacy issue landing with hero media + toolkit

**Feature:** Rich public issue pages (hero image/video, PDF toolkit, take-action CTA)  
**Label:** **Alpha** · `contentMeta.validationStatus: illustrative_only` until policy SME

### Modules stitched

| Module | Route | Change |
|--------|-------|--------|
| Advocacy | `/demo-healthcare/enterprise/advocacy/issues` | Template cards with media fields |
| Advocacy (public) | `/demo-healthcare/advocacy/issues/nursing-workforce` | Hero + toolkit + CTA |
| Advocacy | `/demo-healthcare/enterprise/advocacy` | Campaign launch from issue |
| Engage | `/demo-healthcare/engage` | Template: Issue alert — [topic] |
| Enterprise | `/demo-healthcare/enterprise` | HA strip active issues |
| Command center | `/demo-healthcare/command-center` | Advocacy panel deep-link |

### Producer tasks

- [ ] Two issues: **nursing workforce** + **workplace violence**
- [ ] Hero: 30-sec loop or still (association-branded)
- [ ] One-page PDF toolkit each
- [ ] SME review of summary text before leadership demo

### Orchestrator prompt (Mon)

```
@quake-os-orchestrator Run Phases 1–6 for: Advocacy issue hero media + toolkit downloads.
Stitch: issue hub → public page → campaign → Engage. contentMeta illustrative_only.
Compliance: @quake-os-healthcare-compliance review PAC boundaries (no FEC claims).
Wave: data/quake-os/waves/2026-[date]-week2-advocacy-media-hub.md
```

### Demo script (~10 min)

**Theme:** *Policy comms in one workflow.*

| Step | Route | Say |
|------|-------|-----|
| 1 | `/demo-healthcare/command-center` | Advocacy KPIs from live tenant data. |
| 2 | `/demo-healthcare/enterprise/advocacy/issues` | Template with your media. |
| 3 | `/demo-healthcare/advocacy/issues/nursing-workforce` | Member-facing page; disclaimer until SME approves. |
| 4 | `/demo-healthcare/enterprise/advocacy` | Campaign → Launch → Engage audience. |
| 5 | `/demo-healthcare/advocacy/[campaignId]` | Hospital take-action form. |
| 6 | `/demo-healthcare/enterprise/organizations` | Hospital roster tied to participation. |

### Acceptance

- [ ] Hero + PDF load
- [ ] SME disclaimer visible on public pages
- [ ] Take-action regression pass
- [ ] No invented stats or unverified legal claims
- [ ] Gates green

---

## Week 3 — Virtual career fair booth grid

**Feature:** Visual employer booths on career fair event + registration  
**Label:** **Alpha** · booth chat / live video = roadmap (BL-026 slice)

### Modules stitched

| Module | Route | Change |
|--------|-------|--------|
| Learn workforce | `/demo-healthcare/learn/workforce` | Booth admin + event link |
| Events | `/demo-healthcare/events` | `VIRTUAL_CAREER_FAIR` with booth list |
| Events (public) | `/demo-healthcare/e/nursing-career-fair-2026` | Booth grid + register |
| MemberCore | `/demo-healthcare/members` | `workforcePersona` STUDENT / NEW_GRAD |
| Commerce | `/demo-healthcare/commerce` | Optional employer partner SKU (illustrative) |
| Insights | `/demo-healthcare/members/analytics` | Persona counts from tenant DB |

### Producer tasks

- [ ] 6–8 employer booth cards (logo, pitch, roles hiring)
- [ ] Fair landing copy: audience, date, registration steps
- [ ] 60-sec screen recording of booth grid for portfolio

### Orchestrator prompt (Mon)

```
@quake-os-orchestrator Run Phase 3 Wave 2 for: Virtual career fair booth grid (BL-026 slice).
Stitch: Learn workforce → Event microsite → Member persona → analytics.
Honest: booth chat/live video = roadmap. pnpm quake:gates.
Wave: data/quake-os/waves/2026-[date]-week3-career-fair-booths.md
Agents: @quake-os-frontend @quake-os-hospital-association @pulse-glass-ui
```

### Demo script (~10 min)

**Theme:** *Workforce is association strategy, not HR software.*

| Step | Route | Say |
|------|-------|-----|
| 1 | `/demo-healthcare/suite` | Live vs Alpha across modules. |
| 2 | `/demo-healthcare/learn/workforce` | Programs, personas, link to fair. |
| 3 | `/demo-healthcare/events` | Open Nursing Career Fair 2026. |
| 4 | `/demo-healthcare/e/nursing-career-fair-2026` | Booth grid + registration. |
| 5 | `/demo-healthcare/members` | Student / new grad personas. |
| 6 | `/demo-healthcare/members/analytics` | Pipeline counts from DB. |

### Acceptance

- [ ] Booth grid on public event page
- [ ] Registration path works
- [ ] Personas visible on members
- [ ] Labeled Alpha throughout

---

## Week 4 — Board briefing pack + “built by comms” showcase

**Feature:** Print-friendly board view + marketing story tying Weeks 1–3  
**Label:** **Demo preview** (export) · **Alpha** (stitched KPIs)

### Modules stitched

| Module | Route | Change |
|--------|-------|--------|
| Command center | `/demo-healthcare/command-center` | Print-friendly board layout |
| Insights | `/demo-healthcare/insights` | Snapshot: advocacy + workforce metrics |
| Advocacy + Learn | prior routes | Deep links from briefing |
| Marketing | `/compare-protech` + `/built-by-comms` (new) | Story + screen captures |
| Work | `/demo-healthcare/work` | “Board pack ready” task tile |

### Producer tasks

- [ ] One-page executive summary (plain English)
- [ ] Week 1–3 screenshots + 30-sec sizzle reel
- [ ] Record 20-min master demo for portfolio

### Orchestrator prompt (Mon)

```
@quake-os-orchestrator Run Phases 1–6 for: Board briefing export + comms showcase page.
Stitch: command-center + insights + advocacy + learn workforce KPIs.
@quake-os-technical-writer update DATA-DICTIONARY + PRODUCT-CLAIMS (demo preview).
Wave: data/quake-os/waves/2026-[date]-week4-board-showcase.md
Phase 6: @quake-os-ceo verdict SHIP for portfolio demo.
```

### Demo script (~20 min) — portfolio master

| # | Route | Time | Focus |
|---|-------|------|-------|
| 1 | `/` or `/built-by-comms` | 2 min | Your story |
| 2 | `/compare-protech` | 2 min | Honest comparison |
| 3 | `/demo-healthcare/command-center` | 3 min | Executive view |
| 4 | `/demo-healthcare/members/imports` | 3 min | Trust + cutover |
| 5 | `/demo-healthcare/events` + `/e/...` | 3 min | Live events wedge |
| 6 | `/enterprise/advocacy/issues` → public issue | 3 min | Advocacy + media |
| 7 | `/learn/workforce` → `/e/nursing-career-fair-2026` | 3 min | Workforce + fair |
| 8 | Command center print/export | 1 min | Board pack |

**Closing:** *Built by association comms with AI-assisted engineering — one platform for members, advocacy, workforce, and board-ready reporting.*

### Acceptance

- [ ] Board print/export usable in browser
- [ ] Showcase page live with honest labels
- [ ] CEO Phase 6 verdict documented in wave file
- [ ] All four weekly waves filed under `data/quake-os/waves/`

---

## Cumulative deliverables (end of Week 4)

| Artifact | Location |
|----------|----------|
| Master plan | `data/quake-os/waves/2026-06-07-solo-comms-4week-sprint.md` (this file) |
| Weekly wave reports | `data/quake-os/waves/2026-*-week*.md` |
| Requirements | `data/quake-os/requirements-registry.json` |
| Lessons | `data/quake-os/lessons-learned.md` |
| Knowledge DB | `knowledge/*.db` via `pnpm quake:knowledge:migrate` |
| Portfolio assets | Screen recordings, board PDF, marketing captures |

---

## Commands cheat sheet

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm demo:setup
pnpm dev
pnpm quake:gates
pnpm quake:knowledge:migrate
pnpm quake:os:daily
pnpm claims:validate
```

---

## Safe claims vs avoid

| OK | Avoid |
|----|--------|
| Alpha — real UI, seeded data, pilot wedge | “Full Protech replacement shipped” |
| Producer content + AI-assisted Cursor dev | Invented hospital stats or policy claims |
| Board pack = demo preview until finance sign-off | Automated renewals, full SSO, Power BI as Live |
| Compare page uses Live/Alpha/Roadmap per row | Market share or pricing numbers without public source |

---

## Backlog linkage

| ID | Week | Status |
|----|------|--------|
| BL-025 | Pre-sprint | done — issue hub, workforce shell, compare page |
| BL-026 | Week 3 | pending — career fair booths (+ video Week 1) |
| BL-027 | Post-sprint | pending — legislative feed, GL slice |

---

## Next action

**Week 1 — SHIPPED (2026-06-07):** See `data/quake-os/waves/2026-06-07-week1-learn-video-library.md`. Re-seed demo before presenting.

**Week 2 Monday:** Run the Week 2 orchestrator prompt (advocacy hero media).
