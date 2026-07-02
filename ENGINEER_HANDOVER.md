# Engineer Handover

## Start Here

Owner Platform is a static MVP demonstrating an evidence-first business conversation intelligence product.

Before making changes:

1. Read `OWNER_PLATFORM_MASTER_HANDOVER.md`.
2. Read `PROJECT_STATUS.md`.
3. Read `BUSINESS_LOGIC.md`.
4. Run the parser validation suite.
5. Run the application through a local HTTP server.
6. Inspect both English and Arabic modes.

## What To Work On First

### Priority 1: Analytics Truth

- Replace score-only live outcome classification with explicit outcome and evidence fields.
- Resolve the conflict between raw Confirmed status and score-derived Pending/CNC/Missed outcomes.
- Define authoritative outcome provenance.

### Priority 2: Unified Conversation Model

- Reconcile the 29 live platform rows with the separate four-record Conversation Analysis page.
- Ensure one conversation source of truth drives dashboard, search, employee, and analysis views.

### Priority 3: Real Employee Metrics

- Replace response-speed proxy with measured response latency.
- Separate response quality from general conversation score.
- Ensure every employee metric links to evidence.

### Priority 4: Automated Validation

- Add unit tests for live metrics, search normalization, context filtering, and drill-downs.
- Add browser tests for major journeys.
- Keep Analyze File fixtures as a mandatory validation gate.

### Priority 5: First Real Integration

- Implement one platform adapter end-to-end.
- Normalize raw data into an enforced internal model.
- Add secure persistence before connecting customer data.

## What Should Not Be Modified Casually

- Do not edit `app.bundle.js` directly.
- Do not merge Analyze File data into live dashboard data.
- Do not remove Arabic or RTL support.
- Do not remove date/context filtering.
- Do not change outcome semantics without tests.
- Do not treat Estimated Revenue as Confirmed Revenue.
- Do not connect real customer data before authentication, authorization, storage, and privacy controls exist.
- Do not add more dashboard features before fixing analytics truth.

## Current Architectural Decisions

- Dependency-free static browser MVP.
- Modular domain folders with `app.js` orchestration.
- Generated standalone bundle loaded by `index.html`.
- Live mock data separated from uploaded-file validation data.
- Modal state used for drill-down instead of URL routing.
- English/Arabic localized objects stored directly in data.
- Integration adapters prepared as boundaries but intentionally unimplemented.
- Settings and privacy demonstrations kept in memory.

## Current Risks

- Owners may interpret score-derived outcomes as factual booking outcomes.
- Proxy employee metrics may appear more precise than they are.
- Search and platform contextual dead ends can obscure evidence.
- In-memory privacy controls are not production security.
- Direct HTML string rendering needs sanitization before untrusted live data.
- No Git commit history exists in the source repository.
- No automated live-app test suite exists.

## Recommended Roadmap

### Phase 1: Stabilize Truth

- Explicit outcome model.
- Unified conversation dataset.
- Correct metric semantics.
- Automated tests.
- Fix contextual dead ends.

### Phase 2: Build Production Foundation

- Backend.
- Database.
- Authentication and roles.
- Tenant isolation.
- Persistent audit logs.
- Secure data handling.

### Phase 3: Connect One Source

- Implement and validate one real integration.
- Confirm evidence traceability.
- Measure real response behavior.
- Validate outcomes against owner-reviewed truth.

### Phase 4: Revenue and Expansion

- Add Confirmed Revenue sources.
- Add further platform adapters.
- Add real owner alerts and monitoring.

## Definition of Done for Future Work

A change is complete only when:

- It preserves the evidence-first journey.
- It respects date and selected context.
- English and Arabic work.
- Light and dark themes work.
- Tests pass.
- The bundle is rebuilt.
- The original conversation evidence remains inspectable.
- Implemented behavior is documented accurately.

