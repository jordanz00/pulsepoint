# EasyDNN CMS integration

**Adapter:** `lib/adapters/cms/`  
**Orchestration:** `lib/integrations/easydnn-publish.ts`

PulsePoint targets associations running **DotNetNuke / EasyDNN** public websites. Integration is **HTML module export** — no live API push in v1 (IT-safe, works behind association firewalls).

## Capabilities

| Module | Source | Export |
|--------|--------|--------|
| Event microsite | EventCore (speakers, sponsors, agenda) | Per-event HTML on event detail page |
| Member directory | MemberCore active members | Enterprise → Integrations → Export directory HTML |
| Site config | Org settings | `IntegrationConnection` vendor `EASYDNN` |

## Workflow

1. **Configure site** — `/[orgSlug]/enterprise/integrations` → EasyDNN panel → save `https://` site URL + page paths
2. **Export event** — Event admin → EasyDNN panel → Generate module → copy HTML into DNN HTML Pro module
3. **Export directory** — Integrations → Export member directory HTML → paste on DNN member page
4. **Registration** — CTA links to PulsePoint public event URL (Stripe / capacity handled in AMS)

## Architecture

```
Server actions (event-advanced, integrations)
  → lib/integrations/easydnn-publish.ts
    → lib/adapters/cms/easydnn-html.ts
    → lib/adapters/cms/easydnn-store.ts
```

## Data model

- `IntegrationVendor.EASYDNN` on `IntegrationConnection`
- `Event.websiteExportConfig` — last export manifest per event

## Roadmap

- EasyDNN REST / scheduled publish (when IT provides API keys)
- Advocacy HTML modules from `AdvocacyCampaign`
- Auto-refresh directory on member import apply
