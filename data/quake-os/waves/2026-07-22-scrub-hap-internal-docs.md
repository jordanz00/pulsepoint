# Wave 2026-07-22 — Scrub HAP from internal docs

## Scope

Remove employer org name **HAP** and **haponline.org** from internal `docs/` (follow-up to public README/Pages scrub).

## Files

- `docs/ENTERPRISE-INTEGRATION.md` — rewritten to employer/enterprise language
- `docs/AMS-PLATFORM-RISKS-AND-MITIGATIONS.md`
- `docs/CURSOR-WORKFLOW.md` — 340B dashboard naming
- `docs/ENTERPRISE-AMS-OPTIMIZED-PROMPT.md` — HAPevolve → Evolve display
- `docs/GO-TO-MARKET-6MONTH.md`
- `docs/INTEGRATIONS.md`
- `docs/PROJECT-PULSE.md`
- `docs/PulsePoint-Supervisor-Summary-2026-05-21.html`
- `docs/REALIZATION-PLAN.md`
- `docs/VENDOR-PORTABILITY.md`

## Verify

- [x] No standalone HAP / haponline.org / HAPevolve prose in `docs/`
- [x] Technical env ids (`hap-azure`, `hap-enterprise.css`, `hapevolve`) retained where they match code

## Gaps

- Code still uses `hap-azure` profile id, `themes/hap-enterprise.css`, `HAPevolve` display name in `lib/association/departments.ts`, and seed URLs — out of this docs-only pass
- Supervisor PDF twin not regenerated
