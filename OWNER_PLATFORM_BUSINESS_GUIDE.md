# Owner Platform by Smart INV

# Business Guide

Document status: Current product guide  
Repository state reviewed: July 10, 2026  
Current stage: Early production system. Authentication and the database are live and proven. The real WhatsApp integration (including in-platform reply) was built, tested, and confirmed working end-to-end with a real customer conversation — it is **currently disconnected** while attempting Meta's "Coexistence" feature (see "Current Product Status" below for why and what's next). Some analytics (employee attribution, revenue extraction, and multi-message conversation grouping for real conversations) are still placeholders pending real customer usage data.

## What Is Owner Platform?

Owner Platform is a business conversation intelligence platform designed for owners, managers, and decision-makers.

It helps explain what happened inside customer conversations and connects those conversations to business outcomes such as:

- Confirmed bookings.
- Missed opportunities.
- Conversations that were not properly closed.
- Estimated revenue.
- Employee performance.
- Platform and campaign performance.
- Business risks.

The platform is built around a simple idea:

`Number -> Evidence -> Conversation -> Truth`

An owner should not have to trust a number without understanding where it came from.

The current product has moved beyond pure demonstration. WhatsApp messages were received through a real, signature-verified webhook connection and appeared on the live dashboard, and the owner could reply from inside the platform — all confirmed working with a real customer and a real phone number. WhatsApp is currently disconnected while the team attempts a feature that would let a client use their normal WhatsApp Business app and the platform at the same time (see "Current Product Status"). Instagram's webhook code exists but has not been tested with a real account. Facebook, TikTok, Google, Snapchat, payment, and CRM connections are not yet active. Employee attribution, revenue extraction, and grouping multiple messages into one evolving conversation are still placeholders for real conversations, pending real customer usage data to inform the design.

## Why Was It Created?

Owners receive customer messages from many places:

- Instagram.
- Facebook.
- TikTok.
- Google.
- WhatsApp.
- Snapchat.
- Website forms.
- Calls and other lead sources.

Most owners cannot review every conversation. They often see totals but cannot see the story behind those totals.

Owner Platform was created to help answer:

- Which conversations became bookings?
- Where did those bookings come from?
- Which employee handled the customer?
- Why did an interested customer not book?
- Which conversations ended without a next step?
- Which objections are becoming common?
- Where is revenue being lost?
- Can the owner verify the platform's conclusion?

## What Problem Does It Solve?

Many business systems focus on activity:

- Number of messages.
- Number of leads.
- Number of calls.
- Number of campaigns.

Activity is useful, but it does not tell the owner whether the business is performing well.

Owner Platform focuses on outcomes first:

- Bookings before message volume.
- Missed opportunities before vanity metrics.
- Employee results before employee activity.
- Evidence before assumptions.
- Revenue meaning before decorative charts.

It helps owners move from "What happened?" to "Why did it happen?" and then to "What should we do next?"

## Who Is It For?

Owner Platform is intended for:

- Business owners.
- Founders.
- General managers.
- Sales managers.
- Customer service managers.
- Operations leaders.
- Marketing managers.
- Partners and investors reviewing business performance.

The long-term product is intended to be business-neutral. The earlier demonstration data (which included clinic and medical examples from the original MVP use case) has been removed; the dashboard now starts empty and only shows conversations from connected real accounts.

## How Owners Use The Platform

An owner starts with the dashboard and sees the most important business signals.

From there, the owner can:

1. Click a number.
2. See which platform created it.
3. See the source, campaign, or content.
4. See the responsible employee.
5. Open the exact conversation.
6. Read the platform's analysis.
7. Read the full original conversation.

This allows the owner to verify the conclusion instead of trusting a hidden score.

The owner can also:

- Search for an employee, customer, campaign, platform, objection, or keyword.
- Review risks.
- Review employee outcomes.
- Upload a conversation test file.
- Switch between English and Arabic.
- Use light, dark, or automatic theme mode.
- Review privacy settings and masked data examples.

## Dashboard Explanation

The dashboard reflects the selected date range. It starts empty for a new account and populates with real WhatsApp/Instagram conversations as they arrive. Some analytics below still use score-based or placeholder logic rather than fully explicit evidence, described in each section.

### Business Health

Business Health is a score out of 100 intended to summarize the condition of the business conversation journey.

