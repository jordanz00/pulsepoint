# Quake OS — Lessons Learned

Append after each wave. One bullet per lesson; link wave file when possible.

## Format

`- **YYYY-MM-DD** [agent-id] Lesson. → Action taken. (wave: path)`

---

## Log

- **2026-06-05** quake-os-orchestrator Quake OS stood up as parallel specialist org over PulsePoint AMS. → Use six-phase framework in `docs/QUAKE-OS.md`. (wave: bootstrap)
- **2026-06-05** quake-os-audit Advocacy marketing ran ahead of admin product — register claims before pitch. → Added Advocacy/PAC to PRODUCT-CLAIMS; alpha badges on advocacy, imports, pulse. (wave: membership-advocacy-pilot)
- **2026-06-05** quake-os-coo Engineering gates green (84 tests, 10 leak checks) but pilot ops 35% — staging/Entra/Stripe/legal all human ☐. → CEO REVISE: demo wedge OK, external pilot defer 2–3 weeks. (wave: membership-advocacy-pilot)
- **2026-06-05** quake-os-cto Renewal cron must not run pre-Stripe drill. → `PULSE_CRON_RENEWALS` / `PULSE_CRON_SUBSCRIPTIONS` default off. (wave: triple-initiative)
- **2026-06-05** quake-os-hospital-association Advocacy KPIs must use hospital accounts not raw member count. → `loadAdvocacyDashboardStats`. (wave: triple-initiative)
- **2026-06-05** quake-os-product-manager PROTECH-IMPORT doc was stale vs 10k row mapper. → Doc refresh + pilot checklist. (wave: triple-initiative)
- **2026-06-05** quake-os-backend Advocacy take-action MVP: issue → campaign → Engage audience. → `app/actions/advocacy.ts` + quick actions UI. (wave: run-now)
- **2026-06-05** quake-os-continuous-runner Continuous mode needs automated gates + backlog, not ad-hoc waves only. → `pnpm quake:gates`, 5 new specialists, weekly CI workflow. (wave: 2026-06-05-continuous-bootstrap)
- **2026-06-05** quake-os-security Typecheck in gates catches drift before ship. → Fixed zod/M365/PAC test types; gates now 91 tests OK. (wave: 2026-06-05-continuous-bootstrap)
- **2026-06-07** quake-os-orchestrator Wave 1 healthcare AMS needs schema + test fixture sync on Member.workforcePersona. → Added field + member-bulk-edit test fix. (wave: 2026-06-07-healthcare-ams-world-class)
- **2026-06-07** quake-os-healthcare-sme Advocacy issue hub copy must stay illustrative until SME sign-off. → contentMeta validationStatus on templates + public disclaimer. (wave: 2026-06-07-healthcare-ams-world-class)
- **2026-06-07** quake-os-backend Week 1 video library: allowlist YouTube/Vimeo embeds only — no raw iframe URLs. → parseVideoEmbedUrl + unit tests. (wave: 2026-06-07-week1-learn-video-library)
- **2026-06-08** quake-os-audit Landing big numbers must carry illustrative disclaimer like module previews. → Added disclaimer to WHAT_MAKES_IT_DIFFERENT + #why-pulsepoint footnote. (wave: 2026-06-08-why-pulsepoint-landing-quake-os)
- **2026-06-08** pulse-glass-ui Flagship marketing bands need early page placement + interactive viz — not buried below fold. → Moved #why-pulsepoint to section 4; compare tabs + AnimatedBarList. (wave: 2026-06-08-why-pulsepoint-landing-quake-os)
