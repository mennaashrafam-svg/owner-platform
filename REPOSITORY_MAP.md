# Repository Map

## Purpose

This is the live `owner-platform` frontend repository (static HTML/CSS/JS), paired with the
separate `my-server` backend repo (Express + PostgreSQL). This map describes the actual current
structure — not a packaged handover snapshot.

## Structure

```text
owner-platform/
|-- index.html, login.html, register.html, forgot-password.html, reset-password.html
|-- employees.html, settings-connect.html
|-- config.js
|-- styles.css
|-- app.js
|-- app.bundle.js
|-- README.md
|-- OWNER_PLATFORM_MASTER_HANDOVER.md
|-- OWNER_PLATFORM_BUSINESS_GUIDE.md
|-- REPOSITORY_MAP.md
|-- DEPENDENCIES.md
|-- .github/workflows/ci.yml
|-- analysis/
|   |-- metrics.js
|   |-- fileParser.js
|   |-- fileReader.js
|   |-- reports.js (orphaned/unused — candidate for deletion)
|   |-- alerts.js
|   `-- agentDetection.js
|-- data/
|   |-- mockData.js
|   |-- models.js
|   |-- dataService.js
|   |-- agents.js
|   |-- searchData.js
|   `-- settingsData.js
|-- i18n/
|   `-- translations.js
|-- integrations/
|   |-- baseAdapter.js
|   |-- index.js
|   |-- revenueAdapters.js
|   |-- facebookAdapter.js
|   |-- instagramAdapter.js
|   |-- tiktokAdapter.js
|   |-- googleAdapter.js
|   |-- whatsappAdapter.js
|   `-- snapchatAdapter.js
|-- privacy/
|   `-- privacy.js
|-- scripts/
|   |-- build-bundle.mjs
|   `-- validate-file-parser.mjs
|-- search/
|   `-- search.js
|-- settings/
|   `-- settingsState.js
`-- ui/
    `-- components.js
```

## Root Files

| File | Purpose |
|---|---|
| `index.html` | Browser application shell, views, controls, modal containers, and runtime bundle reference. |
| `login.html`, `register.html`, `forgot-password.html`, `reset-password.html` | Real auth pages, calling `my-server`'s `/api/register`, `/api/login`, etc. |
| `employees.html` | Team member management page. |
| `settings-connect.html` | Where a business connects its own platform accounts — manual token form for WhatsApp/Instagram/Facebook, plus a "Connect via Facebook" (WhatsApp Embedded Signup) button. |
| `config.js` | Single source of truth for the backend API base URL and the Meta App ID, loaded by every page above. |
| `styles.css` | Entire visual system, themes, RTL styling, responsive layout, and numeric contrast rules. |
| `app.js` | Main source orchestration: state, rendering, events, filtering, navigation, settings, drill-downs, and real-data fetch/merge from the backend. |
| `app.bundle.js` | Generated standalone browser bundle loaded by `index.html`. Do not edit directly — a pre-commit hook and CI both rebuild it from `app.js` and will flag drift. |
| `README.md` | Concise project introduction and developer notes. |
| `OWNER_PLATFORM_MASTER_HANDOVER.md` | Full technical and product handover, kept current with each round of changes. |
| `OWNER_PLATFORM_BUSINESS_GUIDE.md` | Non-technical product and business guide. |
| `.github/workflows/ci.yml` | Rebuilds `app.bundle.js` from source and diffs it against the committed version on every push/PR. |

## Major Folders

### `analysis/`

Domain and analysis logic.

- `metrics.js`: live dashboard outcome thresholds, aggregation, revenue totals, Business Health, platform performance, and employee performance.
- `fileParser.js`: isolated Analyze File parser, explicit classification, revenue extraction, objection detection, CSV parsing, and evidence preservation.
- `fileReader.js`: DecompressionStream-based extraction for uploaded PDF/DOCX/ZIP files.
- `reports.js`: **orphaned** — its only former consumer (mock data) was removed; nothing currently imports it. Candidate for deletion.
- `alerts.js`: deterministic owner-level alert generation from visible live rows.
- `agentDetection.js`: employee alias and hashtag detection.

### `data/`

Current data sources and model descriptions.

- `mockData.js`: complete live MVP mock data and separate Conversation Analysis examples.
- `models.js`: descriptive canonical internal model names and expected fields.
- `agents.js`: employee profiles, aliases, and tags.
- `searchData.js`: shared search concept terms.
- `settingsData.js`: static business, connection, alert, and privacy settings.

### `search/`

- `search.js`: Arabic/English normalization, corpus construction, employee alias expansion, filtering, and snippets.

### `settings/`

- `settingsState.js`: initial application state factory.

### `privacy/`

- `privacy.js`: customer name/phone masking and in-memory reveal audit logging.

### `ui/`

- `components.js`: small reusable HTML string helpers for cards, fields, badges, and settings sections.

### `integrations/`

Placeholder integration boundaries for platforms this repo doesn't actually talk to yet — the
real WhatsApp integration lives entirely in `my-server` (webhook + Graph API calls), not here.

- Platform adapters currently return raw records unchanged; none are wired to anything.
- `revenueAdapters.js` defines future confirmed-revenue sources and a normalized revenue shape.
- No real APIs are connected from this repo — WhatsApp's real connection is backend-side only.

### `i18n/`

- `translations.js`: all English and Arabic UI translations.

### `scripts/`

- `build-bundle.mjs`: creates `app.bundle.js` from modular source.
- `validate-file-parser.mjs`: automated Analyze File parser fixtures.

## Module Relationships

```text
data/mockData.js
    -> analysis/metrics.js
    -> analysis/alerts.js
    -> search/search.js
    -> app.js
    -> ui/components.js
    -> index.html / styles.css

Uploaded file
    -> analysis/fileParser.js
    -> app.js Analyze File renderers
    -> evidence modal

Raw future integration
    -> integrations/*Adapter.js
    -> unified internal model
    -> analysis/search/UI

Real WhatsApp/Instagram message (Meta webhook)
    -> my-server (Express, separate repo) -> PostgreSQL
    -> GET /api/conversations
    -> app.js mergeRealConversationsIntoDashboard
    -> same dashboard/metrics engine as mock data
```

## Important Architecture Boundaries

- Live dashboard classification and Analyze File classification are currently separate systems.
- Uploaded test files never enter live dashboard data.
- `app.bundle.js` is generated output; source changes belong in modular files.
- Most UI state (language, theme, most Settings toggles) is in memory and resets on reload.
  Team members and platform connections persist in the backend database.
- There is a real backend, database, and authentication layer (a separate repository,
  `my-server`: Express + PostgreSQL, deployed on Railway), with a signature-verified Meta webhook
  supporting WhatsApp and Instagram. **WhatsApp's real connection is currently disconnected**
  (deliberately, mid-experiment with WhatsApp's "Coexistence" feature — see
  `OWNER_PLATFORM_MASTER_HANDOVER.md` for why and current status) after previously working
  end-to-end (real receive + reply) with a live number. Instagram's webhook code exists but has
  never been tested against a real connected account. Facebook, TikTok, Google, and Snapchat
  remain placeholder integrations with no real account connected yet.

