# Owner Platform by Smart INV

A business conversation intelligence dashboard: real customer conversations (currently WhatsApp,
via a Meta webhook) flow into a scored dashboard, and the owner can reply from inside the platform.
Static HTML/CSS/JS frontend, backed by a real Express/PostgreSQL API in
[`my-server`](https://github.com/mennaashrafam-svg/my-server).

For the full functional picture, read [OWNER_PLATFORM_BUSINESS_GUIDE.md](./OWNER_PLATFORM_BUSINESS_GUIDE.md)
(what it does, for whom) and [OWNER_PLATFORM_MASTER_HANDOVER.md](./OWNER_PLATFORM_MASTER_HANDOVER.md)
(architecture, current gaps, roadmap).

## Structure

- `index.html`, `login.html`, `register.html`, `forgot-password.html`, `reset-password.html`,
  `employees.html`, `settings-connect.html` — the app's pages. `config.js` is the single source of
  truth for the backend API URL and Meta App ID, loaded by all of them.
- `app.js` — UI orchestration: view switching, event handlers, rendering, and real-data fetch/merge
  (`loadRealConversations`, `mergeRealConversationsIntoDashboard`) into the same rendering engine
  mock data used. `app.bundle.js` is generated from it — **never edit the bundle directly** (a
  pre-commit hook and CI both rebuild it from source and will catch a hand-edited bundle).
- `styles.css` — visual system and layout only.
- `i18n/translations.js` — bilingual English/Arabic copy.
- `data/` — mock data/models (`mockData.js`, `models.js`) plus real app state helpers
  (`dataService.js`, `agents.js`, `searchData.js`, `settingsData.js`).
- `analysis/` — scoring, booking/missed detection, agent detection, alert building, and the
  Analyze File parser (`fileParser.js`, `fileReader.js`). `reports.js` is currently unreferenced
  dead code (orphaned after mock data was removed) — a candidate for deletion.
- `search/` — bilingual search and Arabic normalization.
- `settings/` — app state (language, theme, date range, drill-down state).
- `ui/` — reusable HTML component helpers, including `escapeHtml` (used everywhere untrusted text,
  like real customer messages, gets rendered).
- `integrations/*Adapter.js` — placeholder adapters for Facebook/Instagram/TikTok/Google/Snapchat.
  Not connected to anything yet; only WhatsApp has a real end-to-end integration, and that lives in
  `my-server`'s webhook, not here.
- `scripts/build-bundle.mjs` — the custom bundler that produces `app.bundle.js`.
  `scripts/validate-file-parser.mjs` — fixture validation for the Analyze File parser.

## Run

Open `index.html` through a local static server (not `file://` — real API calls and Facebook's
JS SDK require a real HTTP(S) origin). Set `window.OWNER_PLATFORM_API_BASE_URL` in `config.js` to
point at a running `my-server` instance.

Rebuild the bundle after changing `app.js` or anything it imports:

```sh
node scripts/build-bundle.mjs
```

Validate the Analyze File parser:

```sh
node scripts/validate-file-parser.mjs
```

## Current status (high level)

- Real auth, real conversations, real WhatsApp webhook, and a reply-from-platform feature exist
  and have been tested against a real phone number.
- WhatsApp is not connected as of this writing (deliberately disconnected mid-experiment — see
  `OWNER_PLATFORM_MASTER_HANDOVER.md` and the project's session memory for why and what's next).
- Facebook/Instagram/TikTok/Google/Snapchat are not connected yet.
- No per-employee login/access control yet — single owner account per business.
