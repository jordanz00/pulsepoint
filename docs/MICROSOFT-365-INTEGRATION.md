# Microsoft 365 integration

**Adapter:** `lib/adapters/microsoft365/`  
**Orchestration:** `lib/integrations/microsoft365-sync.ts`

## Capabilities (pilot v1)

| Surface | Graph scope | UI |
|---------|-------------|-----|
| Mail inbox | `Mail.Read` | Enterprise → Integrations → Inbox tab |
| Calendar | `Calendars.Read` | Calendar tab |
| Contacts | `Contacts.Read` | Contacts tab |
| Staff SSO | Entra PKCE | `INTEGRATION_PROFILE=pilot-entra` |

Send mail / create events: **roadmap** (requires separate compliance review).

## Architecture

```
API routes (/api/integrations/microsoft/*)
  → lib/integrations/microsoft365-sync.ts
    → lib/adapters/microsoft365/index.ts
      → capabilities/mail|calendar|contacts.ts
      → connection-store.ts (IntegrationConnection MICROSOFT_365)
```

Application code must **not** call `graph.microsoft.com` directly — use the adapter.

## Configuration

See `.env.local.example` and `docs/ENTRA-PILOT-SETUP.md`.

## Sync

`POST /api/integrations/microsoft/sync` with `{ orgSlug }` runs parallel mail + calendar + contacts fetch and persists on `IntegrationConnection.config`.

## Swap path

Primary: Microsoft Graph delegated permissions.  
Fallback: CSV export of contacts; manual calendar.  
Enterprise: SharePoint / Teams webhooks (planned).
