# Engineer Setup Guide

## Requirements

- A modern browser.
- Node.js 18 or newer for validation and bundle generation.
- A local static HTTP server.
- No npm installation or third-party package installation is required.

## Dependencies

The project has no package manager manifest and no runtime framework dependency. It uses browser-native HTML, CSS, and JavaScript.

## First Run

From the release directory:

```sh
cd OWNER_PLATFORM_STABLE_RELEASE
python3 -m http.server 4173
```

Open:

```text
http://127.0.0.1:4173/index.html
```

Do not rely on directly opening `index.html` with `file://`; use a local HTTP server for consistent behavior.

## Validate the Parser

```sh
node scripts/validate-file-parser.mjs
```

Expected result: JSON output for baseline, taxonomy, and real-world fixtures, followed by exit code `0`.

## Validate JavaScript Syntax

```sh
node --check app.js
node --check app.bundle.js
node --check analysis/fileParser.js
node --check analysis/metrics.js
```

## Build the Browser Bundle

After changing any modular JavaScript source:

```sh
node scripts/build-bundle.mjs
```

This overwrites `app.bundle.js`. Never manually edit `app.bundle.js`.

After building, reload the local browser page and repeat validation.

## Development Workflow

1. Read `ENGINEER_HANDOVER.md`, `PROJECT_STATUS.md`, and `BUSINESS_LOGIC.md`.
2. Identify whether a change affects live dashboard logic or Analyze File logic.
3. Edit the smallest appropriate source module.
4. Preserve English/Arabic values and RTL behavior.
5. Preserve date and selected-context filtering.
6. Add or update validation coverage.
7. Run parser tests and syntax checks.
8. Rebuild `app.bundle.js`.
9. Run the app through a local server.
10. Verify dashboard, search, drill-down, reports, themes, and Arabic mode.

## Common Tasks

### Change live mock data

Edit:

```text
data/mockData.js
```

### Change live KPI calculations

Edit:

```text
analysis/metrics.js
```

### Change uploaded-file parsing or classification

Edit:

```text
analysis/fileParser.js
scripts/validate-file-parser.mjs
```

### Change search behavior

Edit:

```text
search/search.js
data/searchData.js
```

### Change translations

Edit:

```text
i18n/translations.js
```

### Change visuals

Edit:

```text
styles.css
index.html
ui/components.js
```

Do not mix visual changes with business-logic changes.

## Troubleshooting

### Page loads without interactions

- Confirm `app.bundle.js` exists.
- Confirm `index.html` references `app.bundle.js`.
- Run `node scripts/build-bundle.mjs`.
- Check browser console errors.

### Source changes do not appear

- Rebuild `app.bundle.js`.
- Reload the browser.
- Confirm the local server is serving the release directory.

### Parser validation fails

- Compare expected and actual JSON output.
- Check explicit result priority before inferred keywords.
- Verify only Confirmed outcomes contribute to revenue.
- Verify Info Only, Objection Only, and Cancelled remain separate.

### Search misses Arabic results

- Review normalization in `search/search.js`.
- Confirm Arabic and English text both exist in the search corpus.
- Confirm employee aliases and tags exist in `data/agents.js`.

### Metrics disagree

- Determine whether the view uses the live score-derived engine or Analyze File's explicit engine.
- Confirm the active date range.
- Confirm the selected report context.
- Review known issues in `PROJECT_STATUS.md`.

### Settings reset

This is expected in the current MVP. State is in memory and is not persisted.

