# Feature Inventory

## Dashboard

- Status: Implemented MVP.
- Purpose: Present owner-focused business status and interactive KPIs for the selected date range.
- Limitations: Uses mock data; live outcomes and Business Health contain prototype calculations.

## Analyze File

- Status: Implemented for plain text and basic CSV; partial for advertised formats.
- Purpose: Validate classification, revenue, objections, and evidence before live integrations.
- Limitations: PDF/DOCX binary extraction is not implemented; parser relies on recognizable text structure.

## Classification Engine

- Status: Two implemented prototype engines.
- Purpose: Categorize conversation outcomes.
- Limitations: Live engine uses score thresholds; Analyze File uses explicit/inferred text rules. They are not unified.

## CNC

- Status: Implemented.
- Purpose: Identify conversations ending without booking, follow-up, appointment, or clear next step.
- Limitations: Analyze File defaults otherwise unclassified blocks to CNC; live CNC is score-derived.

## Revenue Logic

- Status: Estimated Revenue implemented; Confirmed Revenue planned.
- Purpose: Attribute detected booking value to source conversations.
- Limitations: No payment verification, refunds, currency conversion, or real revenue integration.

## Risk Center

- Status: Implemented MVP.
- Purpose: Show CNC, revenue leakage, employee, response, objection, and platform risks.
- Limitations: Several categories depend on scores and mock revenue rather than measured production data.

## Employee Analytics

- Status: Implemented MVP.
- Purpose: Show outcomes and evidence by detected employee.
- Limitations: Response speed and response quality are proxies; employee state is not persistent.

## Search

- Status: Implemented.
- Purpose: Search live date-filtered conversation evidence across Arabic and English.
- Limitations: Employee summary open action targets the first conversation rather than the employee overview.

## Privacy Center

- Status: Demonstration implementation.
- Purpose: Show masking, privacy settings, owner reveal, and audit concepts.
- Limitations: No authentication, authorization, persistence, or encryption.

## Settings

- Status: Partially implemented.
- Purpose: Display business, team, connections, alerts, and privacy settings.
- Limitations: Team edits are session-only; most settings are static; toggles do not persist.

## Theme System

- Status: Implemented.
- Purpose: Support light, dark, and automatic color modes.
- Limitations: Theme selection is not persisted after reload.

## Drill Down

- Status: Implemented for major KPI, platform, employee, risk, alert, search, and Analyze File journeys.
- Purpose: Move from number to evidence and conversation truth.
- Limitations: Some platform and employee-search paths have contextual dead ends.

## Recommendations

- Status: Implemented MVP.
- Purpose: Display the most important recommendation and conversation-level recommendations.
- Limitations: Recommendations are static mock report text or rule-based parser fields; no production recommendation engine exists.

## Platform Performance

- Status: Implemented MVP.
- Purpose: Compare outcomes by Facebook, Instagram, TikTok, Google, WhatsApp, and Snapchat.
- Limitations: Uses mock rows and score-derived outcomes.

## Conversation Reports

- Status: Implemented.
- Purpose: Show platform analysis and full original conversation for verification.
- Limitations: Timestamps are generated from booking time; live report content is mock data.

## Alerts

- Status: Implemented MVP.
- Purpose: Show important owner-level alerts with related evidence.
- Limitations: Deterministic mock rules; no real-time service or persisted notification preferences.

## Date Filtering

- Status: Implemented for live views.
- Purpose: Restrict dashboard, search, risk, employee, platform, alert, and drill-down data.
- Limitations: Analyze File is intentionally separate; data covers only mock dates.

## Platform Connections

- Status: UI and adapter structure only.
- Purpose: Prepare for future platform data ingestion.
- Limitations: No real APIs or normalization logic are connected.

