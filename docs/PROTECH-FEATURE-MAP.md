# Protech → PulsePoint feature map (demo & sales)

**Purpose:** Show every familiar **Protech / legacy AMS** category and where PulsePoint stands today—without over-claiming.

**Legend**

| Label | Meaning in demo |
|-------|-----------------|
| **Live** | Production-ready wedge; use in pilot decks |
| **Alpha** | Real DB + admin UI + seed data; rough edges; say “alpha” aloud |
| **Roadmap** | Planned; coming-soon page or MemberCore partial substitute |

---

## Suite map (what to click in the demo)

| Protech area | PulsePoint module | Status | Demo URL (Sterling Healthcare) |
|--------------|-------------------|--------|--------------------------------|
| Staff home / tasks | PulsePoint Work | Live | `/demo-healthcare/work` |
| Membership / directory | MemberCore | Live | `/demo-healthcare/members` |
| Meetings & events | PulsePoint Events | Live | `/demo-healthcare/events` |
| CE / education | PulsePoint Learn | Alpha | `/demo-healthcare/learn` |
| Fundraising / donors | PulsePoint Giving | Alpha | `/demo-healthcare/giving` |
| Dues / storefront / GL codes | PulsePoint Commerce | Alpha | `/demo-healthcare/commerce` |
| Email / campaigns | PulsePoint Engage | Alpha | `/demo-healthcare/engage` |
| Dashboards / KPIs | PulsePoint Insights | Alpha | `/demo-healthcare/insights` |
| Committees / boards | MemberCore **roles** (preview) | Partial | `/demo-healthcare/committees` |
| Data cutover | Import staging | Live | `/demo-healthcare/members/imports` |
| Automation failures | Exception queue | Live | `/demo-healthcare/exceptions` |
| Member self-service | Portal preview | Live | `/demo-healthcare/portal` |

**Explicitly not Protech parity yet** (say “roadmap,” do not demo as shipped): exhibit halls, complex sponsorship tiers, multi-chapter billing trees, full GL sync, voting workflows, automated renewals, Power BI embed, formal DSAR automation.

---

## Category detail

### Membership (Live — MemberCore)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Member directory | Search, tags, status (ACTIVE / LAPSED / INACTIVE) |
| Staff notes | `MemberNote` on profile (not custom fields) |
| Leadership / board on profile | Member roles (EXECUTIVE, BOARD, COMMITTEE, CHAPTER) |
| CSV import | Stage → review → apply (`/members/imports`) |
| Export | ADMIN-gated CSV + audit log |
| Renewals automation | Roadmap (Commerce dues alpha is manual orders today) |
| SSO / portal | Portal preview; full SSO roadmap |

### Meetings & events (Live — EventCore)

| Protech capability | PulsePoint today (EventCore) |
|--------------------|------------------|
| Event publish + public link | Published events + microsite + `publicSlug` |
| Registration / capacity | CONFIRMED + WAITLIST + registration window |
| Paid registration | Stripe Checkout + promo codes + refund workflow |
| Check-in | Staff check-in + badge codes |
| Clone / recurring setup | Duplicate event (program + tickets copied) |
| Attendance / effectiveness | Analytics tab: fill rate, check-in %, revenue |
| Email to attendees | Segment email + **scheduled** campaigns (cron) |
| Post-event feedback | Post-event survey + API submit |
| Badges / booth products | Badge print PDF + sponsor booth # on program |
| Sponsors / exhibits | Sponsors on program + asset library + EasyDNN HTML export |
| Session / breakout RSVP | Per-session enrollment (admin + roadmap: public) |
| CME at event | Link to Learn credits (alpha) |

### Education (Alpha — PulsePoint Learn)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Credit types (CME, CNE, CEU) | Seeded in demo |
| Course catalog | Published + draft courses |
| Credit awards | Manual + course-linked awards on members |
| Certificates / transcripts | Roadmap |
| Learning paths | Roadmap |

### Fundraising (Alpha — PulsePoint Giving)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Campaigns | Annual fund + scholarship (demo) |
| Gifts / donations | Linked to members |
| Recurring | Field on donation; full automation roadmap |
| Acknowledgment letters | Roadmap (Engage templates partial) |

### Commerce & accounting (Alpha — PulsePoint Commerce)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Dues products | SKU + GL code on product |
| Merchandise / sponsorship SKUs | Demo catalog |
| Orders | PAID / PENDING orders |
| Finance export / GL integration | CSV export roadmap; `glCode` on products today |

### Marketing (Alpha — PulsePoint Engage)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Email templates | Approved + draft templates |
| Audiences / segments | Status + tag filters (JSON) |
| Campaign send | Historical send + logs in demo |
| Registration email | Live via Events (soft-fail → exceptions) |

### Business intelligence (Alpha — PulsePoint Insights)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| KPI cards | Live counts on Insights page |
| Snapshots / trends | Seeded metric snapshots |
| Board packet / Power BI | Export from MemberCore + Events today; PBI roadmap |

### Committees & governance (Partial)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Committee rosters | **Preview:** board/committee roles on members + `/committees` rollup |
| Term tracking, voting, packets | Roadmap dedicated Committees module |

### Advocacy & grassroots (Alpha — PulsePoint Advocacy)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Priority issue tracking | Issue hub with 8 healthcare topic templates + admin CRUD |
| Member-facing issue pages | Public `/advocacy/issues/[slug]` (illustrative copy until SME) |
| Hospital take-action | Campaign → Engage audience + public response form (alpha) |
| Legislative feed / bill tracking | Roadmap adapter stub |
| PAC / FEC compliance | Roadmap — no FEC filing claims |

### Workforce & career pipeline (Alpha — PulsePoint Learn)

| Protech capability | PulsePoint today |
|--------------------|------------------|
| Education on member profile | CE courses + awards (alpha) |
| Virtual career fair | Event kind `VIRTUAL_CAREER_FAIR` + draft microsite (alpha) |
| Video / CE libraries | Playlist model — hosted video roadmap |
| Pipeline programs | Workforce program enrollment stub |
| Student / employer personas | `Member.workforcePersona` field (alpha) |

**Marketing:** Honest comparison at `/compare-protech` — no false parity claims.

---

## Honest talk track (30 seconds)

> “PulsePoint replaces the **daily staff wedge** Protech charges millions for—members, events, imports, payments, and operational trust. **Learn, Giving, Commerce, Engage, and Insights** are real alpha modules you can click today with sample data; we label them alpha until the same ops gates as MemberCore. We are **not** claiming exhibit management, full GL, or 20 years of edge cases in v1—that is intentional.”

See **[DEMO-GUIDE.md](./DEMO-GUIDE.md)** for click-by-click tour.
