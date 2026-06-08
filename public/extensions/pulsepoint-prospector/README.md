# PulsePoint Prospector (browser extension)

Nimble Prospector-style sidebar for PulsePoint AMS.

## Install (Chrome / Edge)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. **Load unpacked** → select this folder (`public/extensions/pulsepoint-prospector` in the repo).
4. In the extension popup, set:
   - **API base:** `http://localhost:3000` (or your deployed URL)
   - **Org ID** and **Capture token** from CRM → Prospector → Generate capture token
   - **Org slug:** e.g. `demo-healthcare`

## Features

- **Enrich this page** — calls `POST /api/crm/prospect/enrich`
- **Open panel** — full Prospector UI in a tab
- **Lookup** — matches email to existing members

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/crm/prospect/enrich` | Firmographics + ICP |
| GET | `/api/crm/prospect/lookup?email=` | CRM match |
| GET | `/api/crm/prospect/context?memberId=` | 360° context |
| POST | `/api/crm/prospect/note` | Quick note |
| POST | `/api/crm/prospect/stay-in-touch` | Follow-up reminder |
| POST | `/api/crm/capture` | Create/update contact |

Headers: `X-PulsePoint-Org-Id`, `X-PulsePoint-Capture-Token`
