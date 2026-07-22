# PulsePoint — 6-month go-to-market plan

**Project type:** Background build — standalone demo today, Protech-class competitor at unveil (Month 6).  
**Positioning:** Cheaper, clearer, more intuitive AMS for healthcare associations. User-centric, modern UI.  
**18-month master plan:** [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) (this doc = Months 1–6 detail).  
**Not in scope until post-unveil:** Employer production integration — see [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md).

---

## North star

| Dimension | Target |
| --- | --- |
| **Product** | MemberCore + Events production-grade; Commerce + Learn beta; roadmap modules spec-complete |
| **Experience** | Apple-influenced clarity: calm UI, obvious workflows, &lt; 3 clicks to common tasks |
| **Economics** | Meaningfully lower TCO than Protech (no seven-figure lock-in narrative) |
| **Proof** | Real domain, real Postgres, real Stripe test → pilot, then supervisor demo |
| **Honesty** | Live vs Roadmap labels never drift (CI + operator checklist) |

---

## Phase overview

| Phase | Months | Theme | Supervisor-visible? |
| --- | --- | --- | --- |
| **0** | Now | Demo + design system + roadmap specs | No (background) |
| **1** | 1–2 | Live wedge hardening + hosted pilot URL | Optional peek |
| **2** | 2 | Real-world pilot (1 association sandbox) | Internal testers only |
| **3** | 3–4 | Finance: Commerce + Stripe + exports | Finance dry-run |
| **4** | 4–5 | Engage + Giving beta | Marketing pilot |
| **5** | 5–6 | Insights GA + polish | No |
| **6** | 6 | Unveil: domain, deck, scripted demo | **Yes** |

---

## Month-by-month execution

### Month 1 — Foundation & public shell

**Product**

- [ ] Lock design tokens (`lib/design-tokens.ts`, `globals.css`) — done in demo profile
- [ ] MemberCore: search performance, mobile-friendly directory
- [ ] Events: end-to-end free registration on staging
- [ ] Demo mode + seed stable for walkthroughs

**Platform**

- [ ] Buy domain (e.g. `pulsepointams.com`, `getpulsepoint.com`) — ~$12–20/year
- [ ] Staging on Vercel **Preview** + Neon Postgres (free/low tier)
- [ ] `INTEGRATION_PROFILE=demo` on staging; no employer SSO

**Testing**

- [ ] `pnpm test` + `pnpm leak:checks` green on every merge
- [ ] You: 30-min weekly dogfood script (add member → event → register → check-in)

**Spend:** ~$0–20 (domain only if not bought yet)

---

### Month 2 — Pilot-ready wedge (real stack, not static)

**Product**

- [ ] Stripe **test mode** on staging: one paid event, webhook drill documented
- [ ] Import staging: run one real (sanitized) CSV through review → apply
- [ ] Exceptions queue: force email fail, verify staff triage
- [ ] Playwright smoke test in CI (login path = demo or Clerk)

**Platform**

- [ ] Production-like env: `staging.pulsepointams.com` (or similar)
- [ ] Secrets in host vault (not `.env` in repo)
- [ ] Privacy page draft → route to counsel (budget $500–2k if external)

**Real-world testing**

- [ ] Recruit **3–5 internal testers** (not supervisors): staff personas
- [ ] Task-based sessions: "find member," "publish event," "export CSV"
- [ ] Log friction in `docs/pilot-feedback/` (create as you go)

**Spend:** ~$25–45/mo (Vercel Pro optional + Neon free/Launch)

---

### Month 3 — Finance integration (real money path, test mode)

**Product — PulsePoint Commerce (MVP)**

- [ ] Dues product type + Stripe Checkout
- [ ] Receipt email (Resend or Azure later)
- [ ] Finance export CSV: date, amount, GL code, member id
- [ ] Member purchase history on profile

**Product — Learn (MVP start)**

- [ ] CE credit types + manual credit entry
- [ ] Transcript view on member (no certificates yet)

**Testing**

- [ ] Finance dry-run: 10 test dues payments; reconcile export to spreadsheet
- [ ] Runbook owner named for "Stripe paid / DB pending"

**Spend:** ~$30–50/mo + Stripe fees only on test charges (cents)

---

### Month 4 — Engagement & giving (beta modules)

**Product — Engage (MVP)**

- [ ] Segment by tag + event attendance
- [ ] One approved template; campaign send to &lt; 50 test addresses
- [ ] Unsubscribe + suppression list

**Product — Giving (MVP)**

- [ ] Gift record + campaign fund
- [ ] Acknowledgment email template

**Real-world testing**

- [ ] Second pilot cohort: "marketing coordinator" persona
- [ ] Measure: campaign setup time, error rate

**Spend:** ~$30–50/mo; Resend free tier likely sufficient

---

### Month 5 — Intelligence & hardening

**Product — Insights (MVP → GA)**

- [ ] Executive dashboard: members, events, revenue (test data)
- [ ] Saved report: registrations by event
- [ ] Export matches dashboard numbers (no drift)
- [ ] Board packet export rehearsed once

**Testing**

- [ ] Board packet dry-run: PDF/export from Insights
- [ ] Security pass: `pnpm security:audit`, tenant leak checks

**Spend:** ~$40–60/mo if Neon Launch + Vercel Pro

---

### Month 6 — Unveil to supervisors

**Deliverables**

- [ ] Production URL on **your domain** (demo tenant pre-seeded)
- [ ] 15-minute scripted demo (Work → Members → Events → paid event → Insights)
- [ ] One-page operator checklist green for **claimed** modules only
- [ ] Comparison deck: PulsePoint vs Protech (cost, UX, modular honesty)—no fake features
- [ ] 6-month retrospective + next-phase proposal (employer integration optional, separate decision)

