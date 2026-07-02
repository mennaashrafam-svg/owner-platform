/**
 * Central data store for the Owner Platform dashboard.
 * Uses mock data today; swap `loadPlatformData` for a real API later.
 */
const validatePlatformData = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Platform data must be an object.");
  }
  if (!Array.isArray(payload.bookingSources)) {
    throw new Error("Platform data must include bookingSources.");
  }
  if (!Array.isArray(payload.conversations)) {
    throw new Error("Platform data must include conversations.");
  }
  return payload;
};

export const createPlatformDataStore = (initialData) => {
  let current = validatePlatformData(initialData);

  return {
    get: () => current,
    set: (nextData) => {
      current = validatePlatformData(nextData);
      return current;
    },
    async loadFromApi(url, options = {}) {
      const apiUrl = url || "https://my-server-production-0e71.up.railway.app/api/conversations";
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl, {
        headers: { 
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(options.headers || {}) 
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }
      const payload = await response.json();
      return this.set(payload);
    },
  };
};

export const createDashboardMetrics = (rows, helpers) => {
  const {
    calculateBusinessHealth,
    summarizeOutcomes,
    metricRowsForKey,
    averageScore,
    calculateOutcomePerformance,
    revenueSum,
    getMostImportantRecommendation,
    getBestEmployeeGroup,
    getBiggestProblemRows,
    local,
    text,
    businessHealthStatus,
  } = helpers;

  const summary = summarizeOutcomes(rows);
  const healthScore = calculateBusinessHealth(rows);
  const problemRows = getBiggestProblemRows();
  const bestEmployee = getBestEmployeeGroup();

  return {
    healthScore,
    healthStatus: businessHealthStatus(healthScore),
    overallScore: healthScore,
    biggestProblem: problemRows[0] ? local(problemRows[0].booking.report.missed) : text("home.defaultProblem"),
    bestEmployee: bestEmployee ? local(bestEmployee.profile.name) : "-",
    confirmedBookings: String(metricRowsForKey(rows, "confirmedBookings").length),
    analyzedConversations: String(summary.conversations),
    missedOpportunities: String(summary.missedOpportunities),
    averageQuality: `${averageScore(rows)}%`,
    recommendation: getMostImportantRecommendation(rows),
    platformPerformance: `${calculateOutcomePerformance(rows)}%`,
    agentPerformance: `${calculateOutcomePerformance(rows)}%`,
    revenue: helpers.formatCurrency(revenueSum(metricRowsForKey(rows, "revenueInsights"))),
    summary,
  };
};
