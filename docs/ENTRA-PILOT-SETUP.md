# Microsoft Entra ID — Pilot setup

**Profile:** `INTEGRATION_PROFILE=pilot-entra`  
**Repo:** `/Users/jordanzabady/Desktop/pulse`

## 1. App registration (SPA)

| Field | Value |
|-------|-------|
| Name | `PulsePoint AMS Pilot` |
| Supported accounts | Single tenant |
| Platform | Single-page application |
| Redirect URI | `https://<staging-host>/api/auth/entra/callback` |
| Redirect URI (local) | `http://localhost:3000/api/auth/entra/callback` |
| Implicit grant | **Off** — auth code + PKCE only |

## 2. API permissions

- Microsoft Graph → Delegated:
  - `openid`, `profile`, `email`, `offline_access`
  - `User.Read`
  - `Mail.Read` (for inbox sync v1)
  - `Contacts.Read` (optional)

Grant admin consent for the pilot tenant.

## 3. Security groups (optional)

| Group | Maps to |
|-------|---------|
| `pulsepoint-owners` | `ENTRA_OWNER_GROUP_ID` → OWNER |
| `pulsepoint-admins` | `ENTRA_ADMIN_GROUP_ID` → ADMIN |
| (default) | STAFF |

## 4. Environment variables

```env
INTEGRATION_PROFILE=pilot-entra
ENTRA_TENANT_ID=<tenant-guid>
ENTRA_CLIENT_ID=<app-client-id>
ENTRA_CLIENT_SECRET=          # optional for public SPA; required for confidential web app
ENTRA_REDIRECT_URI=https://staging.pulsepointams.com/api/auth/entra/callback
ENTRA_SESSION_SECRET=<32+ random chars>
ENTRA_DEFAULT_ORG_SLUG=demo-healthcare
ENTRA_OWNER_GROUP_ID=
ENTRA_ADMIN_GROUP_ID=
```

## 5. First login behavior

1. User completes Entra OAuth at `/api/auth/entra/login`
2. Callback provisions `User` id `entra_<oid>` and `OrgMembership` on `ENTRA_DEFAULT_ORG_SLUG`
3. Signed `pp_entra_session` cookie — 8h TTL

## 6. Pilot checklist

- [ ] Staging redirect URI registered
- [ ] 3–5 users in security group
- [ ] `pnpm demo:setup` run so default org exists
- [ ] Logout tested via `/api/auth/entra/logout`
- [ ] Demo mode disabled on staging (`DEMO_MODE` unset)

## 7. Fallback

Local demos: keep `INTEGRATION_PROFILE=demo` + `DEMO_MODE=true` — no Entra required.

See also: `docs/ENTERPRISE-INTEGRATION.md` (hap-azure path).
