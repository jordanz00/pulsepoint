# PulsePoint — AMS platform risks, industry context, and mitigations

**Audience:** Founder, IT, security reviewers, grant/board questions  
**Purpose:** Honest answers to “Is Next.js wrong for AMS?”, why Protech still dominates, and how PulsePoint closes gaps—with **primary fix** and **backup fix** per risk.  
**Companion:** [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md) (failover tiers, RTO), [VENDOR-PORTABILITY.md](./VENDOR-PORTABILITY.md) (adapter matrix)

---

## Short answers

| Question | Answer |
|----------|--------|
| **Is Next.js bad for AMS?** | **No** — it is uncommon at enterprise AMS scale, not invalid. Risk is **buyer perception + ops maturity**, not the framework. |
| **Against industry standards?** | Some gaps vs **Dynamics/Salesforce AMS** (decades of GL, chapters, certs). Not vs **modern vertical SaaS** (web app + Postgres + webhooks). |
| **Why hasn’t someone built this already?** | Many have (Wild Apricot, MemberClicks, Novi, etc.). **Protech-tier** buyers want Microsoft ecosystem depth, implementation armies, and 20 years of edge cases—not another greenfield UI. |
| **Zero downtime if Vercel dies tomorrow?** | **Not today without pre-paid standby infra.** You can get to **minutes–hours** with a **warm standby** host + documented runbook; **true active-active** is a paid Phase C decision. |

---

## Is Next.js “wrong” for an AMS?

### What buyers expect from “enterprise AMS”

| Expectation | Protech / iMIS norm | Next.js + Postgres (PulsePoint) |
|-------------|---------------------|----------------------------------|
| Long implementation partner | Yes | You are the partner (risk + opportunity) |
| Microsoft 365 / Teams / Outlook native | Deep (Protech on D365) | Integrate via Graph API + Entra (planned) |
| Finance / GL | ERP connectors, mature | Export + Stripe; full GL is roadmap |
| SOC 2 report from vendor | Vendor provides | **You** must obtain when selling SaaS |
| Single vendor throat to choke | Protech + Microsoft | You compose Vercel + Neon + Clerk + … |

### Legitimate concerns with Next.js for AMS (and repairs)

| Concern | Why it matters | Repair in PulsePoint |
|---------|----------------|----------------------|
| **Serverless cold starts** | First request slow after idle | Use Node server/Docker standby; Neon always-on tier; keep-alive cron on preview |
| **Long-running jobs** | Renewals, bulk email, imports | Queue workers (future): Azure Functions, Inngest, or dedicated worker container—not 60s Vercel limit only |
| **Session / SSR complexity** | Admin + portal + public events | Keep demo/Clerk paths explicit; document in `SYSTEM-DESIGN.md` |
| **“Not .NET” for Microsoft shops** | IT prefers Azure + Entra | `INTEGRATION_PROFILE=hap-azure` + Entra stub + `DEPLOY-AZURE.md` (future) |
| **Monolith scaling** | Huge associations | Postgres + read replicas later; module boundaries via adapters |

**Verdict:** Next.js is a **fine application layer** for a modular AMS. What you must prove is **operational trust** (imports, money, permissions, audit)—not that you picked React.

---

## Why there isn’t more “modern Protech” competition

| Factor | Effect |
|--------|--------|
| **Switching cost** | Migrations take 12–24 months; 96%+ retention cited for entrenched vendors |
| **Edge-case surface** | Exhibits, chapters, CE, GL, sponsorships—20 years of rules |
| **Microsoft bundling** | Protech sells “we are Dynamics + Azure + Power BI” to IT committees |
| **Sales motion** | RFPs, SI partners, not Product Hunt |
| **Smaller TAM per vertical** | Healthcare association niche is real but smaller than horizontal CRM |
| **People *did* build modern AMS** | Wild Apricot, MemberClicks, Glue Up, Novi, Raklet, etc.—different segment than Protech enterprise |

**PulsePoint’s wedge:** Not “replace Protech in year one”—**better UX + honest modular wedge + operational trust** for one pilot, then expand.

---

## Risk matrix (issue → fix → backup)

**RTO** = realistic recovery time objective for Option A pilot (not fantasy zero-downtime unless Tier 2 standby is funded).

### 1. Hosting (Vercel)