The current score considers:

- Booking success.
- Missed opportunities.
- CNC conversations.
- Conversation scores.
- A prototype response-speed component.

Important: the current Business Health score is an MVP demonstration. Some parts are based on proxy data rather than real response measurements.

### Confirmed Bookings

Confirmed Bookings represents conversations classified as successful bookings.

Clicking the KPI opens the journey behind the number:

`Platform -> Source -> Content or Campaign -> Employee -> Conversation`

In the current live demonstration dashboard, booking outcomes are inferred from conversation scores. This will need to be replaced with real confirmed booking evidence before production.

### Analyzed Conversations

Analyzed Conversations shows the number of visible platform conversation records in the selected date range.

Clicking it opens the supporting platform and conversation records.

### Missed Opportunities

Missed Opportunities are conversations where a valuable customer opportunity was lost.

The owner can inspect:

- The conversation.
- The employee.
- The source.
- The missed issue.
- The recommendation.

### Average Response Quality

This currently represents the average score of the visible conversations.

It is not yet a fully independent measurement of response quality.

### Platform Recommendations

The dashboard shows the most important visible recommendation rather than only showing a recommendation count.

It prioritizes lower-performing missed, CNC, and pending conversations.

### Platform Performance

Platform Performance compares conversation outcomes across channels such as Instagram, Google, WhatsApp, and Snapchat.

The current result is calculated from demonstration conversation outcomes and scores.

### Agent Performance

Agent Performance summarizes employee conversation outcomes.

It currently includes bookings, missed opportunities, CNC, total conversations, estimated revenue, conversion rate, and conversation scores.

### Estimated Revenue

Estimated Revenue is calculated from detected booking values inside conversations.

It is not confirmed collected revenue.

The current product does not connect to payments, invoices, accounting software, or a CRM.

## What Is CNC?

CNC means Conversation Not Closed.

It describes a conversation where the customer showed interest, but the conversation ended without a clear next step.

A clear next step could be:

- A confirmed booking.
- An appointment.
- A scheduled follow-up.
- A clear action assigned to the employee or customer.

Example:

A customer asks about a service and appears interested. The employee answers the question but never asks the customer to book, never offers appointment options, and never schedules a follow-up.

That conversation may be classified as CNC.

CNC is important because it shows opportunities that may still be recoverable.

## What Are Missed Opportunities?

A Missed Opportunity is a conversation where the business had a real chance to produce an outcome but lost it.

Examples:

- The customer had strong interest but received no follow-up.
- The employee did not handle a price objection.
- No appointment was offered.
- The employee gave an incomplete answer and the customer left.
- A high-value lead was not properly qualified.

Missed Opportunities are different from CNC:

- CNC means the conversation was not properly closed.
- Missed Opportunity means the opportunity is considered lost.

The current live dashboard uses score-based rules to demonstrate this distinction. The Analyze File tool can also identify explicit missed-opportunity labels in uploaded test files.

## What Is Estimated Revenue?

Estimated Revenue is the value linked to conversations detected as confirmed bookings.

It helps the owner understand which sources, employees, and conversations may have contributed commercial value.

Estimated Revenue is not the same as money received.

It may differ from actual collected revenue because:

- A booking may be cancelled later.
- The final invoice may be different.
- The customer may not pay.
- A payment may be partial.
- The detected value may be incomplete.

Future versions are intended to support Confirmed Revenue through payment, CRM, invoice, or accounting connections. These connections are not currently implemented.

## What Is Business Health?

Business Health is a simple summary score intended to help the owner understand the overall quality of the current conversation journey.

It brings together bookings, CNC, missed opportunities, employee outcomes, and conversation quality.

It should answer:

> Is the business conversation journey healthy, or does it need attention?

The score should always be opened and investigated rather than treated as a final conclusion.

## What Is Risk Center?

Risk Center brings together business conversation risks that deserve the owner's attention.

The current Risk Center includes:

### CNC Risk

Conversations that ended without a clear next step.

### Revenue Leakage

Potential value connected to missed, unclosed, or weakly handled conversations.

### Employee Risk

The employee conversation group with the weakest calculated outcomes.

### Response Risk

Low-scoring conversations that may need faster or stronger follow-up.

The current response risk is a demonstration proxy. It is not based on measured response delay.

### Objection Risk

