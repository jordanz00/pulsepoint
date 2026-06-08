# Advocacy security audit — 2026-06-07

**Tool:** `scripts/security-audit.sh` (Semgrep CLI not installed locally; shell audit covers advocacy paths via repo-wide SAST patterns)

## Result: PASS

| Check | Status |
|-------|--------|
| Tenant leak checks (`pnpm leak:checks`) | 10/10 pass |
| No direct prisma tenant bypass in `app/` | OK |
| Actions use `requireCapability` | OK |
| No `innerHTML` assignments | OK |
| No tracked secrets | OK |
| No `eval()` | OK |
| No template-literal SQL | OK |
| Advocacy public submit audit log | Shipped (`lib/advocacy/submit-take-action-response.ts`) |
| Integration isolation test | `tests/integration/advocacy-public-isolation.test.ts` |

## Advocacy paths reviewed

- `app/actions/advocacy.ts`
- `lib/advocacy/*`
- `app/api/advocacy/*` (if present)
- Public take-action route + `submitAdvocacyResponse`

## Follow-up (IT)

Install Semgrep in CI for automated scan on PR:

```bash
pnpm exec semgrep scan --config auto
```