| | |
|---|---|
| **Issue** | Vercel outage, pricing change, or company risk → app URL down |
| **Industry norm** | Azure App Service / AWS with SLA + DR region |
| **Gap today** | Single host; no hot standby |
| **Primary fix** | Build **OCI/Docker image** (`Dockerfile` in repo); store in GHCR; document env template |
| **Backup fix** | Pre-provision **Railway / Render / Fly / Azure Container Apps** with same image; DNS cutover |
| **RTO** | **15–60 min** manual; **5–15 min** if standby host already running (see BUSINESS-CONTINUITY Tier 1) |
| **“Instant” truth** | **Instant** = health check flips DNS to warm standby you already pay for—not magic |

### 2. Database (Neon)

| | |
|---|---|
| **Issue** | Neon pause (free tier), outage, vendor exit |
| **Industry norm** | Azure SQL / Postgres with geo-replica + PITR |
| **Gap** | Single `DATABASE_URL`; SQLite local only for dev |
| **Primary fix** | Neon **paid** branch + daily backup; document `prisma migrate deploy` restore |
| **Backup fix** | Restore dump to **Supabase / RDS / Azure Postgres**; swap `DATABASE_URL`; redeploy |
| **RTO** | **1–4 hours** (restore dependent); app up in minutes after DB live |

### 3. Authentication (Clerk / demo)

| | |
|---|---|
| **Issue** | Clerk outage; SSO not Entra-native yet |
| **Industry norm** | Entra ID / Azure AD B2C for workforce + members |
| **Gap** | Clerk primary; Entra stub |
| **Primary fix** | Finish **Entra adapter** for `hap-azure`; map `Member` external IDs |
| **Backup fix** | `HOSTED_DEMO` / demo cookie for staff emergency; Auth.js self-host on Postgres |
| **RTO** | **5–15 min** (demo mode); **days–weeks** (full Entra cutover) |

### 4. Payments (Stripe)

| | |
|---|---|
| **Issue** | Webhook delay, Stripe outage, reconciliation drift |
| **Industry norm** | Processor + finance ERP reconciliation |
| **Gap** | Stripe-only live path |
| **Primary fix** | Idempotent webhooks + `AutomationException` + runbook |
| **Backup fix** | **Manual payment adapter** (already shipped); staff marks paid offline |
| **RTO** | **0 min** (record pending); same-day processor swap |

### 5. Email (Resend)

| | |
|---|---|
| **Issue** | Confirmation email fails |
| **Industry norm** | Org SMTP relay |
| **Gap** | Resend primary |
| **Primary fix** | `sendEmailWithFailover()` chain (Resend → SMTP → log) |
| **Backup fix** | `EMAIL_ADAPTER=smtp` env; org relay credentials in vault |
| **RTO** | **&lt; 5 min** redeploy |

### 6. Security / compliance

| | |
|---|---|
| **Issue** | Cross-tenant leak, webhook forgery, CSV exfiltration, no SOC 2 yet |
| **Industry norm** | SOC 2 Type II, pen test, RLS, WAF |
| **Gap** | App-layer tenant scope; RLS reference only; no SOC 2 |
| **Primary fix** | Keep `leak:checks` + `security:audit` in CI; human review on money paths; Postgres RLS Phase C |
| **Backup fix** | Incident runbook; disable public registration; rotate webhook secrets |
| **RTO** | Prevention &gt; recovery |

### 7. Association **website** (CMS) connection

| | |
|---|---|
| **Issue** | Employer marketing site vs PulsePoint app—cookies, SSO, brand, “embedded AMS” |
| **Industry norm** | Same domain via reverse proxy or vendor-hosted portal |
| **Gap** | Link-out only today |
| **Primary fix** | Pattern **A link-out** first; env `NEXT_PUBLIC_MARKETING_SITE_URL` |
| **Backup fix** | Pattern **B** Azure Front Door path routing; avoid iframe unless security signs off |
| **RTO** | N/A (not outage—integration project) |

### 8. **Data warehouse** / Power BI

| | |
|---|---|
| **Issue** | IT expects Gold tables, semantic layer, refresh schedules—not app DB direct |
| **Industry norm** | ETL to warehouse; PBI datasets; certified measures |
| **Gap** | Insights alpha; no nightly ETL to customer warehouse yet |
| **Primary fix** | **Phase 1:** CSV exports + stable `metricKey` registry (align with 340B dashboard semantic discipline) |
| **Backup fix** | **Phase 2:** Read-only replica + `pg_dump`/Fivetran/Airbyte to Azure Synapse or Fabric |
| **Backup 2** | Power BI **import mode** from scheduled CSV until embed approved |
| **RTO** | Reporting degrades to exports; core AMS still runs |

