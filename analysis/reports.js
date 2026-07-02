export const createReport = ({
  summary,
  interest,
  response,
  bookingQuality,
  missed,
  objections,
  sentiment,
  notes,
  recommendation,
  messages,
}) => ({
  summary,
  interest,
  response,
  bookingQuality,
  missed,
  objections,
  sentiment,
  notes,
  recommendation,
  messages,
});

export const calculateConversationScore = (conversationOrBooking) => conversationOrBooking.score || 0;

export const detectBookingAttempt = (conversationOrBooking) =>
  Boolean(conversationOrBooking.bookingAttempt ?? conversationOrBooking.report?.bookingQuality);

export const detectMissedOpportunity = (conversationOrBooking, hasMissedIssue) =>
  Boolean(conversationOrBooking.missedOpportunity ?? hasMissedIssue?.(conversationOrBooking));

export const buildConversationReport = (booking) => booking.report;
