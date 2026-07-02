import { parseConversationFileText } from "../analysis/fileParser.js";

const outcomes = [
  "Confirmed Booking",
  "Confirmed Booking",
  "Confirmed Booking",
  "Confirmed Booking",
  "Missed Opportunity",
  "Missed Opportunity",
  "Missed Opportunity",
  "CNC",
  "Conversation Not Closed",
  "Pending",
];

const revenue = [5000, 4200, 6000, 4000, 0, 0, 0, 0, 0, 0];

const content = outcomes
  .map(
    (outcome, index) => `
Conversation ${index + 1}
Source: ${index % 2 ? "Instagram" : "WhatsApp"}
Employee: ${index % 3 ? "Ahmad" : "Samar"}
${revenue[index] ? `Employee: The package costs AED ${revenue[index]}` : ""}
Status: ${outcome}
${revenue[index] ? `Value: AED ${revenue[index]}` : ""}
Evidence: full conversation ${index + 1}
`.trim(),
  )
  .join("\n---\n") + `

EXPECTED RESULTS
CONFIRMED BOOKINGS = 4
ESTIMATED REVENUE = AED 19,200
`;

const expected = {
  conversations: 10,
  confirmed: 4,
  missed: 3,
  cnc: 2,
  pending: 1,
  revenue: 19200,
};

const result = parseConversationFileText(content, "validation.txt");
const failures = Object.entries(expected).filter(([key, value]) => result.summary[key] !== value);

if (failures.length || result.conversations.some((conversation) => !conversation.evidence)) {
  console.error(JSON.stringify({ expected, actual: result.summary, failures }, null, 2));
  process.exit(1);
}

const taxonomyContent = [
  ...Array.from({ length: 6 }, (_, index) => `Conversation B-${index + 1}\nStatus: Confirmed Booking\nValue: AED ${[9000, 500, 6500, 1200, 3500, 800][index]}`),
  ...Array.from({ length: 4 }, (_, index) => `Conversation M-${index + 1}\nResult: Missed Opportunity`),
  ...Array.from({ length: 3 }, (_, index) => `Conversation C-${index + 1}\nResult: CNC`),
  ...Array.from({ length: 3 }, (_, index) => `Conversation P-${index + 1}\nResult: Pending`),
  ...Array.from({ length: 3 }, (_, index) => `Conversation O-${index + 1}\nResult: Objection Only\nObjection: ${["Price", "Location", "Fear"][index]}`),
  `Conversation I-1\nEmployee: Whitening starts from AED 1500.\nResult: Info Only

EXPECTED RESULTS
CONFIRMED BOOKINGS = 6
CNC = 3
ESTIMATED REVENUE = AED 21,500`,
].join("\n---\n");

const taxonomyExpected = {
  conversations: 20,
  confirmed: 6,
  missed: 4,
  cnc: 3,
  pending: 3,
  objection: 3,
  info: 1,
  objections: 3,
  revenue: 21500,
};
const taxonomyResult = parseConversationFileText(taxonomyContent, "taxonomy-validation.txt");
const taxonomyFailures = Object.entries(taxonomyExpected).filter(([key, value]) => taxonomyResult.summary[key] !== value);

if (taxonomyFailures.length) {
  console.error(JSON.stringify({ expected: taxonomyExpected, actual: taxonomyResult.summary, failures: taxonomyFailures }, null, 2));
  process.exit(1);
}

const realWorldContent = `
Conversation ID: RW-001
Customer: غالي
Employee: في عرض 8500
Customer: إذا عملتها 8000 بحجز
Employee: تم الحجز
RESULT:
BOOKING
FINAL PRICE:
8000
---
Conversation ID: RW-002
Employee: تم حجز موعد السبت
Customer: اسف الغي الموعد
Employee: تم الإلغاء
RESULT:
CANCELLED BOOKING
---
Conversation ID: RW-003
Employee: 5000 AED
Customer: Too expensive
Customer: Let me think
RESULT:
PENDING
---
Conversation ID: RW-004
Employee: تم الحجز
RESULT:
BOOKING
VALUE:
4500
---
Conversation ID: RW-005
Customer: What is the next step?
Employee: We are the best.
RESULT:
CNC
---
Conversation ID: RW-006
Customer: غالي
Employee: جودة ممتازة
RESULT:
MISSED OPPORTUNITY
---
Conversation ID: RW-007
Employee: تم الحجز
RESULT:
BOOKING
VALUE:
7000
---
Conversation ID: RW-008
Customer: السعر غالي وعندي عرض أرخص
RESULT:
OBJECTION ONLY
---
Conversation ID: RW-009
Employee: Confirmed
RESULT:
BOOKING
VALUE:
3000
---
Conversation ID: RW-010
Customer: برجعلك
RESULT:
PENDING
`;
const realWorldExpected = {
  conversations: 10,
  confirmed: 4,
  cancelled: 1,
  missed: 1,
  cnc: 1,
  pending: 2,
  objection: 1,
  objections: 4,
  revenue: 22500,
};
const realWorldResult = parseConversationFileText(realWorldContent, "real-world-validation.txt");
const realWorldFailures = Object.entries(realWorldExpected).filter(([key, value]) => realWorldResult.summary[key] !== value);

if (realWorldFailures.length) {
  console.error(JSON.stringify({ expected: realWorldExpected, actual: realWorldResult.summary, failures: realWorldFailures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ baseline: result.summary, taxonomy: taxonomyResult.summary, realWorld: realWorldResult.summary }, null, 2));
