# Wave — Cursor workflow + landing flagship

**Date:** 2026-06-08  
**Scope:** PulsePoint session discipline + marketing UX

## Shipped

| Item | Path |
|------|------|
| Cursor workflow doc | `docs/CURSOR-WORKFLOW.md` |
| Session focus board | `docs/PROJECT-PULSE.md` |
| Always-on Cursor rule | `.cursor/rules/pulse-session-workflow.mdc` |
| Session CLI | `scripts/cursor-session.sh` → `pnpm workflow:session` |
| Sticky jump nav | `components/marketing/marketing-jump-nav.tsx` |
| Hero CTA → Why PulsePoint | `components/marketing/marketing-hero-premium.tsx` |
| Flagship band styling | `app/liquid-glass-overhaul.css` |
| E2E tests fixed | `tests/e2e/marketing.spec.ts` |
| EventCore mix clip fix | `app/pulse-surfaces.css` |

## Verify

```bash
cd /Users/jordanzabady/Desktop/pulse
pnpm workflow:session --gates
pnpm exec playwright test tests/e2e/marketing.spec.ts
```

**VERDICT:** APPROVED