Repeated objections in conversations that did not produce confirmed outcomes.

### Platform Risk

The weakest-performing platform based on current demonstration outcomes.

Risk Center is not intended to repeat the Missed Opportunities page. It is intended to show several different ways the business may be losing value.

## What Is Employee Analytics?

Employee Analytics helps the owner understand what results each employee produced.

The current employee view shows:

- Confirmed bookings.
- Estimated revenue generated.
- CNC conversations.
- Missed opportunities.
- Total conversations.
- Conversion rate.
- Objections handled.
- Performance score.
- Best and weakest conversations.
- Training recommendation.

The owner can click an employee and inspect the supporting conversations.

Important current limitation:

Some employee metrics, especially response speed and response quality, are still demonstration measurements. Real response-time data is not yet connected.

## Analyze File

Analyze File is a separate testing environment.

It allows a user to upload a plain-text conversation export or basic CSV and test how the platform classifies the conversations.

It can report:

- Conversations.
- Confirmed bookings.
- Cancelled bookings inside evidence.
- CNC.
- Missed opportunities.
- Pending conversations.
- Objections.
- Estimated revenue.
- Recommendations.

Every result can be opened to inspect the original source text and classification reason.

Analyze File does not add uploaded conversations to the live dashboard.

TXT, CSV, real PDF, real DOCX, and ZIP files are all genuinely parsed: PDF and DOCX text is extracted using the browser's native decompression support, not just plain-text reading.

## Search

Universal Search helps the owner find business evidence without changing the interface language.

The owner can search for:

- Employee names.
- Customer names or IDs.
- Platforms.
- Sources.
- Campaigns or content.
- Conversation words.
- Objections.
- Notes.
- Recommendations.
- Arabic or English keywords.

Search supports Arabic normalization and employee name variations. For example, Ahmad, Ahmed, `أحمد`, and `احمد` can lead to the same employee context.

Search results prioritize:

1. Confirmed bookings.
2. Missed opportunities.
3. Total conversations.
4. Performance score.

## Why Privacy Matters

Customer conversations may contain names, phone numbers, financial details, personal concerns, or other sensitive information.

Owner Platform follows a privacy-first philosophy:

- Customer data belongs to the business owner.
- Staff should only see what they are allowed to see.
- Sensitive information should be masked by default.
- Revealing sensitive information should be logged.
- Analysis should help the business without exposing customers unnecessarily.

The current MVP demonstrates masked names, masked phone numbers, and an in-memory reveal log.

It does not yet provide production security, access control, encryption, or persistent audit logs.

The platform message is:

> Owner Platform analyzes your business, not your customers.

## Platform Principles

### No KPI Without Evidence

Every important number should allow the owner to inspect the source conversations behind it.

### Transparency

The owner should understand how a result was reached and should be able to challenge it.

### Traceability

The platform should connect every outcome to its source, platform, campaign, employee, and conversation.

### Privacy First

Customer information should be protected, controlled by the owner, and revealed only when necessary.

### Outcomes First

Bookings, missed opportunities, risks, and revenue meaning come before activity volume.

### Simplicity First

The platform should explain the business without forcing the owner to study a complicated CRM.

## Current Product Status

### Implemented Today

- Real owner account authentication (register, login, password reset by email).
- A real WhatsApp webhook connection, verified against Meta's signature, storing real customer conversations in a persistent database — **currently disconnected** (see status note at the top of this document; it was fully working, including a real reply reaching a real customer, before being deliberately taken offline to attempt Meta's "Coexistence" feature).
- **Reply from inside the platform**: the owner can type a reply to a real WhatsApp conversation and it's sent as a real WhatsApp message — verified with a live phone number.
- **Delete a conversation**: the owner can permanently remove a customer conversation from the dashboard.
- **Self-serve WhatsApp connection (Embedded Signup)**: a client can click "Connect via Facebook" and authorize their own WhatsApp account without ever handling a raw access token — built and verified working, currently blocked on Meta's Business Verification requirement before it can onboard a real external client (a business-process step, not an engineering gap).
- Real-time dashboard population from live conversations (KPIs, Business Health, Platform Performance, Risk Center, and drill-downs all reflect real data once it arrives).
- Real, persistent team management (add/remove employees) and platform connection settings.
- Six platform intelligence structures — only WhatsApp has ever had a real, tested connection; Instagram's webhook code exists but has never been tested against a real connected account; Facebook, TikTok, Google, and Snapchat remain placeholders.
- Date filtering.
- Bilingual English and Arabic interface.
- RTL Arabic mode.
- Light, dark, and automatic themes.
- Search across live conversations.
- Employee intelligence, Risk Center, Alerts, KPI drill-downs (operating on real data when present, otherwise showing an honest empty state).
- Conversation reports and full conversation view.
- Analyze File text, CSV, real PDF/DOCX (via browser decompression), and ZIP validation.
- Privacy masking demonstration.
- Automated backend test suite (48 tests) and CI on both repositories (syntax checks, tests, and a bundle-freshness check that catches hand-edited bundles).

