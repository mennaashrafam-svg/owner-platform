const noMissedIssueLabels = [
  "none",
  "no major missed issue",
  "no major missed opportunity",
  "لا يوجد",
  "لا توجد مشكلة ضائعة مؤثرة",
  "لا توجد فرصة ضائعة مؤثرة",
];

export const countBookings = (contents) => contents.reduce((sum, content) => sum + content.bookings.length, 0);

export const getPlatformTotal = (platform) => platform.sources.reduce((sum, source) => sum + countBookings(source.contents), 0);

export const getSourceTotal = (source) => countBookings(source.contents);

export const filterPlatformsByIds = (platforms, ids) => {
  if (!ids) return platforms;
  const allowed = new Set(ids);
  return platforms
    .map((platform) => ({
      ...platform,
      sources: platform.sources
        .map((source) => ({
          ...source,
          contents: source.contents
            .map((content) => ({
              ...content,
              bookings: content.bookings.filter((booking) => allowed.has(booking.id)),
            }))
            .filter((content) => content.bookings.length),
        }))
        .filter((source) => source.contents.length),
    }))
    .filter((platform) => platform.sources.length);
};

export const getAllBookingRowsFromPlatforms = (platforms) =>
  platforms.flatMap((platform) =>
    platform.sources.flatMap((source) =>
      source.contents.flatMap((content) =>
        content.bookings.map((booking) => ({
          platform,
          source,
          content,
          booking,
        })),
      ),
    ),
  );

export const hasMissedIssueForLanguage = (booking, language = "en") => {
  const missed = String(booking.report.missed?.[language] || booking.report.missed?.en || "").toLowerCase();
  return !noMissedIssueLabels.includes(missed);
};

export const getConversationOutcome = (booking) => {
  if (booking.score >= 83) return "confirmed";
  if (booking.score <= 75) return "missed";
  if (booking.score <= 79) return "cnc";
  return "pending";
};

export const rowsForOutcome = (rows, outcome) => rows.filter(({ booking }) => getConversationOutcome(booking) === outcome);

export const summarizeOutcomes = (rows) => ({
  conversations: rows.length,
  confirmedBookings: rowsForOutcome(rows, "confirmed").length,
  missedOpportunities: rowsForOutcome(rows, "missed").length,
  cnc: rowsForOutcome(rows, "cnc").length,
  pendingLeads: rowsForOutcome(rows, "pending").length,
});

export const metricRowsForKey = (rows, metricKey) => {
  if (metricKey === "confirmedBookings" || metricKey === "revenueInsights") return rowsForOutcome(rows, "confirmed");
  if (metricKey === "missedOpportunities") return rowsForOutcome(rows, "missed");
  if (metricKey === "cnc") return rowsForOutcome(rows, "cnc");
  return rows;
};

export const averageScore = (rows) => (rows.length ? Math.round(rows.reduce((sum, { booking }) => sum + booking.score, 0) / rows.length) : 0);

export const revenueSum = (rows) => rows.reduce((sum, { booking }) => sum + booking.revenue, 0);

export const calculateConversationScore = (conversationOrBooking) => conversationOrBooking.score ?? conversationOrBooking.booking?.score ?? 0;

export const detectBookingAttempt = (booking) => Boolean(booking.report?.bookingQuality);

export const detectMissedOpportunity = (booking) => getConversationOutcome(booking) === "missed";

export const detectCnc = (booking) => getConversationOutcome(booking) === "cnc";

const responseSpeedScore = (rows) => {
  if (!rows.length) return 0;
  return Math.round(
    rows.reduce((sum, { booking }) => {
      const hour = Number(String(booking.time || "18:00").split(":")[0]);
      return sum + (hour <= 12 ? 92 : hour <= 16 ? 84 : 76);
    }, 0) / rows.length,
  );
};

export const calculateOutcomePerformance = (rows) => {
  if (!rows.length) return 0;
  const summary = summarizeOutcomes(rows);
  const bookingRate = (summary.confirmedBookings / summary.conversations) * 100;
  const missedControl = 100 - (summary.missedOpportunities / summary.conversations) * 100;
  const cncControl = 100 - (summary.cnc / summary.conversations) * 100;
  return Math.round(
    bookingRate * 0.35 +
      missedControl * 0.2 +
      cncControl * 0.15 +
      averageScore(rows) * 0.2 +
      responseSpeedScore(rows) * 0.1,
  );
};

export const calculateBusinessHealth = (rows) => calculateOutcomePerformance(rows);

export const calculatePlatformPerformance = (platform) => calculateOutcomePerformance(getAllBookingRowsFromPlatforms([platform]));

export const calculateAgentPerformance = (rows) => {
  const summary = summarizeOutcomes(rows);
  return {
    totalConversations: summary.conversations,
    confirmedBookings: summary.confirmedBookings,
    missedOpportunities: summary.missedOpportunities,
    cnc: summary.cnc,
    pendingLeads: summary.pendingLeads,
    averageResponseQuality: averageScore(rows),
    responseSpeedScore: responseSpeedScore(rows),
    performanceScore: calculateOutcomePerformance(rows),
  };
};
