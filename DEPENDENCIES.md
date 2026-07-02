# Dependencies

## Runtime Frameworks

None.

The application uses:

- HTML5.
- CSS3.
- Browser-native JavaScript.
- Browser DOM APIs.
- Browser `File.text()` API.

## External Libraries

None.

There is no `package.json`, npm dependency, CDN script, frontend framework, charting library, or backend framework.

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

None for the current MVP.

The following are planned but not connected:

- Facebook.
- Instagram.
- TikTok.
- Google.
- WhatsApp.
- Snapchat.
- CRM systems.
- Invoice systems.
- Accounting systems.
- Payment WhatsApp groups.

## Persistence Requirements

None currently. All state is in memory and resets on reload.

