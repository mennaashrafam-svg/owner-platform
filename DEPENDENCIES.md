# Dependencies

## Backend

This document covers the frontend repository only. The frontend now talks to a real backend
(a separate repository, `my-server`: Express + PostgreSQL, deployed on Railway) for
authentication, team management, platform connections, and real WhatsApp/Instagram
conversation data. See that repository's own `README.md` and `MIGRATIONS.md` for its
dependencies (Express, pg, jsonwebtoken, bcryptjs, cors, dotenv, node-pg-migrate).

The frontend itself remains dependency-free, as described below.

## Runtime Frameworks

None.

The application uses:

- HTML5.
- CSS3.
- Browser-native JavaScript.
- Browser DOM APIs.
- Browser `File.text()` API.

## External Libraries

One: the **Facebook JavaScript SDK** (`https://connect.facebook.net/en_US/sdk.js`), loaded only
by `settings-connect.html` to power the "Connect via Facebook" (WhatsApp Embedded Signup) button.
Loaded directly via `<script>` tag, not npm — no build step involved.

Otherwise: no `package.json`, npm dependency, frontend framework, charting library, or backend
framework.

## Build Requirements

| Requirement | Version |
|---|---|
| Node.js | 18 or newer recommended |
| Browser | Current Chrome, Edge, Safari, or Firefox |
| Static HTTP server | Any; Python 3 server is sufficient |

## Optional Local Server

Python 3:

```sh
python3 -m http.server 4173
```

## Internal Build Script

```sh
node scripts/build-bundle.mjs
```

The script uses Node built-in modules:

- `node:fs`
- `node:path`

## Internal Validation Script

```sh
node scripts/validate-file-parser.mjs
```

It imports the local Analyze File parser and has no external dependencies.

## Fonts

CSS declares:

- Montserrat for English.
- Helvetica Neue LT Arabic for Arabic.

Font files are not bundled. Rendering depends on fonts available in the host environment and browser fallback behavior.

## External Service Requirements

- The backend (`my-server`) is a required external service now, not optional. The frontend
  reads its URL from `config.js` (`window.OWNER_PLATFORM_API_BASE_URL`).
- WhatsApp and Instagram connect through a real, signature-verified Meta webhook (handled by
  the backend). WhatsApp is currently disconnected (deliberately, mid-experiment with Meta's
  "Coexistence" feature) after previously working end-to-end; Instagram's webhook code exists
  but has never been tested against a real connected account.
- Resend is used by the backend for password-reset emails.

The following are still planned but not connected:

- Facebook, TikTok, Google, Snapchat (as real messaging integrations — placeholder connection
  cards only).
- CRM systems.
- Invoice systems.
- Accounting systems.
- Payment WhatsApp groups.

## Persistence Requirements

Team members and platform connection credentials persist in the backend's PostgreSQL
database. Most other frontend state (language, theme, most Settings toggles) is still
in-memory only and resets on reload.

