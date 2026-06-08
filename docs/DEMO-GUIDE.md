# PulsePoint demo guide — Sterling Healthcare (45 min)

**Short wedge demo (15 min):** [DEMO-SCRIPT-15MIN.md](./DEMO-SCRIPT-15MIN.md)

**Org:** Sterling Healthcare Association · **Slug:** `demo-healthcare`  
**Story:** A mid-size healthcare association moving off legacy AMS (Protech-class) to PulsePoint.

Use with **[PROTECH-FEATURE-MAP.md](./PROTECH-FEATURE-MAP.md)** so you can answer “where is that in Protech?” for every click.

---

## Before you present (5 min)

```bash
cd /Users/jordanzabady/Desktop/pulse
cp .env.local.example .env.local   # if needed
# Ensure DEMO_MODE=true and DEMO_SESSION_SECRET=32+ chars
pnpm demo:setup
pnpm dev
```

| Step | URL |
|------|-----|
| Marketing story | http://localhost:3000/ |
| Demo launcher | http://localhost:3000/demo |
| **Guided walkthrough** | **Start guided walkthrough** → `/demo-healthcare/walkthrough?step=0` |
| **Full suite (all modules)** | **Open full suite** → `/demo-healthcare/suite` |
| Admin overview | http://localhost:3000/demo-healthcare (or **Or enter overview only**) |

**Walkthrough bar:** On any module page, links include `?walkthrough=1` for a fixed **Next / Back** bar at the bottom.

**Static preview (no database):** https://jordanz00.github.io/pulsepoint/demo-healthcare/

---

## Tour script (recommended order)

### 1. Overview + trust (5 min) — `/demo-healthcare`

- **Stats:** 50 members, 4 events, open exceptions (seeded).
- **Say:** “Multi-tenant from day one—every query scoped to your org.”
- **Click:** Product modules grid — point out **Live** vs **Alpha** badges.
- **Quick actions:** Import review, new event.

### 2. MemberCore — live wedge (10 min)

| Stop | URL | Show |
|------|-----|------|
| Directory | `/demo-healthcare/members` | Search, tags, status mix |
| Profile | `/demo-healthcare/members/[id]` | Staff notes, **roles** (board/committee) |
| Import | `/demo-healthcare/members/imports` | Pending batch, duplicate row, applied history |

**Protech line:** “Imports are staged—nothing hits production until a human approves.”

### 3. PulsePoint Events (8 min)

| Stop | URL | Show |
|------|-----|------|
| List | `/demo-healthcare/events` | Published, draft, completed |
| Paid summit | Event detail | Registrations: CONFIRMED / PENDING / CANCELLED |
| Public page | `/demo-healthcare/e/[publicSlug]` | Open registration (free briefing) |

**Protech line:** “Registration state and paid checkout are explicit—not hidden spreadsheet status.”

### 4. Operations — Work + exceptions (5 min)

| Stop | URL | Show |
|------|-----|------|
| Work hub | `/demo-healthcare/work` | Links to all modules |
| Exceptions | `/demo-healthcare/exceptions` | Email rate limit + Stripe reconcile examples |

**Protech line:** “Automations that fail land in a queue—staff fix without calling IT.”

### 5. Alpha modules — “full suite story” (12 min)

Click each; emphasize **alpha** label:

| Module | URL | Demo highlights (seeded) |
|--------|-----|--------------------------|
| Learn | `/demo-healthcare/learn` | CME/CNE/CEU, courses, 6 credit awards |
| Giving | `/demo-healthcare/giving` | Annual fund, scholarships, 7 gifts |
| Commerce | `/demo-healthcare/commerce` | Dues, merch, gold sponsorship SKUs, orders |
| Engage | `/demo-healthcare/engage` | Templates, audiences, sent campaign |
| Insights | `/demo-healthcare/insights` | KPIs + snapshots |

**Protech line:** “These are real modules with real data—not slides. We do not call them GA until ops gates match MemberCore.”

### 6. Governance preview (3 min) — `/demo-healthcare/committees`

- Board, executive, and committee roles rolled up from MemberCore (Protech “committees” stand-in).
- **Say:** “Full committee terms and voting are roadmap; leadership context lives on the member today.”

### 7. Portal + settings (2 min)

| Stop | URL |
|------|-----|
| Portal preview | `/demo-healthcare/portal` |
| Settings | `/demo-healthcare/settings` |

---

## Protech comparison cheat sheet (one slide)

| They ask about… | You show… | Status |
|-----------------|-----------|--------|
| Member database | MemberCore | Live |
| Event registration | Events + public `/e/...` | Live |
| CE credits | Learn | Alpha |
| Annual fund | Giving | Alpha |
| Dues / storefront | Commerce | Alpha |
| Email blast | Engage | Alpha |
| Executive dashboard | Insights | Alpha |
| Board roster | Member roles + Committees page | Partial |
| Legacy CSV cutover | Import staging | Live |
| When payment/email breaks | Exceptions | Live |

---

## What not to say

- “We have full Protech parity.”
- “Commerce / Learn are production-ready” (say **alpha**).
- “Automated renewals and SSO are live” (roadmap).
- Fabricated customer logos or live hospital names beyond demo data.

Run `pnpm claims:validate` before any external deck.

---

## Reset demo data

```bash
pnpm db:seed:demo
```

---

## GitHub Pages (marketing only)

Landing: https://jordanz00.github.io/pulsepoint/  
Click-through admin shell: https://jordanz00.github.io/pulsepoint/demo-healthcare/  
(Full app requires local `pnpm dev` as above.)
