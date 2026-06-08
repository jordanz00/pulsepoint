# Incident Response — PulsePoint

## Severity levels

| Level | Example | Response time target |
|-------|---------|----------------------|
| **S1** | Cross-tenant data exposure | Immediate — isolate + notify leadership |
| **S2** | Auth bypass, webhook forgery | Same day — rotate secrets, patch |
| **S3** | Rate limit bypass, audit gap | Next business day |
| **S4** | Dependency CVE (no exploit) | Scheduled patch window |

## S1 — Suspected data leak

1. **Contain:** Disable affected route or set maintenance flag on Vercel.
2. **Preserve:** Export audit logs for affected `orgId`(s); do not delete rows.
3. **Assess:** Run `pnpm leak:checks` and review `AuditLog` for anomalous exports.
4. **Notify:** Association IT + legal per contract; document timeline.
5. **Remediate:** Patch tenant guard; add regression test; redeploy.
6. **Review:** Post-incident note in internal tracker (not public repo).

## S2 — Auth or payment compromise

1. Rotate: Clerk/Entra secrets, Stripe webhook secret, `CRON_SECRET`.
2. Invalidate active sessions (Clerk dashboard / Entra revoke).
3. Review `AutomationException` and Stripe dashboard for duplicate charges.
4. Patch and deploy; run `pnpm security:audit`.

## S3 — Abuse / injection attempt

1. Check rate limit logs / Vercel firewall.
2. Review payload in `AutomationException` or Sentry (no PII in tickets).
3. Tighten Zod bounds or add `sanitizeText` at boundary.

## Contacts

- **Technical owner:** Project maintainer / association IT (fill before production).
- **Vulnerability reports:** See `SECURITY.md` — private disclosure only.

## Prevention (standing)

- `pnpm security:audit` in CI on every PR
- No PHI in PulsePoint without separate HIPAA architecture review
- `docs/DATA-SECURITY-PLAN.md` choke points for all new features
