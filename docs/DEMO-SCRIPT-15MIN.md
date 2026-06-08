# 15-minute demo script — MemberCore + Events wedge

**Org:** Sterling Healthcare · **Slug:** `demo-healthcare`  
**Full tour:** [DEMO-GUIDE.md](./DEMO-GUIDE.md) (45 min)  
**Exceptions drill:** [EXCEPTIONS-DRILL.md](./EXCEPTIONS-DRILL.md)

---

## Setup (before the room)

```bash
pnpm demo:setup && pnpm dev
```

Open http://localhost:3000/demo → **Enter overview only**

---

## Script (15 min)

| Min | Stop | URL | Show / say |
|-----|------|-----|------------|
| 0–2 | Home | `/demo-healthcare` | KPIs: members, events, revenue. “One org, scoped data.” Pilot checklist if empty org. |
| 2–5 | Members | `/demo-healthcare/members` | Search, status pills, virtual list. Open any member → **Summary**: tags, registrations, notes. “One record—not spreadsheets.” |
| 5–8 | Events | `/demo-healthcare/events` | List + **New event**. Open published event → registrations + **Check in**. |
| 8–10 | Public reg | `/demo-healthcare/e/{slug}` | Free briefing registration (optional live submit). |
| 10–12 | Exceptions | `/demo-healthcare/exceptions` | Seeded `registration.confirm_email` + Stripe reconcile. “Partial success lands here.” |
| 12–14 | Import | `/demo-healthcare/members/imports` | Staged batch—approve before apply. |
| 14–15 | Close | Home modules grid | Live = MemberCore + Events. Learn/Commerce/etc. = **alpha**, labeled honestly. |

---

## One-liners (if asked)

| Question | Answer |
|----------|--------|
| Protech parity? | “Wedge first—members, events, ops. Alpha modules are real UI, not GA claims.” |
| Email failed? | “Registration stands; staff fixes from exceptions queue.” |
| Multi-tenant? | “Every query scoped to org; leak checks in CI.” |

---

## Do not claim

- Full Protech parity
- Commerce / Learn / Engage as production GA
- Live SSO or automated renewals (roadmap)

Run `pnpm claims:validate` before external decks.