**Go / no-go gates**

- [ ] No 🔴 items on [OPERATOR-CHECKLIST.md](./OPERATOR-CHECKLIST.md) for modules you claim live
- [ ] Pilot feedback themes addressed or documented as known gaps
- [ ] Counsel-approved privacy policy on site if external users touched it

**Spend:** ~$40–65/mo ongoing infra; unveil is mostly your time

---

## Platform stack (recommended for “real” demo)

| Layer | Recommendation | Why | Demo cost |
| --- | --- | --- | --- |
| **Domain** | `pulsepointams.com` or similar | Credible GTM URL | ~$15/yr |
| **Hosting** | Vercel Pro (if commercial narrative) or Hobby (personal) | Native Next.js | $0–20/mo |
| **Database** | Neon Postgres → later Azure PostgreSQL | Matches Prisma today | $0–19/mo |
| **Auth** | Demo mode → Clerk free → later Entra | Swap via `lib/auth.ts` | $0 |
| **Payments** | Stripe test → Stripe live when pilot agrees | Already integrated | 2.9% + 30¢ live only |
| **Email** | Resend free → later ACS | Simple API | $0 |
| **Monitoring** | Vercel logs → App Insights later | Skip Sentry until pilot | $0 |

**Avoid for Months 1–5:** Azure full migration, employer SSO, employer marketing site embed — keeps focus and swap path clean.

---

## Finance integration (step-by-step)

1. **Stripe account** (test mode) — connect to staging.
2. **Webhook** `POST /api/webhooks/stripe` on public staging URL; verify idempotency.
3. **One paid event** — register, pay, confirm `CONFIRMED` in admin.
4. **Commerce dues** (Month 3) — SKU for annual membership; test checkout.
5. **Export schema** — agree columns with finance (date, member, amount, GL, event/fund).
6. **Monthly reconcile script** — compare Stripe payout report to DB export (spreadsheet).
7. **Runbook** — `docs/RUNBOOK.md` stripe drift scenario exercised once.
8. **Live mode** — only after supervisor approval + counsel; separate Stripe live keys.

---

## Real-world testing program (before supervisors)

| Week | Activity | Participants |
| --- | --- | --- |
| Ongoing | Dogfood checklist (15 min) | You |
| M2 W2 | Task test: add 5 members, 1 event | 3 staff volunteers |
| M2 W4 | Import test: sanitized legacy CSV | 1 data steward |
| M3 W2 | Pay test event + reconcile | You + finance ally |
| M4 W2 | Send test campaign | 1 comms volunteer |
| M5 W2 | Board metrics export review | 1 leadership ally |
| M6 W1 | Dress rehearsal | You + trusted peer |

**Capture:** task time, errors, verbatim quotes, screenshots. No supervisor until M6.

---

## Roadmap modules (build order)

Detailed specs: [ROADMAP-MODULES.md](./ROADMAP-MODULES.md) (generated from `lib/roadmap-modules.ts`).

| Order | Module | Target month | Status today |
| --- | --- | --- | --- |
| 1 | Work | M1 | Live |
| 2 | MemberCore | M1 | Live |
| 3 | Events | M1 | Live |
| 4 | Commerce | M3 | Roadmap UI + spec |
| 5 | Learn | M3–4 | Roadmap UI + spec |
| 6 | Engage | M4 | Roadmap UI + spec |
| 7 | Giving | M4 | Roadmap UI + spec |
| 8 | Insights | M5 | Alpha → GA |

---

## Step-by-step: make it real (checklist)

### A. This week

1. Confirm `.env.local`: `INTEGRATION_PROFILE=demo`, `DEMO_MODE=true`, SQLite or Neon.
2. `pnpm demo:setup && pnpm dev` — dogfood 30 minutes.
3. Pick and buy domain when ready.
4. Create Neon project; point staging `DATABASE_URL`; migrate + seed.

### B. This month

5. Deploy staging to Vercel; protect with obscurity or basic auth if needed.
6. Complete Stripe test event on staging.
7. Start `docs/pilot-feedback/` log.

### C. Months 2–5

8. Execute module MVPs per month plan above.
9. Weekly: tests green, one pilot session or dogfood.
10. Update `lib/products.ts` status only when code + checklist agree.

### D. Month 6

11. Freeze feature scope for unveil.
12. Script demo; rehearse twice.
13. Supervisor meeting + deck + live URL.

---

## Budget summary (6 months, infrastructure only)

| Scenario | Total ~6 mo |
| --- | --- |
| **Lean** (Hobby, Neon free, demo auth, domain) | **~$80–120** |
| **Credible GTM** (Pro, Neon Launch, domain, Resend free) | **~$250–400** |
| **+ Legal privacy review** | **+$500–2,500** one-time |

Build labor is your background time—not listed as SaaS.

---

## Competitive narrative (Protech)

Use only honest contrasts:

- **Modular delivery** — live Members + Events first; no implied finished suite.
- **UX** — calm UI, staged imports, visible registration/payment state.
- **Cost** — no seven-figure implementation before value; transparent hosting bills.
- **Speed** — weeks to pilot wedge, not 18-month rip-and-replace.

Do **not** claim feature parity with every Protech module until shipped and on operator checklist.

---

## Related docs

| Doc | Use |
| --- | --- |
| [ROADMAP-MODULES.md](./ROADMAP-MODULES.md) | Module specs |
| [OPERATOR-CHECKLIST.md](./OPERATOR-CHECKLIST.md) | Go-live gates |
| [FREE-STACK.md](./FREE-STACK.md) | $0 prototype |
| [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md) | Future employer/Azure |
| [PRODUCT-CLAIMS.md](./PRODUCT-CLAIMS.md) | Public language |

**Last updated:** May 2026
