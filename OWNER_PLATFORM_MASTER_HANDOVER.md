# Owner Platform by Smart INV

# Master Technical Handover

Document status: Current repository handover  
Repository state reviewed: July 10, 2026  
Project stage: Early production system (real auth, backend, and a proven-working live WhatsApp integration — currently disconnected mid-experiment, see below) with some analytics still prototype-level  
Production readiness: Not fully production-ready — see "Still Not Started" further down for the concrete remaining gaps

**Current WhatsApp status (important):** the platform's real WhatsApp connection was fully built,
verified, and confirmed working end-to-end (a real customer message was received and a real
reply was sent successfully) on 2026-07-10. It was then **deliberately disconnected** to attempt
Meta's "Coexistence" feature (using the WhatsApp Business app and the platform simultaneously on
the same number, per a client requirement that the number not be exclusively locked to the API).
That attempt hit an unresolved WhatsApp-app registration error and was abandoned for now — **no
WhatsApp number is currently connected.** Everything needed to reconnect the old way (pure Cloud
API, app-free) is documented and known-working; Coexistence needs more uninterrupted time to
debug properly. See the project's session memory / `reference-whatsapp-business-onboarding` notes
for the full troubleshooting log if picking this back up.

## Executive Summary

Owner Platform by Smart INV is a bilingual business conversation intelligence platform designed to help business owners understand the commercial truth behind customer conversations.

The platform organizes conversation-derived business information into an evidence-first investigation journey:

`Number -> Platform -> Source -> Campaign or Content -> Employee -> Conversation -> Platform Analysis -> Full Conversation`

The frontend is a static browser application (HTML, CSS, modular JavaScript). It is backed by
a real Express + PostgreSQL server (`my-server`, a separate repository, deployed on Railway)
providing owner-account authentication, persistent team/platform-connection storage, and a
real, signature-verified Meta webhook that ingests WhatsApp and Instagram conversations. Live
dashboard data now starts empty for a new account and fills in from that real webhook data
instead of demonstration content. A separate rule-based parser still handles uploaded
Analyze File conversation test files. Facebook, TikTok, Google, Snapchat, payment systems, and
external AI/ML analysis services are not connected.

The product demonstrates the intended product experience, bilingual interface, drill-down architecture, search behavior, Analyze File validation workflow, employee intelligence, risk investigation, settings, and privacy concepts, now running against real conversation data where available.

Current maturity level:

- Product concept and interaction model: Advanced.
- Frontend usability and visual design: Functional.
- Evidence drill-down: Implemented for most core journeys, working against real conversation data.
- File parser validation: Implemented with automated fixtures.
- Live analytics accuracy: Business-outcome classification (booking/CNC/missed) is still score-derived rather than evidence-explicit; employee attribution and revenue extraction for real conversations are not implemented yet (deliberately deferred pending real usage data).
- Integrations and persistence: WhatsApp has a real, proven-working integration (webhook receive + in-platform reply), but is currently disconnected (see above). Instagram's webhook code exists but has never been tested against a real connected account. Facebook/TikTok/Google/Snapchat remain architectural placeholders — TikTok specifically is blocked on the business having no official registration document (tax card, commercial registry, etc.) to satisfy TikTok's required "Company certification"; Snapchat requires direct outreach to Snap for API access, not yet started. Team members and platform connections persist in Postgres, and that schema already supports true multi-tenancy (each connection is scoped by `user_id`, and the webhook resolves the right owner from the incoming account ID) — what's missing is a smooth self-serve "client connects their own account" UX for anything beyond WhatsApp's Embedded Signup (which itself is built and verified working, but blocked on Meta Business Verification before it can onboard a real external client).
- Security and privacy enforcement: Real password hashing, signed sessions, webhook signature verification, and Postgres-backed rate limiting exist. Two separate XSS gaps in real-customer-data rendering (Bookings view and Conversation Analysis view) have been found and fixed. Customer-data masking/reveal-logging, encryption at rest, and per-employee access control are still demonstration-only or not started. The owner can now permanently delete a conversation from the dashboard (`DELETE /api/conversations/:id`); there is still no automated/scheduled data-retention policy.
- Production operations: Automated tests (48, backend), CI (both repos), structured logging, a `/health` endpoint, and versioned database migrations are in place. No production monitoring/alerting service, no browser/e2e test suite, and no formal compliance audit yet.

## Project Vision

### Long-Term Vision

Owner Platform should become an owner-focused operating intelligence layer that explains what is happening across customer conversations, revenue journeys, employees, campaigns, and platforms.

The long-term product should connect to real business communication and revenue systems, normalize their data, analyze every relevant conversation, and let the owner verify every conclusion against source evidence.

### Business Objectives

- Help owners understand outcomes before activity.
- Show where bookings, revenue, risks, and lost opportunities originate.
- Make employee performance explainable through real conversations.
- Detect conversations that were not properly closed.
- Identify repeated objections, weak sources, and revenue leakage.
- Reduce dependence on manually reviewing thousands of messages.
- Preserve owner control over sensitive customer data.

### Platform Positioning

Owner Platform is positioned as an interactive business intelligence platform, not a traditional CRM and not a generic chatbot interface.

Its value is not simply counting conversations. Its value is connecting business outcomes to the conversations, sources, campaigns, and employees that produced them.

## Business Problem

Business owners often receive leads through many disconnected channels. They can see message volume, advertising spend, or bookings, but they cannot easily answer:

- Which conversations produced bookings?
- Which platform or campaign generated valuable customers?
- Which employee handled each opportunity?
- Why were interested leads lost?
- Which conversations ended without a clear next step?
- Which objections repeat most often?
- Which reported metrics can be trusted?