### Partially Implemented

- Evidence-first analytics for real conversations: employee attribution, revenue extraction, and grouping multiple messages into one evolving conversation are still placeholders (real conversations show "-" rather than invented values).
- Employee performance measurement (still based on the same score-derived logic as before; not yet measuring real response time).
- Risk analysis.
- Privacy Center.
- Settings (most toggles outside team/platform connections are still session-only).
- Platform connections: WhatsApp's self-serve Embedded Signup flow is built but blocked on Meta Business Verification; Instagram/Facebook only support the manual token-paste form; TikTok, Google, and Snapchat are placeholders.

These areas now run on a real backend but still require stronger data, measurement, or additional integrations.

### Planned, Not Yet Implemented

- Reconnecting WhatsApp (see status note at top) — either back to the previously-working pure Cloud API setup, or successfully onto Meta's "Coexistence" feature (app + API on the same number simultaneously, currently blocked on an unresolved WhatsApp-app registration error).
- Real Facebook, Google connections — Google Business Messages (real-time chat) was discontinued by Google itself in 2024 and isn't achievable at all; Google as a lead source would need a different mechanism (e.g. ad lead forms) if pursued.
- Real TikTok connection — blocked until the business has an official registration document (tax card, commercial registry, etc.) TikTok will accept for "Company certification."
- Real Snapchat connection — requires direct outreach to Snap for API access (gated behind an allowlist), not yet started.
- Meta Business Verification + App Review for WhatsApp Embedded Signup, so real clients (not just the platform's own number) can self-connect their WhatsApp accounts — deferred until a real client is ready to onboard.
- Real CRM, invoice, accounting, and payment connections.
- Confirmed collected revenue.
- Real-time notifications.
- Per-employee staff login and access control (the current authentication is for the business owner account only).
- Persistent audit logs.
- Production privacy and encryption.
- Live multi-business deployment (the database already supports it structurally — see the multi-tenancy note in `OWNER_PLATFORM_MASTER_HANDOVER.md` — but a smooth self-serve onboarding experience doesn't exist for every platform yet).
- Production-grade intelligent analysis.
- Production monitoring/alerting and a browser/end-to-end test suite (backend unit tests and CI already exist).

## Future Vision

The long-term vision is for Owner Platform to become the trusted intelligence layer between customer conversations and owner decisions.

The platform should eventually:

- Connect to every important customer conversation source.
- Explain where bookings and revenue came from.
- Detect risks before they become expensive.
- Help managers coach employees using real evidence.
- Separate estimated revenue from confirmed collected revenue.
- Protect customer information through strong privacy controls.
- Let owners ask business questions and receive answers grounded in source conversations.

The final goal is not to create more dashboards.

The final goal is to help owners understand what matters, why it happened, and what action to take.

## Frequently Asked Questions

### Is Owner Platform a CRM?

No. It is designed as an owner-focused conversation intelligence platform. It may connect to a CRM in the future, but its purpose is to explain business outcomes and evidence.

### Does the platform connect to real social media accounts today?

Partially, and not right now for WhatsApp specifically. WhatsApp connects through a real, signature-verified Meta webhook and has been proven working end-to-end (real message in, real reply out) — but it's currently disconnected while the team works out how to let a client keep using their normal WhatsApp Business app at the same time. Instagram's webhook code exists but has never been tested with a real account. Facebook, TikTok, Google, and Snapchat remain placeholder connection cards, each blocked on a different real-world requirement (see "Planned, Not Yet Implemented" above) rather than missing code.

### Is the revenue number confirmed money received?

No. It is Estimated Revenue based on detected booking values.

### Can I inspect the conversations behind a number?

Yes. Most KPI, employee, risk, platform, and Analyze File journeys allow the user to open supporting conversations and evidence.

### What does CNC mean?

CNC means Conversation Not Closed. It identifies an interested conversation that ended without a booking, follow-up, appointment, or clear next step.

### Is employee performance based on real employee data?

It is based on the current demonstration conversations. Some metrics are meaningful within the demo, while response speed and response quality still use prototype proxies.

### Does search work in Arabic and English?

Yes. Search is designed to work independently of the selected UI language and supports Arabic normalization and employee aliases.

### Can I upload PDF or DOCX files?

Yes. PDF and DOCX text is genuinely extracted (including compressed content) using the browser's native decompression support, not just plain-text reading.

### Is customer data secure?

Real account authentication (password hashing, signed session tokens), a signature-verified webhook, and brute-force rate limiting are implemented. Two real XSS (cross-site scripting) gaps in how customer-provided text was rendered were found and fixed during development. The owner can now permanently delete a conversation, though there's no automatic data-retention policy yet. Customer-data masking and reveal logging are still demonstration-only, and there is no encryption at rest, per-employee access control, or persistent audit log yet.

### Can settings be saved?

Team members and platform connection credentials are saved to a real database and persist across sessions. Most other settings and toggles in the Settings page are still demonstration-only and do not persist after reload.

### Does the platform use artificial intelligence?

The current repository mainly uses structured mock reports, deterministic calculations, search rules, and a rule-based file parser. A production intelligent analysis service is not connected.

### Is the platform ready for production?

Closer than before, but not fully. Real authentication, a real database, an automated backend test suite (48 tests) with CI on both repositories, and a real WhatsApp integration all exist and have been proven working — but WhatsApp is currently disconnected (see above), there's no production monitoring/alerting, no browser/end-to-end test suite, and some real-conversation analytics (employee attribution, revenue extraction, multi-message conversation grouping) are still placeholders.

## Investor Overview

### Market Problem

Businesses increasingly receive leads and customer conversations through fragmented digital channels. Owners struggle to connect message activity to bookings, revenue, employee performance, and lost opportunities.

Existing tools often provide either:

- Communication records without clear business intelligence.
- Dashboards without evidence.
- CRM workflows that require heavy manual maintenance.
- Marketing reports that stop before the customer conversation.

### Solution

Owner Platform provides an owner-focused investigation layer that connects outcomes to source conversations.

Its intended value is:

- Faster owner understanding.
- Clear source attribution.
- Evidence-backed employee coaching.
- Detection of CNC and missed opportunities.
- Revenue journey visibility.
- Privacy-controlled conversation intelligence.

### Competitive Advantage

The platform's intended differentiators are:

- Evidence-first design.
- Owner-first outcome prioritization.
- Conversation-level traceability.
- CNC as a first-class business metric.
- Bilingual Arabic and English experience.
- Cross-platform source, campaign, employee, and conversation investigation.
- Separation of estimated revenue from future confirmed revenue.
- Privacy-first operating philosophy.

### Current Investment Stage

The repository has moved from a static MVP to an early production system: it has persistent infrastructure (a PostgreSQL database behind an Express backend), real owner authentication, automated testing (48 tests) with CI on both repositories, and a signature-verified WhatsApp integration proven working end-to-end (real receive + real in-platform reply) — currently disconnected while the team works out a client requirement (using WhatsApp's own app and the platform simultaneously on one number). It does not yet have production monitoring or live paying customers represented in the codebase.

### Future Opportunities

- Real-time business conversation intelligence.
- Revenue attribution across messaging and advertising channels.
- Employee coaching and quality management.
- Privacy-focused analytics for regulated and sensitive industries.
- Confirmed revenue reconciliation.
- Multi-location and multi-business reporting.
- Partner integrations with CRMs, payment providers, and communication platforms.

### Key Execution Requirement

The most important next step is not adding more interface features. One real, signature-verified integration (WhatsApp) has already been proven end-to-end from conversation to dashboard to reply — the immediate priority is reconnecting it (either the previously-working setup or Meta's Coexistence feature) and getting Meta Business Verification done so real clients can self-connect their own accounts. Beyond that: real employee attribution, real revenue extraction, evidence-first conversation grouping, and production monitoring.