### 9. **Microsoft** products (365, Teams, Graph, Fabric)

| | |
|---|---|
| **Issue** | “Not Microsoft-native” objection vs Protech |
| **Industry norm** | D365 + Outlook + Teams + Power BI out of box |
| **Gap** | No Graph calendar sync, no Teams tabs, no Fabric pipeline |
| **Primary fix** | Entra SSO + optional Graph scopes (calendar, directory) behind feature flags |
| **Backup fix** | iCal export + manual Teams links; PBI via warehouse not embed |
| **RTO** | Feature gaps, not outage |

### 10. Background jobs / cron

| | |
|---|---|
| **Issue** | Vercel Cron limits; renewals need reliable schedules |
| **Industry norm** | Azure Functions / Windows services |
| **Gap** | Vercel Cron / GitHub Actions |
| **Primary fix** | Idempotent job handlers + `JobRun` audit table (when added) |
| **Backup fix** | GitHub Actions cron hitting `/api/cron/*` on standby host |
| **RTO** | Hours (missed run); catch-up job |

### 11. Observability

| | |
|---|---|
| **Issue** | “Something broke” invisible to ops |
| **Industry norm** | APM + paging |
| **Gap** | Logs only |
| **Primary fix** | Sentry + uptime check on `/api/health` |
| **Backup fix** | Better Stack / UptimeRobot → runbook SMS |
| **RTO** | Detection in minutes |

### 12. Legal / subprocessors

| | |
|---|---|
| **Issue** | Privacy policy, DPA, subprocessors list |
| **Industry norm** | Counsel-approved docs |
| **Gap** | SUBPROCESSORS doc; privacy not counsel-final |
| **Primary fix** | Counsel review before external users |
| **Backup fix** | Pilot under NDA + limited PII |
| **RTO** | N/A |

---

## “Automatic backup” — what PulsePoint can honestly claim

| Tier | Name | What you get | Cost | Honest RTO |
|------|------|--------------|------|------------|
| **0** | Documented cold standby | Repo + Docker image + runbook; redeploy manually | ~$0 extra | 1–4 hours |
| **1** | **Warm standby** (recommended next) | Second host running same image; health checks; DNS failover playbook | ~$5–25/mo second host | **5–15 min** |
| **2** | Active-passive DB replica | Postgres replica + promote procedure | Neon paid / Azure | 15–60 min DB; app minutes |
| **3** | Active-active | Multi-region LB + replicated DB | $$$$ | &lt; 1 min |

**Today:** Tier 0 + partial adapter failover (email chain, manual payments).  
**To market “automatic failover”:** implement Tier 1 + uptime monitor that **triggers runbook** (human or scripted DNS), not undefined magic.

---

## Industry-standard gaps → project repairs (checklist)

| Gap | Repair | Owner |
|-----|--------|-------|
| No Dockerfile | ✅ `Dockerfile` + `docker-compose.standby.yml` | Engineering |
| No continuity runbook | ✅ `BUSINESS-CONTINUITY.md` | Ops |
| Demo on Vercel Production | `HOSTED_DEMO` Preview only | Deploy |
| SQLite vs Postgres drift | Single migrate path for hosted; `db:push` local only | Engineering |
| No `/api/health` | Add health route for monitors | Engineering |
| No SOC 2 | Pilot under NDA; SOC 2 when selling SaaS (Option B) | Leadership |
| No warehouse ETL | Export + metric registry first | Data |
| No Entra | `hap-azure` profile when IT ready | Integration |
| Playwright not in CI | Week 1 REALIZATION-PLAN | Engineering |

---

## Related docs

- [BUSINESS-CONTINUITY.md](./BUSINESS-CONTINUITY.md) — failover tiers, DNS, drills  
- [VENDOR-PORTABILITY.md](./VENDOR-PORTABILITY.md) — adapter swap  
- [ENTERPRISE-INTEGRATION.md](./ENTERPRISE-INTEGRATION.md) — Microsoft + employer marketing site  
- [SECURITY-PARANOID.md](./SECURITY-PARANOID.md) — controls  
- [REALIZATION-PLAN.md](./REALIZATION-PLAN.md) — wedge before parity  

**Last updated:** May 2026
