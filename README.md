# Owner Platform by Smart INV

A lean static MVP for an AI-powered business conversation intelligence dashboard.

## Structure

- `index.html` - app shell for dashboard, conversation analysis, settings, and drill-down modal.
- `styles.css` - visual system and responsive layout only. Business logic should not live here.
- `app.js` - UI orchestration: view switching, event handlers, rendering flow, and calls into domain modules.
- `i18n/translations.js` - bilingual English/Arabic copy.
- `data/` - internal mock data and models: conversations, bookings, platforms, agents, search terms, alerts/settings data.
- `analysis/` - AI/reporting domain logic: scoring, booking/missed detection, agent detection, platform/agent performance, alert building.
- `analysis/fileParser.js` - full-file validation parser for TXT/CSV conversation exports used by Analyze File.
- `search/` - language-independent search, Arabic normalization, snippets, and context-preserving result helpers.
- `settings/` - isolated app/settings state such as language, theme, date range, and drill-down state.
- `ui/` - small reusable HTML component helpers for cards, fields, badges, settings sections, and stats.
- `integrations/` - placeholder platform adapters for WhatsApp, Instagram, Facebook, TikTok, Google, and Snapchat.

## Run

Open `index.html` through a local static server. No build step or package install is required.

Validate the Analyze File parser with:

```sh
node scripts/validate-file-parser.mjs
```

## MVP Scope

- Dashboard homepage
- Conversation analysis page
- Arabic and English language switching
- Every KPI opens layered intelligence: platform, source, campaign/content, booking, and conversation report
- Global date range filter for dashboard intelligence
- Google and Snapchat lead intelligence structures
- Right-side platform intelligence navigation
- AI conversation scoring
- Booking attempt detection
- Missed opportunity detection
- AI summaries and recommendations

## Developer Notes

- Add or update mock platform data in `data/mockData.js`; keep platform-specific API shapes out of the UI.
- Add future raw API normalization in `integrations/*Adapter.js`, then convert into the unified internal models described in `data/models.js`.
- Change scoring, missed-opportunity, agent detection, or alert logic inside `analysis/`.
- Change Arabic/English search behavior inside `search/`; UI code should call search helpers instead of rebuilding haystacks.
- Change settings defaults/state in `data/settingsData.js` and `settings/settingsState.js`.
- Future visual redesigns should touch `styles.css`, `index.html`, and `ui/` helpers without changing data, search, analysis, or integrations.
- Use Analyze File as the isolated validation environment before connecting live platform adapters. Its parsed evidence never enters live dashboard data.
