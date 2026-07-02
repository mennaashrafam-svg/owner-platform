# Business Logic

## Important: Two Outcome Systems

The current MVP has separate outcome logic for live dashboard mock data and Analyze File uploads.

## Live Dashboard Logic

Live rows are classified by score in `analysis/metrics.js`:

| Score | Outcome |
|---|---|
| 83 or higher | Confirmed |
| 80 to 82 | Pending |
| 76 to 79 | CNC |
| 75 or lower | Missed Opportunity |

This is prototype logic and must not be described as real booking detection.

The current live equation is:

```text
Conversations = Confirmed + Missed Opportunities + CNC + Pending
29 = 14 + 3 + 6 + 6
```

## Analyze File Classification Priority

1. Read explicit Result, Status, Outcome, or Classification.
2. Normalize English and Arabic text.
3. Detect explicit outcome signals.
4. If no outcome exists but appointment/follow-up language exists, classify Pending.
5. Otherwise classify CNC.

## Booking Logic

### Live

A score of 83 or higher is treated as Confirmed.

### Analyze File

Confirmed is detected from explicit Booking, Confirmed Booking, Booking Confirmed, Booked, and supported Arabic equivalents.

Only Confirmed contributes to Estimated Revenue.

## Cancelled Booking Logic

- Implemented only in Analyze File.
- Detected from explicit cancellation language.
- Remains separate from Pending and CNC.
- Contributes zero revenue.

## CNC Logic

CNC means Conversation Not Closed.

### Live

Score 76 to 79.

### Analyze File

Detected from explicit CNC, Conversation Not Closed, no next step, no follow-up, or no booking request. It is also the fallback when no other outcome or pending signal exists.

Objection Only and Info Only must not count as CNC.

## Pending Logic

### Live

Score 80 to 82.

### Analyze File

Detected from explicit Pending, Open Lead, Follow-up Pending, supported Arabic equivalents, or general appointment/follow-up language without a stronger outcome.

Pending contributes zero revenue.

## Missed Opportunity Logic

### Live

Score 75 or lower.

### Analyze File

Detected from explicit Missed Opportunity or Lost Opportunity language and supported Arabic equivalents.

Potential revenue can appear in evidence but does not contribute to Estimated Revenue.

## Objection Logic

Outcome and objection are separate concepts.

Analyze File supports:

- Explicit Objection or Objections fields.
- Price.
- Trust.
- Pain.
- Location.
- Competition.
- Fear.
- Other explicit text retained as entered.

`summary.objections` counts conversations containing an objection. It does not count individual objection instances.

Objection Only is a separate explicit outcome and does not count as CNC or revenue.

## Info Only Logic

- Implemented only in Analyze File.
- Represents informational conversation without a commercial outcome.
- Does not count as booking, CNC, or revenue.

## Revenue Logic

### Live Estimated Revenue

Sum `booking.revenue` for live rows whose score-derived outcome is Confirmed.

### Analyze File Estimated Revenue

- Extract explicit value fields such as Booking Value, Value, Final Price, Revenue, Estimated Revenue, and Arabic equivalents.
- Values may appear on the same line or following line.
- Include value only when final outcome is Confirmed.
- Exclude Cancelled, Missed, CNC, Pending, Objection Only, and Info Only.

Confirmed Revenue is not implemented.

## Evidence Logic

### Live

Every row retains platform, source, content, employee, booking metadata, report fields, and messages. Drill-down state narrows the visible row IDs and opens the selected conversation.

### Analyze File

Every parsed conversation preserves its original source block in `evidence`, plus classification reason, source, employee, revenue, objection, and recommendation.

The intended rule is:

```text
Number -> Evidence -> Conversation -> Truth
```

Known limitation: some live metrics use score proxies, so evidence explains the row but does not independently prove the score-derived outcome.