Traditional dashboards frequently show totals without evidence. Traditional CRMs frequently require owners to study records rather than understand the business quickly.

Owner Platform exists to turn fragmented conversation activity into traceable business stories.

## Platform Philosophy

### Owner First

The interface prioritizes decisions and outcomes that matter to the business owner. Bookings, missed opportunities, risks, employee outcomes, and revenue context are more important than raw activity volume.

### Privacy First

Customer data belongs to the business owner. Sensitive information should be masked by default, revealed only when permitted, and every reveal should be auditable.

The current repository demonstrates masking and reveal logging in memory. It does not yet provide production-grade access control or secure storage.

### Simplicity First

The owner should understand business status quickly and investigate only when needed. The platform uses a calm dashboard, contextual modal drill-downs, and avoids complex tables.

### Evidence First

Every important number should lead to the conversations and reasoning behind it. The target journey is:

`Number -> Evidence -> Conversation -> Truth`

This principle is strongly represented in the UI, but some live dashboard metrics still rely on prototype score-derived logic rather than explicit outcome evidence.

## Core Principles

- No KPI without evidence.
- Every metric must be traceable.
- Source truth before conclusions.
- Privacy over convenience.
- Business decisions before vanity metrics.
- Outcomes before activity.
- Filtered contexts must not display unrelated global totals.
- Uploaded test data must remain separate from live platform data.

## Architecture Overview

### Current Architecture

This repository (the frontend) is a dependency-free static web application. It is no longer
the whole system: a separate repository, `my-server` (Express + PostgreSQL, deployed on
Railway), provides a real backend — authentication, team/platform-connection persistence, and
a signature-verified Meta webhook for WhatsApp/Instagram. The frontend reads the backend's URL
from `config.js`.

- `index.html` provides the application shell and primary views.
- `styles.css` contains the complete visual system, themes, responsive rules, and typography.
- `app.js` orchestrates state, rendering, navigation, interactions, filters, and drill-downs.
- Feature logic is separated into data, analysis, search, privacy, settings, UI helper, integration, and translation modules.
- `app.bundle.js` is a generated browser bundle for environments that do not load JavaScript modules directly, rebuilt from source on every commit (via a local pre-commit hook and enforced again in CI).
- Auth pages (`login.html`, `register.html`, etc.), `employees.html`, and `settings-connect.html` call the real backend directly.

This repository itself has no package manager manifest, build framework, or server process —
those live in `my-server`, which has its own dependencies, tests, CI, and migrations (see its
`README.md` and `MIGRATIONS.md`).

### Major Modules

