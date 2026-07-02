# Repository Map

## Release Purpose

`OWNER_PLATFORM_STABLE_RELEASE` is a clean engineer handover copy of the verified Owner Platform MVP. It contains the complete runtime, modular source, validation scripts, and current project documentation. Historical screenshots, preview images, OS metadata, and legacy archives are intentionally excluded.

## Structure

```text
OWNER_PLATFORM_STABLE_RELEASE/
|-- index.html
|-- styles.css
|-- app.js
|-- app.bundle.js
|-- README.md
|-- OWNER_PLATFORM_MASTER_HANDOVER.md
|-- OWNER_PLATFORM_BUSINESS_GUIDE.md
|-- REPOSITORY_MAP.md
|-- ENGINEER_SETUP_GUIDE.md
|-- PROJECT_STATUS.md
|-- FEATURE_INVENTORY.md
|-- BUSINESS_LOGIC.md
|-- DEPENDENCIES.md
|-- ENGINEER_HANDOVER.md
|-- STABLE_RELEASE_SUMMARY.md
|-- FINAL_VALIDATION_REPORT.md
|-- analysis/
|   |-- metrics.js
|   |-- fileParser.js
|   |-- reports.js
|   |-- alerts.js
|   `-- agentDetection.js
|-- data/
|   |-- mockData.js
|   |-- models.js
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
| `styles.css` | Entire visual system, themes, RTL styling, responsive layout, and numeric contrast rules. |
| `app.js` | Main source orchestration: state, rendering, events, filtering, navigation, settings, and drill-downs. |
| `app.bundle.js` | Generated standalone browser bundle loaded by `index.html`. Do not edit directly. |
| `README.md` | Original concise project introduction and developer notes. |
| `OWNER_PLATFORM_MASTER_HANDOVER.md` | Full technical and product handover from the audited source state. |
| `OWNER_PLATFORM_BUSINESS_GUIDE.md` | Non-technical product and business guide. |

## Major Folders

### `analysis/`

Domain and analysis logic.

- `metrics.js`: live dashboard outcome thresholds, aggregation, revenue totals, Business Health, platform performance, and employee performance.
- `fileParser.js`: isolated Analyze File parser, explicit classification, revenue extraction, objection detection, CSV parsing, and evidence preservation.
- `reports.js`: report object constructor and small report helpers.
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

Future integration boundaries.

- Platform adapters currently return raw records unchanged.
- `revenueAdapters.js` defines future confirmed-revenue sources and a normalized revenue shape.
- No real APIs are connected.

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
```

## Important Architecture Boundaries

- Live dashboard classification and Analyze File classification are currently separate systems.
- Uploaded test files never enter live dashboard data.
- `app.bundle.js` is generated output; source changes belong in modular files.
- Application state is in memory and resets on reload.
- There is no backend, database, authentication, or real integration.