- Data layer: `data/mockData.js` now holds only empty platform shells (Instagram/TikTok/WhatsApp/Facebook with no sources) plus shared date/model helpers — demonstration bookings, reports, and clinic-specific content have been removed. The dashboard starts empty and is populated by real conversation data instead.
- Analysis layer: live dashboard metrics, score-derived outcomes, employee/platform performance, alerts, agent detection, and uploaded-file parsing (including real PDF/DOCX/ZIP text extraction via the browser's `DecompressionStream`).
- Search layer: bilingual normalization, alias expansion, corpus construction, result filtering, and matched snippets.
- UI orchestration: view rendering, modal drill-down state, event delegation, date filtering, language/theme switching, and settings interactions.
- Privacy layer: masking helpers and an in-memory sensitive reveal audit log.
- Integration layer: placeholder adapters for Facebook/TikTok/Google/Snapchat revenue integrations. WhatsApp/Instagram are real via the backend webhook, not through these adapters.

### Current Data Flow

Real conversation flow (WhatsApp/Instagram):

`Meta webhook -> my-server (Express) -> PostgreSQL -> GET /api/conversations -> app.js mergeRealConversationsIntoDashboard -> same dashboard/metrics engine as demo data`

Live dashboard flow (still used for any remaining demo-shaped rendering paths):

`data/mockData.js (now empty shells) -> analysis/metrics.js and analysis/alerts.js -> app.js renderers -> UI drill-downs`

Search flow:

`Visible date-filtered booking rows -> search/search.js -> contextual results -> app.js drill-down state`

Analyze File flow:

`Uploaded text content -> analysis/fileParser.js -> isolated parsed conversations and summary -> evidence modal`

Future integration flow (Facebook/TikTok/Google/Snapchat):

`Raw platform payload -> integrations adapter -> unified internal model -> analysis modules -> UI`

The future integration flow is only architectural intent for those four platforms. Current adapters for them return raw payloads unchanged.

## Folder Structure

```text
/
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
|   |-- reports.js (orphaned, unused — candidate for deletion)
|   |-- alerts.js
|   `-- agentDetection.js
|-- data/
|   |-- mockData.js
|   |-- models.js
|   |-- dataService.js
|   |-- agents.js
|   |-- searchData.js
|   `-- settingsData.js
|-- search/
|   `-- search.js
|-- settings/
|   `-- settingsState.js
|-- privacy/
|   `-- privacy.js
|-- ui/
|   `-- components.js
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
|-- i18n/
|   `-- translations.js
`-- scripts/
    |-- build-bundle.mjs
    `-- validate-file-parser.mjs
```

Historical preview screenshots and OS metadata that used to sit at repository root have been
removed (a `.gitignore` now keeps `__MACOSX/`, `.DS_Store`, etc. out going forward).

### Important Files

#### `app.js`

The main UI orchestration module. It currently contains rendering functions, interaction handlers, modal drill-down state, date filtering, settings interactions, file analysis UI, search result rendering, employee views, platform views, and risk views.

#### `data/mockData.js`

The source of truth for the live MVP dashboard. It contains 29 structured platform conversation/booking rows across Facebook, Instagram, TikTok, Google, WhatsApp, and Snapchat, plus a separate four-conversation Conversation Analysis dataset.

#### `analysis/metrics.js`

Contains live dashboard outcome classification, KPI calculations, revenue totals, and performance calculations.

#### `analysis/fileParser.js`

Contains the independent Analyze File parser, explicit classification taxonomy, revenue extraction, objection detection, evidence preservation, TXT block splitting, and basic CSV parsing.

#### `search/search.js`

Contains language-independent search normalization, Arabic normalization, employee alias expansion, searchable corpus generation, matching, and snippets.

#### `scripts/validate-file-parser.mjs`

Automated parser validation for baseline, taxonomy, and real-world conversation structures.

## Current Features

### Implemented

- Executive dashboard and secondary analytics sections.
- English and Arabic UI with RTL support.
- Light, dark, and automatic theme modes.
- Global date range filter for live mock dashboard data.
- Universal bilingual search across live conversation rows.
- Arabic normalization and English/Arabic employee aliases.
- Platform intelligence navigation for Facebook, Instagram, TikTok, Google, WhatsApp, and Snapchat.
- Interactive KPI drill-down modal.
- Platform, source, content, employee, booking, and conversation investigation layers.
- Conversation report with Platform Analysis and Full Conversation tabs.
- Static responsible employee field inside a conversation report.
- Employee detection from configured aliases and tagged messages.
- Employee analytics cards and dedicated employee reports.
- Risk Center with CNC, revenue leakage, employee, response, objection, and platform risk categories.
- Owner-level platform alerts generated from visible live data.
- Analyze File test environment isolated from live dashboard data.
- Analyze File evidence drill-down for conversations, bookings, CNC, missed opportunities, pending, objections, estimated revenue, and recommendations.
- TXT conversation-block parsing and basic CSV parsing.
- Explicit uploaded-file outcomes including cancelled, objection-only, and info-only.
- Revenue extraction from explicit value fields, including values on following lines.
- Settings screens for business, team, connections, alerts, and privacy.
- Mock add, edit, and delete employee actions.
- Customer name and phone masking demonstrations.
- In-memory audit logging when masked example data is revealed.
- Generated standalone JavaScript bundle.
- Automated parser validation script.
- Real-time reply from the platform to a real WhatsApp conversation (verified end-to-end with a live number, currently disconnected — see the note at the top of this document).
- Owner-initiated permanent deletion of a real conversation from the dashboard.
- Self-serve WhatsApp account connection (Embedded Signup) for future clients, built and verified working up to Meta's Business Verification gate.

### Demonstration or Mock Behavior

- All live dashboard data is mock data.
- Platform connection status and sync counts are static.
- Employee settings changes live only for the current browser session.
- Alert and privacy toggles render but are not persisted and currently have no change handler.
- Ask Platform uses a small keyword-based response function.
- Alerts use deterministic mock rules rather than a live monitoring service.
- Message timestamps in conversation reports are generated from the booking time at two-minute intervals.
- Agent assignment overrides exist in state architecture but there is no current dedicated correction workflow.
- Privacy reveal logs exist only in memory.

## Dashboard Logic

### Live Dataset

The current live dashboard dataset contains:

- 29 total platform conversation rows.
- 14 score-classified confirmed bookings.
- 3 score-classified missed opportunities.
- 6 score-classified CNC conversations.
- 6 score-classified pending leads.
- AED 78,950 estimated revenue from rows classified as confirmed.
- Six platforms and nineteen platform source groups.

These are current mock-data results, not production business results.

### KPI Logic

The main KPI cards are:

- Confirmed Bookings
- Analyzed Conversations
- Missed Opportunities
- Average Response Quality
- Platform Recommendations
- Platform Performance
- Agent Performance
- Estimated Revenue

All KPI cards are clickable and open the drill-down modal.

Important current limitation: the live dataset stores each row in a `bookings` array and defaults its raw status to Confirmed, but the dashboard outcome is determined by score thresholds. This creates a mismatch between raw status wording and displayed outcomes.

### Live Outcome Thresholds

`analysis/metrics.js` currently classifies live rows as:

- Score 83 or higher: Confirmed
- Score 80 to 82: Pending
- Score 76 to 79: CNC
- Score 75 or lower: Missed Opportunity

These thresholds are prototype logic. They are not evidence-based booking detection and should be replaced before production.

### Business Health

Business Health uses the same weighted outcome performance calculation as employee and general performance:

- Booking rate: 35%
- Missed-opportunity control: 20%
- CNC control: 15%
- Average score: 20%
- Prototype response-speed score: 10%

The current full-range mock result is `72 / 100`.

The response-speed component is currently inferred from booking time-of-day, not measured response latency. Therefore Business Health should be treated as a demonstration score.

### Estimated Revenue

The live Estimated Revenue KPI sums `booking.revenue` only for rows whose score-derived outcome is Confirmed.

The displayed definition is:

> Calculated from detected booking values inside conversations. Not confirmed revenue.

### Recommendations

The recommendation card displays the recommendation attached to the highest-priority visible row. Priority order is missed, CNC, pending, then confirmed, with lower scores shown first within each outcome.

Opening the card uses the standard metric drill-down. The report total currently represents matching rows rather than a separately modeled recommendation count.

### Date Filtering

The top-level From and To inputs filter live platform booking rows by their `booking.date`.

The date filter affects:

- Dashboard KPIs
- Business Health
- Platform reports
- Employee reports
- Risk Center
- Alerts
- Search results
- KPI drill-downs
- The separate Conversation Analysis page, using its own mapped dates

Analyze File results remain isolated and are not affected by the live dashboard date range.

### Platform Filtering

The right platform sidebar opens a contextual platform report with outcome totals, most active employee, estimated revenue, and source breakdown.

Current limitation: platform reports initialize with the Confirmed Bookings metric. Platforms with no score-classified confirmed bookings can reach an empty source breakdown even when they contain other outcomes.

## Analyze File System

### Purpose

Analyze File is an isolated testing environment for validating conversation outcome logic before live platform integrations are built.

Uploaded analysis does not enter or alter the live dashboard dataset.

### File Ingestion

The current browser input advertises TXT, PDF, DOCX, CSV, email exports, and WhatsApp exports.

Actual implementation:

- Files are read using the browser `File.text()` API.
- Plain-text TXT and compatible text exports are supported.
- CSV has a basic parser.
- Binary PDF and DOCX extraction is not implemented.
- Email and WhatsApp exports work only when their uploaded content is readable plain text.

### Parsing

TXT-like content is split using:

- Conversation, chat, case, or lead markers with numeric IDs.
- Separator lines such as `---`, `===`, `***`, or `___`.
- Large blank-line boundaries as a fallback.
- A single block when no separator is detected.

CSV parsing:

- Requires a comma-separated header.
- Requires a conversation-related header such as conversation, message, transcript, outcome, status, classification, or Arabic equivalent.
- Converts each row into a text block before applying the same block parser.

### Classification

The parser checks explicit `Result`, `Status`, `Outcome`, or `Classification` fields first. If none exist, it scans the full normalized text for signals. If no explicit outcome is found:

- Appointment or follow-up language becomes Pending.
- Otherwise the fallback becomes CNC.

### Revenue Extraction

Confirmed uploaded-file conversations can contribute revenue.

The parser recognizes explicit fields such as:

- Booking Value
- Value
- Final Price
- Revenue
- Estimated Revenue
- Arabic equivalents

The numeric value may appear on the same line or the following line. Currency markers such as AED, Arabic dirham forms, or bare explicit field values are supported.

Only Confirmed outcomes contribute to `summary.revenue`.

Potential revenue can also be extracted for evidence in missed-opportunity reports, but it is not included in estimated revenue.

### Analyze File Reporting

Every Analyze File KPI card opens evidence.

Available evidence reports:

- Conversations
- Confirmed Bookings
- CNC
- Missed Opportunities
- Pending
- Objections
- Estimated Revenue
- Recommendations

The evidence modal displays classification, source, employee, reason, revenue, objection, recommendation, and full source text.

### Parser Validation

Run:

```sh
node scripts/validate-file-parser.mjs
```

Current automated fixtures validate:

- Baseline 10 conversations: 4 confirmed, 3 missed, 2 CNC, 1 pending, AED 19,200.
- Taxonomy 20 conversations: 6 confirmed, 4 missed, 3 CNC, 3 pending, 3 objection-only, 1 info-only, AED 21,500.
- Real-world 10 conversations: 4 confirmed, 1 cancelled, 1 missed, 1 CNC, 2 pending, 1 objection-only, AED 22,500.

The current validation script passes.

## Classification Engine

There are currently two different classification systems.

### Live Dashboard Classification

Live mock rows use score thresholds:

- Confirmed: score >= 83
- Pending: score 80-82
- CNC: score 76-79
- Missed Opportunity: score <= 75

The live dashboard does not currently represent Cancelled Booking, Objection Only, or Info Only as outcomes.

### Analyze File Classification

Analyze File uses normalized explicit result and text signals.

#### Booking / Confirmed

Detected from explicit outcomes such as:

- Booking
- Confirmed Booking
- Booking Confirmed
- Booked
- Arabic equivalents such as `حجز`, `حجز مؤكد`, or `تم الحجز`

#### Cancelled Booking

Detected from explicit cancellation language such as:

- Cancelled Booking
- Canceled Appointment
- Booking Cancelled
- Arabic equivalents such as `تم الالغاء`, `الغاء الحجز`, or `حجز ملغي`

Cancelled bookings do not contribute to estimated revenue.

#### CNC

Detected from explicit CNC language, Conversation Not Closed, no next step, no follow-up, or no booking request.

If no outcome or pending signal is detected, the parser currently defaults the conversation to CNC.

#### Missed Opportunity

Detected from explicit missed or lost opportunity language and Arabic equivalents.

#### Pending

Detected from explicit Pending, Open Lead, Follow-up Pending, Arabic equivalents, or general appointment/follow-up language when no stronger outcome exists.

#### Objection Only

Detected from explicit `Objection Only` or Arabic equivalent. It remains distinct from CNC and does not contribute to booking or revenue.

#### Info Only

Detected from explicit `Info Only`, `Information Only`, or Arabic equivalents. It does not contribute to booking or revenue.

#### Objection Signal

Objection detection is separate from outcome classification. A conversation can have an objection signal and still be Confirmed, Pending, Missed, or another outcome.

## CNC Definition

CNC means Conversation Not Closed.

A CNC conversation represents a customer who showed interest or entered a commercial conversation, but the interaction ended without a clear close.

A close can be:

- A confirmed booking.
- A scheduled appointment.
- A specific follow-up request.
- A clearly assigned next step.

Examples:

- Customer asks what happens next, but the employee gives a generic reply and offers no action.
- Customer is interested, but no booking request is made.
- Customer needs more information, but no follow-up is scheduled.
- Conversation ends without appointment options or ownership.

Edge cases:

- Explicit Pending should remain Pending, not CNC.
- Objection Only should remain Objection Only, not CNC.
- Info Only should remain Info Only, not CNC.
- Cancelled Booking should remain Cancelled, not Pending or CNC.
- A conversation with a clear follow-up action is Pending rather than CNC.
- The current parser defaults unclassified blocks to CNC, which may over-classify incomplete or poorly formatted files.

## Revenue Logic

### Estimated Revenue

Estimated Revenue represents detected booking values from conversations classified as Confirmed.

It is not confirmed collected revenue.

Live dashboard revenue:

- Uses mock `booking.revenue` values.
- Includes only live rows classified Confirmed by score.

Analyze File revenue:

- Extracts explicit values from uploaded text.
- Includes only conversations classified Confirmed.
- Prevents Info Only, Pending, Missed, CNC, Objection Only, and Cancelled outcomes from contributing.

### Revenue Limitations

- No payment verification exists.
- No refunds or partial payments are modeled.
- No recurring revenue model exists.
- No currency conversion exists.
- Currency display is hardcoded to AED in UI formatting.
- Live revenue values are mock values.
- Uploaded values depend on recognizable text structure.

### Future Confirmed Revenue Model

`integrations/revenueAdapters.js` defines placeholder future sources:

- Payment WhatsApp Group
- CRM
- Invoice System
- Accounting System

The adapter normalization shape exists, but no source is connected.

## Booking Logic

### Live Dashboard

The current live booking logic is score-derived. A score of 83 or above is treated as confirmed.

This is a known prototype limitation because every live mock row has a default raw status of Confirmed even when its score-derived outcome is Pending, CNC, or Missed.

### Analyze File

Booking requires explicit booking language or an explicit Booking result. A booking contributes revenue only when its final classification is Confirmed.

Cancelled bookings remain separate and contribute zero revenue.

## Missed Opportunity Logic

### Live Dashboard

A score of 75 or lower is classified as a Missed Opportunity.

The attached report's missed issue and recommendation are displayed as evidence, but the outcome itself is not derived from those fields.

### Analyze File

Missed Opportunity requires explicit missed/lost opportunity wording or Arabic equivalent.

Potential revenue may be displayed as an evidence value when detectable, but it is not included in estimated revenue.

## Pending Logic

### Live Dashboard

Scores from 80 through 82 are classified as Pending.

### Analyze File

Pending is detected from:

- Explicit Pending or Open Lead status.
- Follow-up Pending language.
- Arabic equivalents.
- Appointment or follow-up language when no stronger explicit outcome exists.

A Pending conversation does not contribute to estimated revenue.

## Objection Detection Logic

The Analyze File parser detects an explicit Objection or Objections field first. Otherwise it scans normalized conversation text.

Supported inferred objection categories:

- Price: expensive, unaffordable, overpriced, high price, Arabic price concerns.
- Trust: distrust, quality uncertainty, scam concerns, Arabic trust and quality terms.
- Pain: pain, painful, hurt, and Arabic pain terms.
- Location: far location and Arabic equivalents.
- Competition: another provider, cheaper offer, competitor, and Arabic equivalents.
- Fear: scared, afraid, and Arabic equivalents.

Other explicit objections are preserved as entered.

Current limitation: `summary.objections` counts conversations that contain an objection, not individual objection instances or only objection-only outcomes. This semantic distinction must be made explicit before production reporting.

## Risk Center

The current Risk Center is generated dynamically from visible live rows and contains:

### CNC Risks

All live rows classified as CNC.

### Revenue Leakage

Missed, CNC, or other non-confirmed rows with significant mock revenue values.

### Employee Risks

Rows belonging to the employee group with the lowest calculated outcome performance.

### Response Risks

Rows with scores below 80. This is a proxy and not a measured response-time risk.

### Objection Risks

Non-confirmed rows with a non-empty objection field.

### Platform Risks

Rows from the platform with the lowest calculated outcome performance.

### Future Risks

Potential future additions include real response-delay risks, campaign spend leakage, repeated follow-up failure, payment risk, and confirmed revenue variance. These are not implemented.

## Employee Analytics

Employee assignment is determined in this order:

1. Manual override state, if present.
2. Employee tag detected inside report messages.
3. Configured employee alias match.
4. Unassigned.

Configured employee tags and aliases live in `data/agents.js`.

Implemented employee metrics:

- Confirmed bookings, using live score-derived outcomes.
- Estimated revenue generated from score-derived confirmed rows.
- CNC count.
- Missed opportunities.
- Total conversations.
- Conversion rate.
- Objections handled in confirmed conversations.
- Average score displayed as response quality.
- Outcome performance score.
- Best and weakest conversation by score.
- Training recommendation based on CNC or missed rows.

Current limitations:

- Response time is not calculated from actual message timestamps.
- Response quality is represented by average conversation score.
- Performance depends on prototype outcome thresholds.
- Employee edits are in-memory only.
- Employee metrics are linked to conversation rows, but some component metrics are proxies rather than measured evidence.

## Drill Down System

The standard live journey is:

`Metric -> Platform -> Source -> Campaign or Content -> Employee -> Booking or Opportunity -> Conversation Report`

Conversation Report contains:

- Read-only responsible employee.
- Platform Analysis tab.
- Full Conversation tab.
- Summary.
- Metric evidence.
- Source and content.
- Missed issue.
- Estimated revenue.
- Interest.
- Response quality.
- Booking attempt quality.
- Objections.
- Sentiment.
- Employee notes.
- Platform recommendation.

Analyze File uses:

`Number -> Evidence list -> Parsed conversation -> Full source text`

Navigation uses a modal and in-memory drill state. It does not use URL routing.

Known drill-down limitations:

- An employee summary search result opens the first matching conversation rather than the dedicated employee overview.
- A platform report can dead-end when initialized on Confirmed Bookings and the platform has no confirmed rows.
- The separate Conversation Analysis page uses a different four-conversation dataset.

## Search System

Universal Search operates on date-filtered live platform rows.

Search corpus includes:

- Booking ID and masked phone.
- Customer names.
- Platform and source.
- Campaign/content title and detail.
- Employee name, tags, and aliases.
- Status.
- Report summary, interest, response, booking quality, missed issue, objections, sentiment, notes, and recommendation.
- English and Arabic messages.

Arabic normalization includes:

- Removing tashkeel.
- Normalizing Alef forms.
- `ى` to `ي`.
- `ة` to `ه`.
- Normalizing Hamza forms on Waw and Ya.
- Removing tatweel.

Employee aliases support examples such as Ahmad, Ahmed, `أحمد`, and `احمد`.

Price-related Arabic and English terms expand into a common search concept.

Search results display outcome-first summaries:

- Confirmed bookings.
- Missed opportunities.
- Total conversations.
- Performance score.

Known limitation: opening an employee summary result opens one matching conversation, although the report context retains the employee's matching row IDs.

## Privacy & Security

### Implemented Demonstrations

- Customer name masking helper.
- Phone masking helper.
- Owner reveal buttons for example sensitive values.
- In-memory audit entries for reveal actions.
- Privacy settings UI.
- Data ownership statement.

### Not Implemented

- Authentication.
- Role-based access control.
- Server-side authorization.
- Persistent audit logs.
- Encryption at rest.
- Encryption key management.
- Data retention policy.
- Tenant isolation.
- Secure secret storage.
- Consent management.
- Compliance controls.

### Future Encryption Strategy

A production implementation should:

- Encrypt sensitive data at rest and in transit.
- Separate tenant encryption domains.
- Store secrets outside the application repository.
- Enforce owner and staff roles server-side.
- Log every sensitive reveal with actor, reason, time, and affected record.
- Provide retention, deletion, and export controls.
- Perform a formal privacy and security review before live customer data is connected.

## Current Development Status

### Completed

- Static MVP architecture and modular folder structure.
- Bilingual English/Arabic UI and RTL.
- Light/dark/auto themes.
- Current visual system.
- Live mock dashboard and date filtering.
- Core KPI cards and modal drill-down architecture.
- Platform, source, content, employee, and conversation investigation.
- Full Conversation and Platform Analysis report tabs.
- Read-only responsible employee in conversation reports.
- Search normalization and bilingual search.
- Employee tag/alias detection.
- Employee, platform, alert, risk, settings, and privacy demonstration views.
- Analyze File text parser and evidence reports.
- Parser outcome taxonomy including Cancelled, Objection Only, and Info Only.
- Parser revenue extraction and validation fixtures.
- Placeholder platform and confirmed revenue adapters.
- Generated bundle workflow.

### Partially Completed

- Evidence-first KPI system: most journeys work, but some metrics are prototype proxies.
- Business-neutral positioning: general UI is business-focused, but mock data still contains clinic and medical wording.
- Employee analytics: evidence links exist, but response speed/quality are not based on real measurements.
- Risk Center: categories exist, but some are score-based proxies.
- Privacy Center: masking and audit demonstration exist, but there is no security enforcement or persistence.
- Settings: team actions work in-memory; toggles and business settings are not persisted.
- Analyze File formats: plain text and basic CSV work; advertised binary formats are not truly parsed.
- Integrations: folder and adapter shapes exist; normalization and API connectivity are not implemented.
- Search context: matching is contextual, but employee summary navigation needs correction.
- Platform intelligence: all six platforms exist, but some empty-outcome drill-down paths can dead-end.

### Done Since This Section Was Written

- Backend services and database (Express + PostgreSQL, `my-server`).
- Owner-account authentication and authorization (register/login/password reset).
- Real platform API integration for WhatsApp and Instagram (signature-verified Meta webhook, production ingestion pipeline).
- Persistent team members and platform connections (not yet: most other settings, audit logs).
- Basic real-time health monitoring (`GET /health`) and structured JSON logging (not yet: alerting/notifications).
- Deployment pipeline basics: CI on both repos (syntax checks, automated tests, bundle-freshness check).
- Automated test suite for the backend (48 tests via `node:test`) — not yet a browser/end-to-end suite for the frontend.
- Versioned database migrations (`node-pg-migrate`), verified against production.
- **Reply-from-the-platform**: `POST /api/conversations/:id/reply` sends a real WhatsApp message via the Graph API and logs it as a conversation row; a reply box appears on real WhatsApp conversations in both the Bookings and Conversation Analysis views.
- **Delete-conversation**: `DELETE /api/conversations/:id` lets the owner permanently remove a customer conversation from the dashboard (owner-initiated only, no scheduled/automatic deletion).
- **WhatsApp Embedded Signup** (self-serve "client connects their own WhatsApp account" OAuth flow, replacing the old raw-token-paste-only form as the primary path): fully built and verified working end-to-end up to the point Meta's own Business Verification gate stops it — see the disconnected-WhatsApp note at the top of this document.
- A real WhatsApp number was fully verified, registered for the Cloud API, and confirmed working end-to-end (real receive + real reply) before being deliberately disconnected to attempt Coexistence (see top of document).
- Found and fixed a second XSS gap (Conversation Analysis view's customer name/message rendering), in addition to the one already fixed in the Bookings view.

### Still Not Started

- Real platform API integrations for Facebook, TikTok, Google, Snapchat. Google Business Messages (real-time chat) is dead — Google shut it down in 2024, dropped from scope entirely. TikTok is blocked on the business having an official registration document. Snapchat needs direct outreach to Snap for API access.
- A working WhatsApp connection (see the disconnected-WhatsApp note at the top — was working, is not right now).
- A self-serve "connect your own account" flow for anything other than WhatsApp (which has Embedded Signup, itself blocked on Meta Business Verification). Facebook/Instagram still only support the manual token-paste form.
- Per-employee staff login and access control (only the business owner account can log in today).
- Real response-time measurement (employee metrics are still score-derived proxies).
- Real confirmed revenue connections (and revenue extraction/employee attribution for real WhatsApp/Instagram conversations specifically — deferred on purpose until real customer usage data exists).
- Production AI or machine-learning analysis service (classification is still rule-based).
- A refresh mechanism for the 60-day WhatsApp Embedded Signup system-user tokens (tracked as an open task; not urgent since no client has connected through it yet).
- A data retention/deletion policy (the owner can now manually delete a conversation, but there's no automatic retention rule).
- Full observability (dashboards/alerting beyond the basic health endpoint and JSON logs).
- Automated browser/end-to-end test suite for the frontend, and route-level integration tests for the backend (register/login/reply/delete are only tested at the pure-logic/lib level, not as full HTTP routes against a real database).
- Formal accessibility, security, privacy, and compliance audits.

**Note on multi-tenancy:** the database schema and webhook routing already support true
multi-tenancy today (each `platform_connections` row is scoped to a `user_id`, and inbound
webhook events resolve the correct owner from the account ID they arrived on) — this isn't a
"single business owner model" limitation at the data layer. What's still missing is a smooth,
non-technical connection experience for every platform except WhatsApp.

## Known Issues

### High Priority

Items 1 and 4 below described the old mock dataset and are now resolved or moot: demo
bookings were removed, and the live dashboard and Conversation Analysis page are now driven
by the same real conversation source, so they can no longer disagree on totals. Item 1's
underlying concern (score-derived outcome classification instead of explicit evidence) still
applies to real conversation data, since `getConversationOutcome` is unchanged.

1. ~~Live outcome classification is based only on score thresholds and conflicts with the raw Confirmed status stored on every mock row.~~ Mock rows are gone; real conversations are still classified by the same score thresholds via `getConversationOutcome`, which remains a prototype rather than evidence-based detection.
2. Employee response speed is inferred from score or booking time-of-day rather than response latency.
3. Employee response quality is represented by average conversation score.
4. ~~Conversation Analysis contains four records while the dashboard contains 29 platform conversation rows.~~ Resolved: both now come from the same real `/api/conversations` data.
5. Employee search summary navigation opens one conversation instead of the dedicated employee overview.
6. Platform drill-down can dead-end when a platform has no rows for the default Confirmed Bookings metric.
7. Objection count semantics are not consistently named across parser fixtures and reports.
8. Real conversations never get an employee assignment or contribute extracted revenue, and every inbound message is its own row instead of being grouped into one evolving conversation — deliberately deferred until real customer usage data exists to inform the design.

### Medium Priority

1. Alert and privacy toggles do not persist or update their source arrays.
2. Business settings and connection cards are static.
3. The employee report label says Confirmed Bookings Today even for custom date ranges.
4. Platform Response Quality displays overall outcome performance.
5. ~~Analyze File advertises PDF and DOCX, but binary extraction is not implemented.~~ Resolved: real PDF/DOCX/ZIP text extraction now works via the browser's native `DecompressionStream`, verified against a real deflate-compressed DOCX fixture.
6. Recommendation report totals are not clearly modeled.
7. Ask Platform is a small keyword-based demo rather than an evidence-query system.

### Technical Debt

- `app.js` is still large and combines many renderers and interaction handlers.
- ~~`data/mockData.js` contains very long inline records and historical clinic-specific wording.~~ Resolved: it now holds only empty platform shells and shared date/model helpers.
- `analysis/reports.js` duplicates some function names found in `analysis/metrics.js`, and is no longer imported by anything now that mock bookings are gone — a candidate for deletion.
- Canonical models are descriptive arrays rather than enforced schemas or types.
- Persistent state exists for team members and platform connections (backend Postgres); most other frontend UI state is still in-memory only.
- Automated tests exist for the backend (35 tests). No automated tests exist yet for frontend live-dashboard metrics, search, or drill-down behavior.
- The generated `app.bundle.js` must be rebuilt after source changes — enforced automatically now via a local pre-commit hook and a CI check that fails if the committed bundle doesn't match a fresh build from source.
- ~~The repository currently has no Git commits, tags, release history, or stable branch record.~~ No longer true: the repository has an active commit history on `main`.
- Historical preview images are stored at repository root and increase repository noise.

## Future Roadmap

### Short-Term

- Make explicit conversation outcomes authoritative in the live dataset.
- Unify dashboard and Conversation Analysis around one conversation model.
- Replace fake response metrics with real timestamp-based calculations or mark them unavailable.
- Fix employee search summary navigation and platform empty-state drill-downs.
- Define separate objection metrics and labels.
- Add automated unit tests for live metrics, search, parser, and context filtering.
- Persist settings state locally or through a minimal backend.
- Correct Analyze File format claims to match real support.

### Mid-Term

- Build a backend ingestion and persistence layer.
- Implement platform-specific normalization adapters.
- Add authentication, roles, and tenant boundaries.
- Connect one real platform as a controlled pilot.
- Add real conversation timestamps, outcomes, employee assignment, and confirmed booking events.
- Add a production evidence model linking every metric to source records.
- Connect an initial confirmed revenue source.
- Add automated browser tests and CI validation.

### Long-Term

- Support multi-platform real-time intelligence.
- Add confirmed revenue from CRM, invoice, payment, and accounting systems.
- Provide owner-grade alerting and proactive risk monitoring.
- Add secure multi-tenant deployment.
- Build configurable industry-neutral classification models.
- Add governance, privacy, retention, and audit controls suitable for real customer data.
- Develop trustworthy business question answering grounded in source evidence.

## Development Priorities

1. Correct analytics truth: explicit outcomes, real response metrics, unified conversation data.
2. Protect evidence integrity: every KPI and context must lead to the correct source conversations.
3. Add automated tests for parser, live metrics, search, filtering, and drill-downs.
4. Establish backend persistence, authentication, authorization, and auditability.
5. Implement one real integration end-to-end before expanding platform breadth.
6. Connect confirmed revenue separately from estimated revenue.
7. Reduce orchestration complexity in `app.js` without changing visible behavior.
8. Clean business-neutral mock content and remove stale preview assets from the active source tree.

## Technical Notes For New Engineers

### Before Editing

- Treat `data/mockData.js` as the live MVP data source.
- Treat `analysis/fileParser.js` as a separate uploaded-file validation engine.
- Do not assume both systems classify outcomes the same way.
- Do not edit `app.bundle.js` directly.
- Run `node scripts/build-bundle.mjs` after changing source modules.
- Run `node scripts/validate-file-parser.mjs` after changing parser logic.
- Preserve English/Arabic values and RTL behavior.
- Preserve date-filter context in every live report.
- Preserve the evidence-first drill-down journey.

### Important State

Application state is created in `settings/settingsState.js` and then held in module-level variables in `app.js`.

Important state includes:

- Current language and theme.
- Current view.
- Selected Conversation Analysis record.
- Date range.
- Booking drill-down path.
- Agent overrides.
- Search query.
- Active report context.
- Revealed sensitive fields.
- Analyze File result and drill state.

All state is lost on page reload.

### Rendering and Events

- Rendering is direct HTML string generation.
- Interactions use document-level event delegation.
- Drill-down navigation is state-based inside a modal, not URL-based.
- Styling changes should remain in `styles.css`.
- Reusable small HTML helpers live in `ui/components.js`.

### Adding an Integration

1. Add platform-specific normalization inside the relevant adapter.
2. Convert raw records into the unified internal model.
3. Never pass raw platform payloads directly to UI renderers.
4. Add fixture data and normalization tests.
5. Verify date filtering, search corpus, employee detection, evidence links, and revenue behavior.

### Changing Classification

- Live dashboard classification changes belong in `analysis/metrics.js`.
- Uploaded-file classification changes belong in `analysis/fileParser.js`.
- Add tests before changing either system.
- Ensure `Conversations = Confirmed + Missed + CNC + Pending` for live outcomes.
- Ensure Cancelled, Objection Only, and Info Only remain separate in uploaded-file summaries.
- Ensure only Confirmed outcomes contribute to Estimated Revenue.

## Repository Audit

**Audit update (2026-07-05):** the audit below is the original snapshot from June 9, 2026 and
is kept for historical record, but several of its findings are now resolved: a real backend,
authentication, and one live Meta webhook integration (WhatsApp/Instagram) exist; the
repository has an active Git commit history; the Analyze File evidence-rendering XSS risk
noted under "Potential Risks" has been fixed (untrusted fields are HTML-escaped before
rendering); mock data and its clinic-specific content have been removed; and the live
dashboard and Conversation Analysis page no longer disagree on totals, since both now read
the same real conversation data. See the "Done Since This Section Was Written" list earlier
in this document for the fuller picture. Score-derived outcome classification, employee
attribution, and revenue extraction for real conversations remain open, per that same list.

### Audit Scope

The repository structure, source modules, generated bundle, parser fixtures, current UI shell, mock data, search logic, analysis logic, settings, privacy helpers, integration placeholders, translations, and visual styles were reviewed.

Validation completed:

- Current browser application loads without console errors.
- Parser validation script passes.
- Bundle generation succeeds.
- Live full-range KPI equation is internally consistent:
  `29 = 14 confirmed + 3 missed + 6 CNC + 6 pending`.
- Current estimated live revenue is AED 78,950.
- Current Business Health is 72.
- All six supported platform structures exist.
- All current Analyze File KPI cards link to evidence views.

### Weak Areas

- Analytics truth is weakened by score-derived live outcomes.
- Response-related metrics are not based on real response data.
- Two separate conversation datasets create contradictory totals.
- UI orchestration remains concentrated in a large file.
- Mock data still contains clinic-specific content despite business-neutral product positioning.
- Settings, privacy logs, and employee changes are session-only.
- Integrations and model definitions are structural rather than operational.
- Repository governance is weak because there is no commit history.

### Refactoring Opportunities

- Split `app.js` into view renderers, controllers, and state actions.
- Convert canonical model descriptions into validated schemas or TypeScript types.
- Move large mock records into smaller fixture modules.
- Unify live and uploaded conversation models while preserving isolated datasets.
- Introduce a central outcome service with explicit evidence and provenance.
- Add a persistent settings store interface.
- Separate metric labels from calculation names.
- Move preview screenshots into a dedicated documentation/archive folder.

### Potential Risks

- Owners may trust proxy metrics as real operational measurements.
- Integrating real data before fixing outcome semantics could produce misleading reports.
- In-memory privacy controls provide no real protection.
- Direct HTML string rendering requires careful sanitization before ingesting untrusted data.
- Plain-text file parsing can misclassify ambiguous or poorly formatted conversations.
- Without tests for dashboard behavior, future changes can silently break filtered contexts.
- Without Git history, stable-state recovery and change accountability are limited.

## Final Handover Position

The repository is a strong product-direction MVP and a useful validation environment. It successfully demonstrates the Owner Platform philosophy, evidence-first exploration, bilingual experience, and intended business intelligence journeys.

It should not yet be treated as a production analytics system. The next engineering phase should prioritize trustworthy outcome modeling, real evidence-linked measurements, persistence, security, automated testing, and one complete live integration before expanding functionality.
