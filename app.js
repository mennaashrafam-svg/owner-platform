import { translations } from "./i18n/translations.js";
import { data as initialPlatformData, bookingDates } from "./data/mockData.js";
import { createPlatformDataStore, createDashboardMetrics } from "./data/dataService.js";
import { agentProfiles } from "./data/agents.js";
import { businessSettings, connectionSettings, alertSettings, privacySettings } from "./data/settingsData.js";
import { createInitialAppState } from "./settings/settingsState.js";
import { normalizeSearchText, searchRows as runSearchRows, textHaystack as buildTextHaystack } from "./search/search.js";
import { findAgentById, findAgentByAlias, findAgentByTaggedMessages } from "./analysis/agentDetection.js";
import { countBookings, getPlatformTotal, getSourceTotal, filterPlatformsByIds, getAllBookingRowsFromPlatforms, hasMissedIssueForLanguage, metricRowsForKey, averageScore, revenueSum, calculateAgentPerformance, calculatePlatformPerformance, calculateConversationScore, calculateBusinessHealth, calculateOutcomePerformance, getConversationOutcome, summarizeOutcomes } from "./analysis/metrics.js";
import { buildIntelligenceAlerts as buildAlerts } from "./analysis/alerts.js";
import { parseConversationFileText } from "./analysis/fileParser.js";
import { readAnalysisFile } from "./analysis/fileReader.js";
import { bookingMeta, reportField, signalTile, badge, agentKpi, searchStat, settingsField, settingsSection } from "./ui/components.js";
import { auditLog, maskName, maskPhone, logSensitiveReveal } from "./privacy/privacy.js";
import "./integrations/index.js";

const platformStore = createPlatformDataStore(initialPlatformData);
const getData = () => platformStore.get();
const initialState = createInitialAppState(getData());
let currentLang = initialState.language;
let currentView = initialState.view;
let currentTheme = initialState.theme;
let selectedConversationId = initialState.selectedConversationId;
let dateRange = initialState.dateRange;
let bookingDrill = initialState.bookingDrill;
let agentOverrides = initialState.agentOverrides;
let searchQuery = initialState.searchQuery;
let activeReportContext = null;
let revealedSensitiveFields = new Set();
let fileAnalysisResult = null;
let fileAnalysisDrill = { type: null, conversationId: null, search: "" };
document.body.dataset.currentView = currentView;

const text = (key) => translations[currentLang][key] || key;
const fileErrorMessage = (code) => {
  const keyByCode = {
    "invalid-file": "file.readError",
    "empty-file": "file.emptyFile",
    "file-too-large": "file.fileTooLarge",
    "unreadable-text": "file.readError",
    "unsupported-format": "file.unsupportedFormat",
    "unsupported-docx": "file.unsupportedDocx",
    "unsupported-pdf": "file.unsupportedPdf",
    "unsupported-zip": "file.unsupportedZip",
  };
  return text(keyByCode[code] || "file.readError");
};
const safeRun = (label, fn, fallback = null) => {
  try {
    return fn();
  } catch (error) {
    console.error(`[Owner Platform] ${label}`, error);
    showAppError(text("app.renderError"));
    return fallback;
  }
};
const safeRunAsync = async (label, fn, fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[Owner Platform] ${label}`, error);
    showAppError(text("app.renderError"));
    return fallback;
  }
};
const showAppError = (message) => {
  const banner = document.getElementById("app-error-banner");
  if (!banner) return;
  banner.hidden = false;
  banner.textContent = message;
};
const clearAppError = () => {
  const banner = document.getElementById("app-error-banner");
  if (!banner) return;
  banner.hidden = true;
  banner.textContent = "";
};
const setTextContent = (id, value, fallback = "-") => {
  const node = document.getElementById(id);
  if (node) node.textContent = value ?? fallback;
};
const local = (value) => value[currentLang] || value.en;
const pluralBooking = (count) => (count === 1 ? text("bookings.booking") : text("bookings.bookings"));
const isWithinDateRange = (booking) => (!dateRange.from || booking.date >= dateRange.from) && (!dateRange.to || booking.date <= dateRange.to);
const getVisiblePlatforms = () =>
  getData().bookingSources
    .map((platform) => ({
      ...platform,
      sources: platform.sources
        .map((source) => ({
          ...source,
          contents: source.contents
            .map((content) => ({
              ...content,
              bookings: content.bookings.filter(isWithinDateRange),
            }))
            .filter((content) => content.bookings.length),
        }))
        .filter((source) => source.contents.length),
    }))
    .filter((platform) => platform.sources.length);
const getDrillPlatforms = () => filterPlatformsByIds(getVisiblePlatforms(), bookingDrill.contextIds);
const getAllBookingRows = () => getAllBookingRowsFromPlatforms(getVisiblePlatforms());
const getDrillRows = () => getAllBookingRowsFromPlatforms(getDrillPlatforms());
const hasMissedIssue = (booking) => hasMissedIssueForLanguage(booking, currentLang);
const isMissedOpportunity = (booking) => getConversationOutcome(booking) === "missed";
const isCnc = (booking) => getConversationOutcome(booking) === "cnc";
const hasRealObjection = (booking) => {
  const objection = normalizeSearchText(local(booking.report.objections));
  return Boolean(objection && !["none", "no objection", "لا يوجد", "بدون اعتراض"].map(normalizeSearchText).includes(objection));
};
const metricRows = (rows = getAllBookingRows()) => metricRowsForKey(rows, bookingDrill.metricKey, currentLang);
const rowsForLatestVisibleDate = (rows = getAllBookingRows()) => {
  const latestDate = rows.reduce((latest, { booking }) => (booking.date > latest ? booking.date : latest), "");
  return latestDate ? rows.filter(({ booking }) => booking.date === latestDate) : rows;
};
const dateToTime = (date) => new Date(`${date}T00:00:00`).getTime();
const addDays = (date, days) => {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day));
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};
const getDateAnchor = (rows = getAllBookingRows()) => rows.reduce((latest, { booking }) => (booking.date > latest ? booking.date : latest), "");
const rowsForDate = (date, rows = getAllBookingRows()) => (date ? rows.filter(({ booking }) => booking.date === date) : []);
const rowsForLastDays = (days = 7, rows = getAllBookingRows()) => {
  const anchor = getDateAnchor(rows);
  if (!anchor) return [];
  const from = addDays(anchor, -(days - 1));
  return rows.filter(({ booking }) => booking.date >= from && booking.date <= anchor);
};
const rowsForTodayContext = (rows = getAllBookingRows()) => rowsForDate(getDateAnchor(rows), rows);
const conversionRateForRows = (rows) => {
  const summary = summarizeOutcomes(rows);
  return summary.conversations ? `${((summary.confirmedBookings / summary.conversations) * 100).toFixed(1)}%` : "0%";
};
const timeContextLabel = () => {
  const rows = getAllBookingRows();
  const anchor = getDateAnchor(rows);
  if (!dateRange.from && !dateRange.to) return text("period.all");
  if (!anchor) return `${text("period.custom")}: ${dateRange.from || "..."} - ${dateRange.to || "..."}`;
  if (dateRange.from === anchor && dateRange.to === anchor) return text("period.today");
  if (dateRange.from === addDays(anchor, -6) && dateRange.to === anchor) return text("period.last7");
  if (dateRange.from === addDays(anchor, -29) && dateRange.to === anchor) return text("period.last30");
  return `${text("period.custom")}: ${dateRange.from || "..."} - ${dateRange.to || "..."}`;
};
const rowsForAgent = (agentId, rows = getAllBookingRows()) => rows.filter(({ booking }) => getResponsibleAgentId(booking) === agentId);
const groupedRowsByAgent = (rows = getAllBookingRows()) =>
  agentProfiles
    .map((profile) => ({
      profile,
      rows: rowsForAgent(profile.id, rows),
    }))
    .filter((group) => group.rows.length);
const getConfirmedBookingsTotal = () => getAllBookingRows().length;
const findPlatform = () => getDrillPlatforms().find((platform) => platform.id === bookingDrill.platformId);
const findSource = () => findPlatform()?.sources.find((source) => source.id === bookingDrill.sourceId);
const findContent = () => findSource()?.contents.find((content) => content.id === bookingDrill.contentId);
const findBooking = () => findContent()?.bookings.find((booking) => booking.id === bookingDrill.bookingId);
const formatCurrency = (value) => `AED ${Math.round(value).toLocaleString("en-US")}`;
const metricLabelKeys = {
  confirmedBookings: "metrics.confirmedBookings",
  analyzedConversations: "metrics.conversations",
  missedOpportunities: "metrics.missed",
  cnc: "metrics.cnc",
  averageQuality: "metrics.response",
  aiRecommendations: "metrics.aiRecommendations",
  platformPerformance: "metrics.platformPerformance",
  agentPerformance: "metrics.agentPerformance",
  revenueInsights: "metrics.revenueInsights",
};
const metricTitle = () => text(metricLabelKeys[bookingDrill.metricKey] || "bookings.title");
const metricTitleFor = (metricKey) => text(metricLabelKeys[metricKey] || "bookings.title");
const getMetricValue = (rows = getAllBookingRows(), key = bookingDrill.metricKey) => {
  const relevantRows = metricRowsForKey(rows, key, currentLang);
  if (key === "averageQuality") return `${averageScore(relevantRows)}%`;
  if (key === "platformPerformance" || key === "agentPerformance") return `${calculateOutcomePerformance(relevantRows)}%`;
  if (key === "revenueInsights") return formatCurrency(revenueSum(relevantRows));
  return String(relevantRows.length);
};
const rowsForPlatform = (platform) =>
  platform.sources.flatMap((source) =>
    source.contents.flatMap((content) => content.bookings.map((booking) => ({ platform, source, content, booking }))),
  );
const rowsForSource = (platform, source) =>
  source.contents.flatMap((content) => content.bookings.map((booking) => ({ platform, source, content, booking })));
const rowsForContent = (platform, source, content) => content.bookings.map((booking) => ({ platform, source, content, booking }));
const rowsForContentAgent = (platform, source, content, agentId) => rowsForContent(platform, source, content).filter(({ booking }) => getResponsibleAgentId(booking) === agentId);
const hasMetricSignal = (rows) => metricRows(rows).length > 0;
const findRowByBookingId = (bookingId) => getAllBookingRows().find(({ booking }) => booking.id === bookingId);
const getConversationDate = (conversation, index = 0) => conversation.date || bookingDates[index % bookingDates.length];
const getVisibleConversations = () =>
  getData().conversations.filter((conversation, index) => {
    const date = getConversationDate(conversation, index);
    return (!dateRange.from || date >= dateRange.from) && (!dateRange.to || date <= dateRange.to);
  });
const agentName = (profile) => (profile ? local(profile.name) : "");
const getResponsibleAgentProfile = (booking) => findAgentById(agentOverrides[booking.id]) || findAgentByTaggedMessages(booking.report) || findAgentByAlias(booking.employee);
const getResponsibleAgentName = (booking) => agentName(getResponsibleAgentProfile(booking)) || local(booking.employee);
const getResponsibleAgentId = (booking) => getResponsibleAgentProfile(booking)?.id || "unassigned";
const getAgentDisplayNameById = (agentId) => agentName(findAgentById(agentId)) || (currentLang === "ar" ? "غير محدد" : "Unassigned");
const getAgentDetectionMode = (booking) => (agentOverrides[booking.id] ? text("agents.manual") : text("agents.detected"));
const outcomeLabel = (booking) => text(`outcomes.${getConversationOutcome(booking)}`);
const cncLabel = () => `<span class="info-label" title="${text("cnc.tooltip")}">${text("metrics.cnc")} ⓘ</span>`;
const responseSpeed = (rows) => {
  const score = averageScore(rows);
  if (score >= 86) return currentLang === "ar" ? "سريع جدا" : "Very fast";
  if (score >= 78) return currentLang === "ar" ? "سريع" : "Fast";
  return currentLang === "ar" ? "يحتاج متابعة أسرع" : "Needs faster follow-up";
};
const businessHealthStatus = (score) => {
  if (score >= 90) return text("home.excellent");
  if (score >= 78) return text("home.healthy");
  if (score >= 62) return text("home.needsAttention");
  return text("home.critical");
};
const getBiggestProblemRows = () => {
  const missedRows = getAllBookingRows()
    .filter(({ booking }) => isMissedOpportunity(booking) || isCnc(booking))
    .sort((a, b) => a.booking.score - b.booking.score);
  const mainProblem = missedRows[0];
  if (!mainProblem) return [];
  const issueKey = mainProblem.booking.report.missed.en;
  return missedRows.filter(({ booking }) => booking.report.missed.en === issueKey);
};
const getBestEmployeeGroup = () => {
  const groups = groupedRowsByAgent(getAllBookingRows());
  return groups.sort((a, b) => calculateOutcomePerformance(b.rows) - calculateOutcomePerformance(a.rows) || b.rows.length - a.rows.length)[0] || null;
};
const getMostImportantRecommendation = (rows = getAllBookingRows()) => {
  const priority = { missed: 0, cnc: 1, pending: 2, confirmed: 3 };
  const row = [...rows].sort(
    (a, b) =>
      priority[getConversationOutcome(a.booking)] - priority[getConversationOutcome(b.booking)] ||
      a.booking.score - b.booking.score,
  )[0];
  return row ? local(row.booking.report.recommendation) : "-";
};
const agentTrainingRecommendation = (rows) => {
  const cnc = rows.find(({ booking }) => isCnc(booking));
  if (cnc) return text("cnc.recommendation");
  const missed = rows.find(({ booking }) => isMissedOpportunity(booking));
  if (missed) return local(missed.booking.report.recommendation);
  return currentLang === "ar" ? "حافظ على نص الإغلاق الحالي وشارك أفضل المحادثات مع الفريق." : "Keep the current closing script and share best conversations with the team.";
};
const searchOptions = () => ({
  translations,
  agentProfiles,
  getResponsibleAgentProfile,
  localize: local,
});
const textHaystack = (row) => buildTextHaystack(row, searchOptions());
const searchRows = () => {
  const rows = runSearchRows({
    query: searchQuery,
    rows: getAllBookingRows(),
    ...searchOptions(),
  });
  const agentProfile = findAgentProfileFromSearchQuery();
  return agentProfile ? rows.filter(({ booking }) => getResponsibleAgentProfile(booking)?.id === agentProfile.id) : rows;
};
const normalizedProfileValues = (profile) =>
  [
    profile.name.en,
    profile.name.ar,
    ...profile.tags,
    ...profile.aliases,
  ].filter(Boolean).map(normalizeSearchText);
const findAgentProfileFromSearchQuery = () => {
  const query = normalizeSearchText(searchQuery);
  if (!query) return null;
  return agentProfiles.find((profile) =>
    normalizedProfileValues(profile).some((value) => value && (query === value || query.includes(value) || value.includes(query))),
  ) || null;
};
const searchContextRowsFor = (selectedRow) => {
  const agentProfile = findAgentProfileFromSearchQuery();
  if (agentProfile) {
    return getAllBookingRows().filter(({ booking }) => getResponsibleAgentProfile(booking)?.id === agentProfile.id);
  }
  return searchQuery.trim() ? searchRows() : selectedRow ? [selectedRow] : [];
};
const createReportContext = (rows, label) => {
  const ids = [...new Set(rows.map((row) => row.booking.id))];
  return { ids, label };
};
const applyReportContext = (context) => {
  activeReportContext = context;
  bookingDrill.contextIds = context?.ids || null;
  bookingDrill.contextLabel = context?.label || null;
};
const openBookingFromRow = ({ platform, source, content, booking }, metricKey = "confirmedBookings", contextRowsOverride = null) => {
  const selectedRow = { platform, source, content, booking };
  const contextRows = contextRowsOverride || searchContextRowsFor(selectedRow);
  const context = createReportContext(contextRows, contextRowsOverride ? metricTitleFor(metricKey) : searchQuery.trim());
  resetBookingDrill(metricKey);
  applyReportContext(context);
  bookingDrill.platformId = platform.id;
  bookingDrill.sourceId = source.id;
  bookingDrill.contentId = content.id;
  bookingDrill.agentId = getResponsibleAgentId(booking);
  bookingDrill.bookingId = booking.id;
  bookingDrill.reportTab = "analysis";
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
};

function openProblemReport() {
  const rows = getBiggestProblemRows();
  if (!rows.length) return openBookingModal("missedOpportunities");
  openBookingFromRow(rows[0], "analyzedConversations", rows);
}

function openScopedRows(metricKey, rows, label) {
  resetBookingDrill(metricKey);
  applyReportContext(createReportContext(rows, label));
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
  document.querySelector("[data-close-booking-modal]")?.focus();
}

function openTodayBookings() {
  const rows = rowsForTodayContext();
  openScopedRows("confirmedBookings", rows, text("home.newBookings"));
}

function openTodayConversations() {
  const rows = rowsForTodayContext();
  openScopedRows("analyzedConversations", rows, text("home.messagesToday"));
}

function openBestEmployeeReport() {
  const group = getBestEmployeeGroup();
  if (!group) return openBookingModal("agentPerformance");
  resetBookingDrill("confirmedBookings");
  applyReportContext(createReportContext(group.rows, local(group.profile.name)));
  bookingDrill.contextType = "employee";
  bookingDrill.employeeId = group.profile.id;
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
  document.querySelector("[data-close-booking-modal]")?.focus();
}

function openEmployeeReport(agentId) {
  const profile = findAgentById(agentId);
  const rows = rowsForAgent(agentId, getAllBookingRows());
  if (!profile || !rows.length) return;
  resetBookingDrill("confirmedBookings");
  applyReportContext(createReportContext(rows, local(profile.name)));
  bookingDrill.contextType = "employee";
  bookingDrill.employeeId = agentId;
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
}

function openPlatformReport(platformId) {
  const platform = getVisiblePlatforms().find((item) => item.id === platformId);
  if (!platform) {
    resetBookingDrill("confirmedBookings");
    applyReportContext(createReportContext([], text("platforms.title")));
    bookingDrill.contextType = "platform";
    bookingDrill.platformId = platformId;
    const modal = document.getElementById("booking-breakdown-modal");
    modal.hidden = false;
    document.body.classList.add("modal-open");
    renderBookingBreakdown();
    return;
  }
  const rows = rowsForPlatform(platform);
  resetBookingDrill("confirmedBookings");
  applyReportContext(createReportContext(rows, local(platform.platform)));
  bookingDrill.contextType = "platform";
  bookingDrill.platformId = platformId;
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
}

function openRiskReport(platformId) {
  const risk = buildRiskItems().find((item) => item.key === platformId);
  if (!risk) return openScopedRows("missedOpportunities", [], text("risk.title"));
  const rows = risk.rows;
  resetBookingDrill("analyzedConversations");
  applyReportContext(createReportContext(rows, risk.title));
  bookingDrill.contextType = "risk";
  bookingDrill.riskKey = risk.key;
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
}

function applyLanguage(lang) {
  safeRun("applyLanguage", () => {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = text(node.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", text(node.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", text(node.dataset.i18nTitle));
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });

    document.querySelector("[data-close-booking-modal]")?.setAttribute("aria-label", text("bookings.close"));

    updateTitle();
    renderDashboard();
    renderAnalysis();
    renderPlatformNav();
    renderBookingBreakdown();
    renderUniversalSearch();
    renderIntelligenceAlerts();
    renderSettings();
    renderAnalyzeFile();
    renderFileAnalysisDetail();
  });
}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.dataset.colorTheme = theme;
  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function setView(view) {
  currentView = view;
  document.body.dataset.currentView = view;
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  document.getElementById(`${view}-view`).classList.add("active");

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  updateTitle();
}

function updateTitle() {
  const title = document.getElementById("page-title");
  if (currentView === "analysis") title.textContent = text("header.analysisTitle");
  else if (currentView === "analyze-file") title.textContent = text("header.analyzeFileTitle");
  else if (currentView === "settings") title.textContent = text("header.settingsTitle");
  else title.textContent = text("header.dashboardTitle");
}

function renderDashboard() {
  safeRun("renderDashboard", () => {
    const rows = getAllBookingRows();
    const dateFrom = document.getElementById("date-from");
    const dateTo = document.getElementById("date-to");
    if (dateFrom) dateFrom.value = dateRange.from;
    if (dateTo) dateTo.value = dateRange.to;

    const metrics = createDashboardMetrics(rows, {
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
      formatCurrency,
    });

    setTextContent("home-health-score", `${metrics.healthScore} / 100`);
    setTextContent("home-health-status", metrics.healthStatus);
    setTextContent("home-biggest-problem", metrics.biggestProblem);
    setTextContent("home-best-employee", metrics.bestEmployee);
    setTextContent("metric-confirmed-bookings", metrics.confirmedBookings);
    setTextContent("metric-conversations", metrics.analyzedConversations);
    setTextContent("metric-missed", metrics.missedOpportunities);
    setTextContent("metric-quality", metrics.averageQuality);
    setTextContent("metric-recommendations", metrics.recommendation);
    setTextContent("metric-platform-performance", metrics.platformPerformance);
    setTextContent("metric-agent-performance", metrics.agentPerformance);
    setTextContent("metric-revenue", metrics.revenue);
    setTextContent("overall-score", String(metrics.overallScore));
    setTextContent("dashboard-period-label", timeContextLabel());
    setTextContent("booking-modal-total", metrics.confirmedBookings);

    renderChannelBars();
    renderRiskRadar();
    renderPriorityList();
    renderAgentIntelligence();
    renderIntelligenceAlerts();
    renderUniversalSearch();
    renderPlatformNav();
    renderBookingBreakdown();
    renderSettings();
    renderAnalyzeFile();
    clearAppError();
  });
}

function renderExecutiveHome(rows = getAllBookingRows()) {
  const metrics = createDashboardMetrics(rows, {
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
    formatCurrency,
  });

  setTextContent("home-health-score", `${metrics.healthScore} / 100`);
  setTextContent("home-health-status", metrics.healthStatus);
  setTextContent("home-biggest-problem", metrics.biggestProblem);
  setTextContent("home-best-employee", metrics.bestEmployee);
}

function answerPlatformQuestion(query) {
  const answer = document.getElementById("ask-platform-answer");
  if (!answer) return;
  const normalized = normalizeSearchText(query);
  const rows = getAllBookingRows();
  const summary = summarizeOutcomes(rows);
  if (normalized.includes("cnc") || normalized.includes("اغلاق")) {
    answer.textContent = `${cncLabel().replace(/<[^>]+>/g, "")}: ${summary.cnc}. ${text("cnc.recommendation")}`;
  } else if (normalized.includes("miss") || normalized.includes("ضائع")) {
    answer.textContent = `${text("metrics.missed")}: ${summary.missedOpportunities}.`;
  } else if (normalized.includes("book") || normalized.includes("حجز")) {
    answer.textContent = `${text("metrics.confirmedBookings")}: ${summary.confirmedBookings}.`;
  } else {
    answer.textContent = `${text("home.health")}: ${calculateBusinessHealth(rows)} / 100 · ${text("search.conversations")}: ${summary.conversations}.`;
  }
}

function renderBookingBreakdown() {
  const rows = getDrillRows();
  document.getElementById("booking-breakdown-title").textContent = metricTitle();
  document.querySelector("[data-i18n='bookings.confirmedTotal']").textContent = metricTitle();
  document.getElementById("booking-modal-total").textContent = getMetricValue(rows);
  document.getElementById("booking-journey-toolbar").innerHTML = renderJourneyToolbar();
  const container = document.getElementById("booking-breakdown-list");

  if (bookingDrill.contextType === "risk") {
    container.innerHTML = renderRiskReportOverview();
    return;
  }

  if (bookingDrill.contextType === "employee" && !bookingDrill.platformId && !bookingDrill.bookingId) {
    container.innerHTML = renderEmployeeReportOverview();
    return;
  }

  if (bookingDrill.contextType === "platform" && bookingDrill.platformId && !bookingDrill.sourceId && !bookingDrill.bookingId) {
    container.innerHTML = renderPlatformReportOverview();
    return;
  }

  if (bookingDrill.bookingId) {
    container.innerHTML = renderBookingReport();
    return;
  }

  if (bookingDrill.agentId) {
    container.innerHTML = renderBookingList();
    return;
  }

  if (bookingDrill.contentId) {
    container.innerHTML = renderEmployeeBreakdown();
    return;
  }

  if (bookingDrill.sourceId) {
    container.innerHTML = renderContentBreakdown();
    return;
  }

  if (bookingDrill.platformId) {
    container.innerHTML = renderSourceBreakdown();
    return;
  }

  container.innerHTML = getDrillPlatforms().length ? renderPlatformBreakdown() : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderJourneyToolbar() {
  return `
    <div>
      <p class="eyebrow">${text("bookings.detailEyebrow")}</p>
      <h4>${getBookingJourneyTitle()}</h4>
      <span>${timeContextLabel()} · ${text("bookings.journey")}${bookingDrill.contextLabel ? ` · ${text("search.label")}: ${bookingDrill.contextLabel}` : ""}</span>
    </div>
    <div class="journey-actions">
      ${bookingDrill.platformId ? `<button class="text-button compact-button" data-booking-back type="button">${text("bookings.back")}</button>` : ""}
      ${bookingDrill.platformId ? `<button class="text-button compact-button" data-booking-reset type="button">${text("bookings.reset")}</button>` : ""}
    </div>
  `;
}

function getBookingJourneyTitle() {
  if (bookingDrill.contextType === "risk") return text("risk.title");
  if (bookingDrill.bookingId) return text("bookings.report");
  if (bookingDrill.agentId) return text("bookings.list");
  if (bookingDrill.contentId) return text("bookings.employees");
  if (bookingDrill.sourceId) return text("bookings.content");
  if (bookingDrill.platformId) return text("bookings.sources");
  return text("bookings.platforms");
}

function renderEmployeeReportOverview() {
  const employeeRows = getDrillRows();
  const profile = findAgentById(bookingDrill.employeeId) || getResponsibleAgentProfile(employeeRows[0]?.booking);
  const performance = calculateAgentPerformance(employeeRows);
  const allEmployeeGroups = groupedRowsByAgent(getAllBookingRows());
  const sortedRows = [...employeeRows].sort((a, b) => b.booking.score - a.booking.score);
  const best = sortedRows[0]?.booking.id || "-";
  const weakest = sortedRows[sortedRows.length - 1]?.booking.id || "-";
  const conversionRate = performance.totalConversations ? Math.round((performance.confirmedBookings / performance.totalConversations) * 100) : 0;
  const revenue = revenueSum(metricRowsForKey(employeeRows, "revenueInsights"));
  const objectionsHandled = employeeRows.filter(({ booking }) => hasRealObjection(booking) && getConversationOutcome(booking) === "confirmed").length;

  return `
    <section class="context-overview">
      <div class="report-header">
        <div>
          <p class="eyebrow">${text("agents.eyebrow")}</p>
          <h5>${profile ? local(profile.name) : text("agents.assignment")}</h5>
          <span>${text("employee.confirmedToday")}: ${performance.confirmedBookings}</span>
        </div>
        <span class="score-pill good">${performance.performanceScore}%</span>
      </div>
      <div class="report-grid">
        ${reportField(text("employee.confirmedToday"), performance.confirmedBookings)}
        ${reportField(text("agents.missed"), performance.missedOpportunities)}
        ${reportField(cncLabel(), performance.cnc)}
        ${reportField(text("employee.handled"), performance.totalConversations)}
        ${reportField(text("employee.revenueGenerated"), formatCurrency(revenue))}
        ${reportField(text("employee.conversionRate"), `${conversionRate}%`)}
        ${reportField(text("employee.objectionsHandled"), objectionsHandled)}
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("bookings.platforms")}</p>
        <div class="booking-breakdown-list">${renderPlatformBreakdown()}</div>
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("employee.performanceMetrics")}</p>
        <div class="report-grid">
          ${reportField(text("search.performance"), `${performance.performanceScore}%`)}
          ${reportField(text("agents.responseQuality"), `${performance.averageResponseQuality}%`)}
          ${reportField(text("agents.responseSpeed"), responseSpeed(employeeRows))}
        </div>
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("employee.bestWorst")}</p>
        <div class="report-grid">
          ${reportField(text("agents.best"), best)}
          ${reportField(text("agents.weakest"), weakest)}
          ${reportField(text("agents.training"), agentTrainingRecommendation(employeeRows))}
        </div>
      </div>
      <div class="employee-switch-list">
        <p class="eyebrow">${text("employee.allEmployees")}</p>
        <div class="signal-stack">
          ${allEmployeeGroups
            .map(
              ({ profile: itemProfile, rows }) => `
                <button class="text-button compact-button" data-employee-scope="${itemProfile.id}" type="button">
                  ${local(itemProfile.name)} · ${summarizeOutcomes(rows).confirmedBookings} ${text("agents.bookings")}
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("bookings.list")}</p>
        <div class="context-list">
          ${employeeRows
            .map(({ platform, source, content, booking }) => `
              <button class="booking-card drill-card" data-context-booking="${booking.id}" type="button" aria-label="${text("bookings.openBooking")}">
                <div class="booking-card-main">
                  <h5>${booking.id} · ${local(booking.client)}</h5>
                  <span>${local(platform.platform)} · ${text(`sources.${source.type}`)} · ${local(content.title)}</span>
                </div>
                <div class="booking-meta-grid">
                  ${bookingMeta(text("bookings.status"), outcomeLabel(booking))}
                  ${bookingMeta(text("bookings.time"), `${booking.date} · ${booking.time}`)}
                  ${bookingMeta(text("bookings.aiScore"), booking.score)}
                </div>
              </button>
            `)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPlatformReportOverview() {
  const platform = findPlatform();
  if (!platform) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  const platformRows = rowsForPlatform(platform);
  const summary = summarizeOutcomes(platformRows);
  const grouped = groupedRowsByAgent(platformRows).sort((a, b) => b.rows.length - a.rows.length);
  const mostActive = grouped[0];

  return `
    <section class="context-overview">
      <div class="report-header">
        <div>
          <p class="eyebrow">${text("platforms.title")}</p>
          <h5>${local(platform.platform)}</h5>
          <span>${text("bookings.confirmedTotal")}: ${summary.confirmedBookings}</span>
        </div>
        <span class="score-pill good">${calculateOutcomePerformance(platformRows)}%</span>
      </div>
      <div class="report-grid">
        ${reportField(text("bookings.confirmedTotal"), summary.confirmedBookings)}
        ${reportField(text("agents.missed"), summary.missedOpportunities)}
        ${reportField(cncLabel(), summary.cnc)}
        ${reportField(text("platform.mostActiveEmployee"), mostActive ? `${local(mostActive.profile.name)} · ${mostActive.rows.length}` : "-")}
        ${reportField(text("employee.handled"), summary.conversations)}
        ${reportField(text("agents.responseQuality"), `${calculateOutcomePerformance(platformRows)}%`)}
        ${reportField(text("explorer.revenue"), formatCurrency(revenueSum(metricRowsForKey(platformRows, "revenueInsights"))))}
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("bookings.sources")}</p>
        <div class="booking-breakdown-list">${renderSourceBreakdown()}</div>
      </div>
    </section>
  `;
}

function renderRiskReportOverview() {
  const rows = getDrillRows();
  const summary = summarizeOutcomes(rows);
  const first = rows[0];
  const platform = findPlatform() || first?.platform;
  const grouped = groupedRowsByAgent(rows).sort((a, b) => b.rows.length - a.rows.length);
  const employee = grouped[0]?.profile;
  const reason = bookingDrill.riskKey ? text(`risk.reason.${bookingDrill.riskKey}`) : first ? local(first.booking.report.missed) : text("explorer.noData");
  const recommendation = first ? local(first.booking.report.recommendation) : "-";
  const revenueAtRisk = rows
    .filter(({ booking }) => getConversationOutcome(booking) !== "confirmed")
    .reduce((sum, { booking }) => sum + booking.revenue, 0);
  const objectionTypes = [...new Set(rows.filter(({ booking }) => hasRealObjection(booking)).map(({ booking }) => local(booking.report.objections)))].join(" · ") || "-";

  return `
    <section class="context-overview">
      <div class="report-header">
        <div>
          <p class="eyebrow">${text("risk.title")}</p>
          <h5>${bookingDrill.contextLabel || text("dashboard.risk")}</h5>
          <span>${text("risk.relatedConversations")}: ${summary.conversations}</span>
        </div>
        <span class="score-pill warn">${summary.conversations}</span>
      </div>
      <div class="report-grid">
        ${reportField(text("dashboard.risk"), bookingDrill.contextLabel || text("risk.title"))}
        ${reportField(text("alerts.platform"), platform ? local(platform.platform) : "-")}
        ${reportField(text("alerts.employee"), employee ? local(employee.name) : "-")}
        ${reportField(text("risk.relatedConversations"), summary.conversations)}
        ${reportField(cncLabel(), summary.cnc)}
        ${reportField(text("agents.missed"), summary.missedOpportunities)}
        ${reportField(text("risk.revenueAtRisk"), formatCurrency(revenueAtRisk))}
        ${reportField(text("bookings.objections"), objectionTypes)}
        ${reportField(text("risk.reason"), reason)}
        ${reportField(text("bookings.recommendation"), recommendation)}
      </div>
      <div class="context-section">
        <p class="eyebrow">${text("risk.relatedConversations")}</p>
        <div class="context-list">
          ${
            rows.length
              ? rows
                  .map(({ platform: rowPlatform, source, content, booking }) => `
                    <button class="booking-card drill-card" data-context-booking="${booking.id}" type="button" aria-label="${text("risk.openConversation")}">
                      <div class="booking-card-main">
                        <h5>${booking.id} · ${local(booking.client)}</h5>
                        <span>${local(rowPlatform.platform)} · ${text(`sources.${source.type}`)} · ${local(content.title)}</span>
                      </div>
                      <div class="booking-meta-grid">
                        ${bookingMeta(text("bookings.employee"), getResponsibleAgentName(booking))}
                        ${bookingMeta(text("bookings.time"), `${booking.date} · ${booking.time}`)}
                        ${bookingMeta(text("bookings.aiScore"), booking.score)}
                      </div>
                    </button>
                  `)
                  .join("")
              : `<div class="empty-state">${text("explorer.noData")}</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderPlatformBreakdown() {
  const platforms = getDrillPlatforms();
  const totalRows = metricRows(getDrillRows());
  return platforms
    .filter((platform) => hasMetricSignal(rowsForPlatform(platform)))
    .map((platform) => {
      const rows = rowsForPlatform(platform);
      const platformRows = metricRows(rows);
      return `
        <button class="booking-channel drill-card" data-drill-platform="${platform.id}" type="button" aria-label="${text("bookings.openPlatform")}">
          <div class="booking-channel-header">
            <div>
              <h5>${local(platform.platform)}</h5>
              <span>${getMetricValue(rows)} ${text("bookings.total")}</span>
            </div>
            <strong>${bookingDrill.metricKey === "revenueInsights" ? `${Math.round((revenueSum(platformRows) / Math.max(revenueSum(totalRows), 1)) * 100)}%` : `${Math.round((platformRows.length / Math.max(totalRows.length, 1)) * 100)}%`}</strong>
          </div>
          <div class="source-list">
            ${platform.sources
              .filter((source) => hasMetricSignal(rowsForSource(platform, source)))
              .map(
                (source) => `
                  <div class="source-row">
                    <span class="source-label">${text(`sources.${source.type}`)}</span>
                    <span class="source-count">${getMetricValue(rowsForSource(platform, source))}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        </button>
      `;
    })
    .join("");
}

function renderSourceBreakdown() {
  const platform = findPlatform();
  if (!platform) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  return platform.sources
    .filter((source) => hasMetricSignal(rowsForSource(platform, source)))
    .map((source) => `
      <button class="booking-channel drill-card" data-drill-source="${source.id}" type="button" aria-label="${text("bookings.openSource")}">
        <div class="booking-channel-header">
          <div>
            <h5>${text(`sources.${source.type}`)}</h5>
            <span>${local(platform.platform)} · ${getMetricValue(rowsForSource(platform, source))}</span>
          </div>
          <strong>${getMetricValue(rowsForSource(platform, source))}</strong>
        </div>
        <div class="source-list">
          ${source.contents
            .filter((content) => hasMetricSignal(rowsForContent(platform, source, content)))
            .map(
              (content) => `
                <div class="source-row">
                  <span class="source-label">${local(content.title)}</span>
                  <span class="source-count">${getMetricValue(rowsForContent(platform, source, content))}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </button>
    `)
    .join("");
}

function renderContentBreakdown() {
  const platform = findPlatform();
  const source = findSource();
  if (!platform || !source) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  return source.contents
    .filter((content) => hasMetricSignal(rowsForContent(platform, source, content)))
    .map((content) => `
      <button class="booking-channel drill-card" data-drill-content="${content.id}" type="button" aria-label="${text("bookings.openContent")}">
        <div class="booking-channel-header">
          <div>
            <p class="content-type">${text(`content.${content.contentType}`)}</p>
            <h5>${local(content.title)}</h5>
            <span>${local(content.detail)}</span>
          </div>
          <strong>${getMetricValue(rowsForContent(platform, source, content))}</strong>
        </div>
      </button>
    `)
    .join("");
}

function renderEmployeeBreakdown() {
  const platform = findPlatform();
  const source = findSource();
  const content = findContent();
  if (!platform || !source || !content) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  const rows = metricRows(rowsForContent(platform, source, content));
  const grouped = rows.reduce((groups, row) => {
    const agentId = getResponsibleAgentId(row.booking);
    groups.set(agentId, [...(groups.get(agentId) || []), row]);
    return groups;
  }, new Map());

  return [...grouped.entries()]
    .map(([agentId, agentRows]) => {
      const performance = calculateAgentPerformance(agentRows);
      return `
        <button class="booking-channel drill-card" data-drill-agent="${agentId}" type="button" aria-label="${text("bookings.openEmployee")}">
          <div class="booking-channel-header">
            <div>
              <p class="content-type">${text("agents.detected")}</p>
              <h5>${getAgentDisplayNameById(agentId)}</h5>
              <span>${local(content.title)} · ${agentRows.length} ${text("bookings.total")}</span>
            </div>
            <strong>${performance.performanceScore}%</strong>
          </div>
          <div class="source-list">
            <div class="source-row">
              <span class="source-label">${text("agents.bookings")}</span>
              <span class="source-count">${performance.confirmedBookings}</span>
            </div>
            <div class="source-row">
              <span class="source-label">${text("agents.missed")}</span>
              <span class="source-count">${performance.missedOpportunities}</span>
            </div>
            <div class="source-row">
              <span class="source-label">${cncLabel()}</span>
              <span class="source-count">${performance.cnc}</span>
            </div>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderBookingList() {
  const platform = findPlatform();
  const source = findSource();
  const content = findContent();
  if (!platform || !source || !content) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  const rows = metricRows(bookingDrill.agentId ? rowsForContentAgent(platform, source, content, bookingDrill.agentId) : rowsForContent(platform, source, content));
  return rows
    .map(({ booking }) => booking)
    .map((booking) => `
      <button class="booking-card drill-card" data-drill-booking="${booking.id}" type="button" aria-label="${text("bookings.openBooking")}">
        <div class="booking-card-main">
          <h5>${booking.id} · ${local(booking.client)}</h5>
          <span>${local(content.title)}</span>
        </div>
        <div class="booking-meta-grid">
          ${bookingMeta(text("bookings.platform"), local(platform.platform))}
          ${bookingMeta(text("bookings.source"), text(`sources.${source.type}`))}
          ${bookingMeta(text("bookings.employee"), `${getResponsibleAgentName(booking)} · ${getAgentDetectionMode(booking)}`)}
          ${bookingMeta(text("bookings.status"), outcomeLabel(booking))}
          ${bookingMeta(text("bookings.time"), `${booking.date} · ${booking.time}`)}
          ${bookingMeta(text("bookings.aiScore"), booking.score)}
        </div>
      </button>
    `)
    .join("");
}

function renderBookingReport() {
  const platform = findPlatform();
  const source = findSource();
  const content = findContent();
  const booking = findBooking();
  if (!platform || !source || !content || !booking) return `<div class="empty-state">${text("explorer.noData")}</div>`;
  const report = booking.report;

  return `
    <article class="conversation-report">
      <div class="report-header">
        <div>
          <p class="eyebrow">${text("bookings.report")}</p>
          <h5>${booking.id} · ${local(booking.client)}</h5>
          <span>${local(platform.platform)} · ${text(`sources.${source.type}`)} · ${local(content.title)}</span>
        </div>
        <span class="${booking.score >= 80 ? "score-pill good" : "score-pill warn"}">${booking.score}</span>
      </div>

      ${responsibleEmployeeField(booking)}
      ${renderReportTabs()}
      ${bookingDrill.reportTab === "conversation" ? renderFullConversation(booking, report) : renderAiAnalysisReport(platform, source, content, booking, report)}
    </article>
  `;
}

function renderReportTabs() {
  return `
    <div class="report-tabs" role="tablist" aria-label="${text("bookings.report")}">
      <button class="report-tab ${bookingDrill.reportTab === "analysis" ? "active" : ""}" data-report-tab="analysis" type="button" role="tab">
        ${text("report.aiAnalysis")}
      </button>
      <button class="report-tab ${bookingDrill.reportTab === "conversation" ? "active" : ""}" data-report-tab="conversation" type="button" role="tab">
        ${text("report.fullConversation")}
      </button>
    </div>
  `;
}

function renderAiAnalysisReport(platform, source, content, booking, report) {
  return `
    <div class="report-field featured-field">
      <span>${text("bookings.summary")}</span>
      <strong>${local(report.summary)}</strong>
    </div>

    <div class="report-grid">
      ${reportField(text("explorer.metricEvidence"), getMetricEvidence(booking))}
      ${reportField(text("explorer.exactEmployee"), `${getResponsibleAgentName(booking)} · ${getAgentDetectionMode(booking)}`)}
      ${reportField(text("explorer.exactSource"), `${local(platform.platform)} · ${text(`sources.${source.type}`)}`)}
      ${reportField(text("explorer.exactContent"), local(content.title))}
      ${reportField(text("explorer.exactMissedIssue"), local(report.missed))}
      ${reportField(text("explorer.revenue"), formatCurrency(booking.revenue))}
      ${reportField(text("bookings.interest"), local(report.interest))}
      ${reportField(text("bookings.responseQuality"), local(report.response))}
      ${reportField(text("bookings.bookingQuality"), local(report.bookingQuality))}
      ${reportField(text("bookings.missedOpportunities"), local(report.missed))}
      ${reportField(text("bookings.objections"), local(report.objections))}
      ${reportField(text("bookings.sentiment"), local(report.sentiment))}
      ${reportField(text("bookings.employeeNotes"), local(report.notes))}
      ${reportField(text("bookings.recommendation"), local(report.recommendation))}
    </div>
  `;
}

function renderFullConversation(booking, report) {
  const messages = report.messages?.[currentLang] || report.messages?.en || [];
  return `
    <div class="conversation-verification">
      <div class="report-field featured-field">
        <span>${text("report.detectedAgent")}</span>
        <strong>${getResponsibleAgentName(booking)} · ${getAgentDetectionMode(booking)}</strong>
      </div>
      <div class="transcript compact-transcript full-conversation">
        ${messages
          .map(([speaker, line], index) => {
            const role = getMessageRole(speaker);
            return `
              <div class="transcript-line transcript-line-${role}">
                <div class="message-meta">
                  <strong>${getMessageRoleLabel(role, speaker)}</strong>
                  <span>${messageTimestamp(booking.time, index)}</span>
                </div>
                <p>${line}</p>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function getMessageRole(speaker = "") {
  const normalized = normalizeSearchText(speaker);
  if (["client", "customer", "العميل", "المريضه", "المريض"].map(normalizeSearchText).some((value) => normalized.includes(value))) return "customer";
  if (["ai", "الذكاء"].map(normalizeSearchText).some((value) => normalized.includes(value))) return "ai";
  return "agent";
}

function getMessageRoleLabel(role, speaker) {
  if (role === "customer") return text("report.customer");
  if (role === "ai") return text("report.aiNote");
  return `${text("report.agent")} · ${speaker}`;
}

function messageTimestamp(startTime, index) {
  const [hour, minute] = startTime.split(":").map(Number);
  const date = new Date(2026, 0, 1, hour || 0, (minute || 0) + index * 2);
  return date.toLocaleTimeString(currentLang === "ar" ? "ar" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

function responsibleEmployeeField(booking) {
  return `
    <div class="agent-correction" data-no-drill>
      <span>${text("agents.assignment")}</span>
      <strong>${getResponsibleAgentName(booking)}</strong>
    </div>
  `;
}

function getMetricEvidence(booking) {
  if (bookingDrill.metricKey === "revenueInsights") return `${text("explorer.revenueValue")}: ${formatCurrency(booking.revenue)}`;
  if (bookingDrill.metricKey === "averageQuality" || bookingDrill.metricKey === "platformPerformance" || bookingDrill.metricKey === "agentPerformance") return `${text("explorer.qualityValue")}: ${booking.score}%`;
  if (bookingDrill.metricKey === "aiRecommendations") return `${text("explorer.recommendationValue")}: ${local(booking.report.recommendation)}`;
  if (bookingDrill.metricKey === "missedOpportunities") return local(booking.report.missed);
  if (bookingDrill.metricKey === "analyzedConversations") return local(booking.report.summary);
  return local(booking.report.bookingQuality);
}

function renderChannelBars() {
  const container = document.getElementById("channel-bars");
  const platforms = getVisiblePlatforms();
  container.innerHTML = platforms.length
    ? platforms
        .map((platform) => {
          const rows = rowsForPlatform(platform);
          const score = calculatePlatformPerformance(platform);
          return `
        <div class="channel-row">
          <span class="channel-label">${local(platform.platform)}</span>
          <span class="bar-track" aria-hidden="true">
            <span class="bar-fill" style="width: ${score}%"></span>
          </span>
          <span class="bar-value">${score}</span>
        </div>
      `;
        })
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function buildRiskItems() {
  const rows = getAllBookingRows();
  const cncRows = rows.filter(({ booking }) => isCnc(booking));
  const slowRows = rows.filter(({ booking }) => booking.score < 80);
  const revenueRows = rows.filter(({ booking }) => isMissedOpportunity(booking) || isCnc(booking) || (getConversationOutcome(booking) !== "confirmed" && booking.revenue >= 5000));
  const objectionCounts = rows.reduce((counts, row) => {
    if (getConversationOutcome(row.booking) === "confirmed") return counts;
    const key = local(row.booking.report.objections);
    counts.set(key, [...(counts.get(key) || []), row]);
    return counts;
  }, new Map());
  const objectionRows = [...objectionCounts.entries()]
    .filter(([key]) => key && !["none", "لا يوجد"].includes(key.toLowerCase()))
    .flatMap(([, objectionRows]) => objectionRows);
  const employeeRows = groupedRowsByAgent(rows).sort((a, b) => calculateOutcomePerformance(a.rows) - calculateOutcomePerformance(b.rows))[0]?.rows || [];
  const platformRows = getVisiblePlatforms()
    .map((platform) => rowsForPlatform(platform))
    .sort((a, b) => calculateOutcomePerformance(a) - calculateOutcomePerformance(b))[0] || [];

  return [
    { key: "cnc", title: text("risk.cnc"), rows: cncRows },
    { key: "revenueLeakage", title: text("risk.revenueLeakage"), rows: revenueRows },
    { key: "employeeRisk", title: text("risk.employeeRisk"), rows: employeeRows },
    { key: "responseRisk", title: text("risk.responseRisk"), rows: slowRows },
    { key: "objectionRisk", title: text("risk.objectionRisk"), rows: objectionRows },
    { key: "platformRisk", title: text("risk.platformRisk"), rows: platformRows },
  ].filter((risk) => risk.rows.length);
}

function renderRiskRadar() {
  const container = document.getElementById("radar-stack");
  const risks = buildRiskItems()
    .sort((a, b) => b.rows.length - a.rows.length)
    .slice(0, 7);

  container.innerHTML = risks.length
    ? risks
        .map(
          (risk) => `
        <button class="radar-item" data-risk-platform="${risk.key}" type="button" aria-haspopup="dialog" aria-controls="booking-breakdown-modal">
          <div>
            <strong ${risk.key === "cnc" ? `title="${text("cnc.tooltip")}"` : ""}>${risk.title}${risk.key === "cnc" ? " ⓘ" : ""}</strong>
            <span>${risk.rows.length} ${text("risk.relatedConversations")} · ${local(risk.rows[0].booking.report.missed)}</span>
          </div>
          <span class="risk-dot" style="--risk: ${Math.min(92, 24 + risk.rows.length * 13)}%" aria-label="${risk.rows.length}"></span>
        </button>
      `,
        )
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderPriorityList() {
  const container = document.getElementById("priority-list");
  const rows = getAllBookingRows()
    .sort((a, b) => {
      if (isMissedOpportunity(a.booking) !== isMissedOpportunity(b.booking)) return Number(isMissedOpportunity(b.booking)) - Number(isMissedOpportunity(a.booking));
      return a.booking.score - b.booking.score;
    })
    .slice(0, 5);

  container.innerHTML = rows.length
    ? rows
        .map(
          ({ platform, source, content, booking }) => `
        <div class="conversation-row">
          <div>
            <h4>${booking.id} · ${local(booking.client)}</h4>
            <p>${local(platform.platform)} · ${text(`sources.${source.type}`)} · ${local(content.title)}</p>
          </div>
          <div class="signal-stack">
            ${badge(outcomeLabel(booking), getConversationOutcome(booking) === "confirmed" ? "booking" : "missed")}
          </div>
          <span class="${booking.score >= 80 ? "score-pill good" : "score-pill warn"}">${booking.score}</span>
        </div>
      `,
        )
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderPlatformNav() {
  const container = document.getElementById("platform-nav");
  const supported = ["facebook", "instagram", "tiktok", "google", "whatsapp", "snapchat"];
  const platforms = supported
    .map((id) => getData().bookingSources.find((platform) => platform.id === id))
    .filter(Boolean);

  container.innerHTML = platforms
    .map((platform) => {
      const visible = getVisiblePlatforms().find((item) => item.id === platform.id);
      const rows = visible ? rowsForPlatform(visible) : [];
      return `
        <button class="platform-nav-item" data-platform-open="${platform.id}" type="button">
          <span>${local(platform.platform)}</span>
          <strong>${visible ? calculatePlatformPerformance(visible) : 0}%</strong>
        </button>
      `;
    })
    .join("");
}

function buildIntelligenceAlerts() {
  return buildAlerts({
    rows: getAllBookingRows(),
    language: currentLang,
    hasMissedIssue: isMissedOpportunity,
    textHaystack,
  });
}

function renderIntelligenceAlerts() {
  const container = document.getElementById("intelligence-alerts");
  if (!container) return;
  const alerts = buildIntelligenceAlerts();
  container.innerHTML = alerts.length
    ? alerts
        .map(
          ({ title, priority, row, action }) => `
            <article class="alert-card">
              <div>
                <span class="alert-priority">${text("alerts.priority")}: ${priority}</span>
                <h4>${title}</h4>
                <p>${text("alerts.platform")}: ${local(row.platform.platform)} · ${text("alerts.employee")}: ${getResponsibleAgentName(row.booking)}</p>
                <p>${text("alerts.source")}: ${text(`sources.${row.source.type}`)} · ${local(row.content.title)}</p>
                <strong>${text("alerts.action")}: ${action}</strong>
              </div>
              <button class="text-button" data-alert-booking="${row.booking.id}" type="button">${text("alerts.openReport")}</button>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderSettings() {
  const container = document.getElementById("settings-panel");
  if (!container) return;
  container.innerHTML = `
    ${settingsSection(text("settings.business"), renderBusinessSettings())}
    ${settingsSection(text("settings.team"), renderTeamSettings())}
    ${settingsSection(text("settings.connections"), renderConnectionsSettings())}
    ${settingsSection(text("settings.alerts"), renderAlertSettings())}
    ${settingsSection(text("settings.privacy"), renderPrivacySettings())}
  `;
}

function renderBusinessSettings() {
  return `
    <div class="settings-grid">
      ${settingsField(text("settings.businessName"), businessSettings.name)}
      ${settingsField(text("settings.logo"), businessSettings.logo)}
      ${settingsField(text("settings.defaultLanguage"), businessSettings.defaultLanguage)}
      ${settingsField(text("settings.currency"), businessSettings.currency)}
      ${settingsField(text("settings.timeZone"), businessSettings.timeZone)}
      ${settingsField(text("settings.industryType"), businessSettings.industryType)}
    </div>
  `;
}

function renderTeamSettings() {
  return `
    <div class="settings-actions">
      <button class="text-button" data-team-action="add" type="button">${text("settings.addEmployee")}</button>
    </div>
    <div class="team-list">
      ${agentProfiles
        .map(
          (profile) => `
            <article class="team-card">
              <div>
                <h4>${local(profile.name)}</h4>
                <p>${text("settings.department")}: ${profile.department?.[currentLang] || (currentLang === "ar" ? "المبيعات" : "Sales")} · ${text("settings.role")}: ${profile.role?.[currentLang] || (currentLang === "ar" ? "وكيل محادثات" : "Conversation agent")}</p>
                <p>${text("settings.employeeTag")}: ${profile.tags.join(" · ")}</p>
              </div>
              <div class="team-actions">
                <button class="text-button compact-button" data-team-action="edit" data-agent-id="${profile.id}" type="button">${text("settings.edit")}</button>
                <button class="text-button compact-button" data-team-action="delete" data-agent-id="${profile.id}" type="button">${text("settings.delete")}</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderConnectionsSettings() {
  return `
    <div class="connection-grid">
      ${connectionSettings
        .map(
          (item) => `
            <article class="connection-card">
              <div class="connection-heading">
                <h4>${item.platform}</h4>
                <span class="${item.connected ? "score-pill good" : "score-pill warn"}">${item.connected ? text("settings.connected") : text("settings.notConnected")}</span>
              </div>
              ${settingsField(text("settings.lastSync"), item.lastSync)}
              ${settingsField(text("settings.conversationsSynced"), item.conversations)}
              ${settingsField(text("settings.leadsSynced"), item.leads)}
              ${settingsField(text("settings.bookingsSynced"), item.bookings)}
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderAlertSettings() {
  return `
    <div class="toggle-list">
      ${alertSettings
        .map(
          (item) => `
            <label class="toggle-row">
              <span>${local(item.label)}${item.instant ? ` · ${currentLang === "ar" ? "تنبيه فوري للمالك" : "instant owner notification"}` : ""}</span>
              <input type="checkbox" ${item.enabled ? "checked" : ""} />
            </label>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPrivacySettings() {
  const nameValue = revealedSensitiveFields.has("name") ? "Ahmad Hassan" : maskName("Ahmad Hassan");
  const phoneValue = revealedSensitiveFields.has("phone") ? "+971 501234567" : maskPhone("+971 501234567");
  return `
    <div class="privacy-statement">${text("settings.privacyStatement")}</div>
    <div class="toggle-list">
      ${privacySettings
        .map(
          (item) => `
            <label class="toggle-row">
              <span>${text(`settings.${item.key}`)}</span>
              <input type="checkbox" ${item.enabled ? "checked" : ""} />
            </label>
          `,
        )
        .join("")}
    </div>
    <div class="settings-grid">
      <div class="settings-field">
        <span>${text("settings.maskedExample")}</span>
        <strong>${nameValue}</strong>
        <button class="text-button compact-button" data-reveal-sensitive="name" type="button">${text("settings.reveal")}</button>
      </div>
      <div class="settings-field">
        <span>${text("settings.maskedExample")}</span>
        <strong>${phoneValue}</strong>
        <button class="text-button compact-button" data-reveal-sensitive="phone" type="button">${text("settings.reveal")}</button>
      </div>
      ${settingsField(text("settings.auditCount"), auditLog.length)}
    </div>
    <div class="settings-note">
      <strong>${text("settings.auditRecent")}</strong>
      ${
        auditLog.length
          ? auditLog.slice(0, 5).map((entry) => `<div>${entry.timestamp} · ${entry.action} · ${entry.field}</div>`).join("")
          : `<div>0</div>`
      }
    </div>
    <p class="settings-note">${text("settings.dataOwnership")}</p>
  `;
}

async function analyzeTestFile(file) {
  const container = document.getElementById("file-analysis-results");
  if (container) {
    container.innerHTML = `<div class="empty-state">${text("file.processing")}</div>`;
  }

  try {
    const content = await readAnalysisFile(file);
    if (!content.trim()) throw new Error("empty-file");
    fileAnalysisResult = parseConversationFileText(content, file.name);
    fileAnalysisDrill = { type: null, conversationId: null, search: "" };
    if (!fileAnalysisResult.conversations.length) {
      fileAnalysisResult = { error: text("file.noConversations"), conversations: [], summary: null };
    }
  } catch (error) {
    const code = error?.message || "invalid-file";
    fileAnalysisResult = { error: fileErrorMessage(code), conversations: [], summary: null };
  }

  safeRun("renderAnalyzeFile", () => renderAnalyzeFile());
}

function renderAnalyzeFile() {
  const container = document.getElementById("file-analysis-results");
  if (!container) return;
  if (!fileAnalysisResult) {
    container.innerHTML = `<div class="empty-state">${text("file.empty")}</div>`;
    return;
  }
  if (fileAnalysisResult.error) {
    container.innerHTML = `<div class="empty-state">${fileAnalysisResult.error}</div>`;
    return;
  }
  const { summary } = fileAnalysisResult;
  const card = (type, label, value) => `
    <button class="report-field file-analysis-card" data-file-analysis-type="${type}" type="button" aria-haspopup="dialog" aria-controls="file-analysis-modal">
      <span>${label}</span>
      <strong>${value}</strong>
    </button>
  `;
  container.innerHTML = `
    ${card("conversations", text("search.conversations"), summary.conversations)}
    ${card("confirmed", text("search.bookings"), summary.confirmed)}
    ${card("cnc", cncLabel(), summary.cnc)}
    ${card("missed", text("search.lost"), summary.missed)}
    ${card("pending", text("outcomes.pending"), summary.pending)}
    ${card("objections", text("bookings.objections"), summary.objections)}
    ${card("revenue", text("metrics.revenueInsights"), formatCurrency(summary.revenue))}
    ${card("recommendations", text("file.recommendations"), summary.cnc + summary.missed)}
  `;
}

function fileConversationRows(type) {
  if (!fileAnalysisResult?.conversations) return [];
  if (type === "conversations") return fileAnalysisResult.conversations;
  if (type === "recommendations") return fileAnalysisResult.conversations.filter((conversation) => ["cnc", "missed"].includes(conversation.outcome));
  if (type === "revenue") return fileAnalysisResult.conversations.filter((conversation) => conversation.outcome === "confirmed" && conversation.revenue > 0);
  if (type === "objections") return fileAnalysisResult.conversations.filter((conversation) => conversation.objections);
  return fileAnalysisResult.conversations.filter((conversation) => conversation.outcome === type);
}

function openFileAnalysisDetail(type) {
  fileAnalysisDrill = { type, conversationId: null, search: "" };
  const modal = document.getElementById("file-analysis-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderFileAnalysisDetail();
}

function renderFileAnalysisDetail() {
  const container = document.getElementById("file-analysis-modal-content");
  const title = document.getElementById("file-analysis-modal-title");
  if (!container || !fileAnalysisResult?.conversations) return;
  const selected = fileAnalysisResult.conversations.find((conversation) => conversation.id === fileAnalysisDrill.conversationId);
  if (selected) {
    title.textContent = `${selected.id} · ${text("file.conversationEvidence")}`;
    container.innerHTML = `
      <article class="conversation-report">
        <div class="report-grid">
          ${reportField(text("file.classification"), text(`outcomes.${selected.outcome}`))}
          ${reportField(text("bookings.source"), selected.source)}
          ${reportField(text("bookings.employee"), selected.employee)}
          ${reportField(text("file.reason"), selected.reason)}
          ${reportField(text("metrics.revenueInsights"), formatCurrency(selected.revenue))}
          ${reportField(text("bookings.objections"), selected.objections || "-")}
          ${reportField(text("file.recommendations"), selected.recommendation || (selected.outcome === "cnc" ? text("cnc.recommendation") : "-"))}
        </div>
        <div class="report-field featured-field">
          <span>${text("file.conversationEvidence")}</span>
          <strong class="file-evidence">${selected.evidence}</strong>
        </div>
      </article>
    `;
    return;
  }

  const search = normalizeSearchText(fileAnalysisDrill.search);
  const rows = fileConversationRows(fileAnalysisDrill.type).filter((conversation) =>
    !search || normalizeSearchText([conversation.id, conversation.source, conversation.employee, conversation.outcome, conversation.objections, conversation.reason, conversation.evidence].join(" ")).includes(search),
  );
  title.textContent = fileAnalysisDrill.type === "revenue" ? text("file.revenueCalculation") : text("file.evidence");
  const evidenceDetail = (conversation) => {
    if (fileAnalysisDrill.type === "revenue") return bookingMeta(text("file.revenueSource"), `${conversation.source} · ${formatCurrency(conversation.revenue)}`);
    if (fileAnalysisDrill.type === "objections") return bookingMeta(text("file.objectionType"), conversation.objections || "-");
    if (fileAnalysisDrill.type === "cnc") return `${bookingMeta(text("file.missingClose"), conversation.reason)}${bookingMeta(text("file.recommendedNextStep"), conversation.recommendation || text("cnc.recommendation"))}`;
    if (fileAnalysisDrill.type === "missed") return `${bookingMeta(text("file.exactMistake"), conversation.reason)}${bookingMeta(text("file.revenueLoss"), formatCurrency(conversation.potentialRevenue || 0))}`;
    if (fileAnalysisDrill.type === "confirmed") return bookingMeta(text("explorer.revenueValue"), formatCurrency(conversation.revenue));
    if (fileAnalysisDrill.type === "recommendations") return bookingMeta(text("file.recommendations"), conversation.recommendation || (conversation.outcome === "cnc" ? text("cnc.recommendation") : conversation.reason));
    return bookingMeta(text("file.reason"), conversation.reason);
  };
  container.innerHTML = `
    <label class="search-box file-evidence-search">
      <span>${text("file.searchEvidence")}</span>
      <input id="file-evidence-search" type="search" value="${fileAnalysisDrill.search}" placeholder="${text("file.searchEvidencePlaceholder")}" />
    </label>
    <div class="context-list">
    ${rows.length
    ? rows
        .map(
          (conversation) => `
            <button class="booking-card drill-card" data-file-conversation="${conversation.id}" type="button">
              <div class="booking-card-main">
                <h5>${conversation.id} · ${text(`outcomes.${conversation.outcome}`)}</h5>
                <span>${conversation.source} · ${conversation.employee}</span>
              </div>
              <div class="booking-meta-grid">
                ${bookingMeta(text("bookings.source"), conversation.source)}
                ${bookingMeta(text("bookings.employee"), conversation.employee)}
                ${evidenceDetail(conversation)}
              </div>
            </button>
          `,
        )
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`}
    </div>
  `;
}

function closeFileAnalysisModal() {
  document.getElementById("file-analysis-modal").hidden = true;
  document.body.classList.remove("modal-open");
  fileAnalysisDrill = { type: null, conversationId: null, search: "" };
}

function toAgentId(name) {
  return normalizeSearchText(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `agent-${Date.now()}`;
}

function promptValue(label, fallback = "") {
  return window.prompt(label, fallback)?.trim();
}

function addTeamMember() {
  const name = promptValue(text("settings.addEmployee"));
  if (!name) return;
  const role = promptValue(text("settings.role"), "Conversation agent") || "Conversation agent";
  const department = promptValue(text("settings.department"), "Sales") || "Sales";
  const tag = promptValue(text("settings.employeeTag"), `#${name.replace(/\s+/g, "")}`) || `#${name.replace(/\s+/g, "")}`;
  const idBase = toAgentId(name);
  const id = agentProfiles.some((profile) => profile.id === idBase) ? `${idBase}-${Date.now()}` : idBase;
  agentProfiles.push({
    id,
    name: { en: name, ar: name },
    department: { en: department, ar: department },
    role: { en: role, ar: role },
    tags: [tag],
    aliases: [name],
  });
  renderDashboard();
  renderSettings();
}

function editTeamMember(agentId) {
  const profile = findAgentById(agentId);
  if (!profile) return;
  const name = promptValue(text("settings.businessName"), local(profile.name));
  if (!name) return;
  const role = promptValue(text("settings.role"), profile.role?.[currentLang] || (currentLang === "ar" ? "وكيل محادثات" : "Conversation agent")) || profile.role?.[currentLang] || "";
  const department = promptValue(text("settings.department"), profile.department?.[currentLang] || (currentLang === "ar" ? "المبيعات" : "Sales")) || profile.department?.[currentLang] || "";
  const tag = promptValue(text("settings.employeeTag"), profile.tags[0] || `#${name.replace(/\s+/g, "")}`) || profile.tags[0] || "";
  profile.name = { en: name, ar: name };
  profile.department = { en: department, ar: department };
  profile.role = { en: role, ar: role };
  profile.tags = [tag];
  profile.aliases = [...new Set([...(profile.aliases || []), name])];
  renderDashboard();
  renderSettings();
  renderUniversalSearch();
  renderBookingBreakdown();
}

function deleteTeamMember(agentId) {
  const index = agentProfiles.findIndex((profile) => profile.id === agentId);
  if (index === -1) return;
  const profile = agentProfiles[index];
  const shouldDelete = window.confirm ? window.confirm(`${text("settings.delete")} ${local(profile.name)}?`) : true;
  if (!shouldDelete) return;
  agentProfiles.splice(index, 1);
  Object.entries(agentOverrides).forEach(([bookingId, assignedAgentId]) => {
    if (assignedAgentId === agentId) delete agentOverrides[bookingId];
  });
  renderDashboard();
  renderSettings();
  renderUniversalSearch();
  renderBookingBreakdown();
}

function renderAgentIntelligence() {
  const container = document.getElementById("agent-intelligence");
  const rows = getAllBookingRows();
  const grouped = agentProfiles
    .map((profile) => ({
      profile,
      rows: rows.filter(({ booking }) => getResponsibleAgentProfile(booking)?.id === profile.id),
    }))
    .filter((item) => item.rows.length);

  container.innerHTML = grouped.length
    ? grouped
        .map(({ profile, rows: agentRows }) => {
          const performance = calculateAgentPerformance(agentRows);
          const missedRows = agentRows.filter(({ booking }) => isMissedOpportunity(booking));
          const sorted = [...agentRows].sort((a, b) => b.booking.score - a.booking.score);
          const best = sorted[0]?.booking.id || "-";
          const weakest = sorted[sorted.length - 1]?.booking.id || "-";
          const commonMistake = missedRows[0] ? local(missedRows[0].booking.report.missed) : currentLang === "ar" ? "لا توجد مشكلة متكررة مؤثرة" : "No repeated critical issue";
          return `
            <button class="agent-card agent-card-button" data-employee-scope="${profile.id}" type="button">
              <div>
                <p class="eyebrow">${text("agents.detected")}</p>
                <h4>${local(profile.name)}</h4>
                <p>${profile.tags.join(" · ")}</p>
              </div>
              <div class="agent-kpis">
                ${agentKpi(text("agents.bookings"), performance.confirmedBookings)}
                ${agentKpi(text("agents.missed"), performance.missedOpportunities)}
                ${agentKpi(cncLabel(), performance.cnc)}
                ${agentKpi(text("agents.total"), performance.totalConversations)}
                ${agentKpi(text("employee.revenueGenerated"), formatCurrency(revenueSum(metricRowsForKey(agentRows, "revenueInsights"))))}
                ${agentKpi(text("employee.conversionRate"), `${performance.totalConversations ? Math.round((performance.confirmedBookings / performance.totalConversations) * 100) : 0}%`)}
                ${agentKpi(text("employee.objectionsHandled"), agentRows.filter(({ booking }) => hasRealObjection(booking) && getConversationOutcome(booking) === "confirmed").length)}
                ${agentKpi(text("search.performance"), `${performance.performanceScore}%`)}
                ${agentKpi(text("agents.responseQuality"), `${performance.averageResponseQuality}%`)}
                ${agentKpi(text("agents.responseSpeed"), responseSpeed(agentRows))}
              </div>
              <div class="agent-notes">
                <strong>${text("agents.best")}: ${best}</strong>
                <strong>${text("agents.weakest")}: ${weakest}</strong>
                <span>${text("agents.mistakes")}: ${commonMistake}</span>
                <span>${text("agents.training")}: ${agentTrainingRecommendation(agentRows)}</span>
              </div>
            </button>
          `;
        })
        .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderUniversalSearch() {
  const input = document.getElementById("global-search");
  const container = document.getElementById("search-results");
  if (!input || !container) return;
  input.value = searchQuery;

  const query = searchQuery.trim();
  if (!query) {
    container.innerHTML = `<div class="empty-state">${text("search.empty")}</div>`;
    return;
  }

  const results = searchRows();
  const summary = summarizeOutcomes(results);
  const platforms = new Set(results.map(({ platform }) => local(platform.platform)));
  const employeeProfile = findAgentProfileFromSearchQuery();
  const performanceScore = calculateOutcomePerformance(results);

  container.innerHTML = `
    <div class="search-summary">
      ${searchStat(text("search.bookings"), summary.confirmedBookings)}
      ${searchStat(text("search.lost"), summary.missedOpportunities)}
      ${searchStat(text("search.conversations"), summary.conversations)}
      ${searchStat(text("search.performance"), `${performanceScore}%`)}
    </div>
    ${
      employeeProfile && results.length
        ? `
          <article class="search-result employee-search-result">
            <div>
              <span>${text("search.employeeOutcome")}</span>
              <h4>${local(employeeProfile.name)}</h4>
              <p>${summary.confirmedBookings} ${text("agents.bookings")} · ${summary.missedOpportunities} ${text("agents.missed")} · ${summary.cnc} ${text("metrics.cnc")} · ${summary.conversations} ${text("agents.total")} · ${text("search.performance")}: ${performanceScore}%</p>
              <p>${[...platforms].join(" · ")}</p>
            </div>
            <button class="text-button" data-search-booking="${results[0].booking.id}" type="button">${text("search.openReport")}</button>
          </article>
        `
        : ""
    }
    ${
      results.length
        ? results
            .slice(0, 8)
            .map(
              ({ platform, source, content, booking, snippet }) => `
                <article class="search-result">
                  <div>
                    <span>${text("search.snippet")}</span>
                    <h4>${booking.id} · ${local(booking.client)}</h4>
                    <p>${outcomeLabel(booking)} · ${text("search.performance")}: ${booking.score}% · ${local(platform.platform)} · ${text(`sources.${source.type}`)} · ${getResponsibleAgentName(booking)} · ${booking.date}</p>
                    <p>${snippet}</p>
                  </div>
                  <button class="text-button" data-search-booking="${booking.id}" type="button">${text("search.openReport")}</button>
                </article>
              `,
            )
            .join("")
        : `<div class="empty-state">${text("explorer.noData")}</div>`
    }
  `;
}

function renderAnalysis() {
  const conversations = getVisibleConversations();
  if (!conversations.find((conversation) => conversation.id === selectedConversationId) && conversations[0]) {
    selectedConversationId = conversations[0].id;
  }
  document.getElementById("conversation-count").textContent = String(conversations.length);
  renderConversationTabs();
  renderConversationDetail();
}

function renderConversationTabs() {
  const container = document.getElementById("conversation-tabs");
  const conversations = getVisibleConversations();
  container.innerHTML = conversations.length
    ? conversations
    .map(
      (conversation) => `
        <button class="conversation-tab ${conversation.id === selectedConversationId ? "active" : ""}" data-conversation-id="${conversation.id}" role="tab" type="button">
          <h4>${conversation.id} · ${local(conversation.patient)}</h4>
          <p>${local(conversation.procedure)}</p>
          <div class="tab-meta">
            <span>${local(conversation.channel)} · ${conversation.time}</span>
            <span class="${conversation.score >= 80 ? "score-pill good" : "score-pill warn"}">${conversation.score}</span>
          </div>
        </button>
      `,
    )
    .join("")
    : `<div class="empty-state">${text("explorer.noData")}</div>`;
}

function renderConversationDetail() {
  const conversations = getVisibleConversations();
  const conversation = conversations.find((item) => item.id === selectedConversationId) || conversations[0];
  const container = document.getElementById("conversation-detail");

  if (!conversation) {
    container.innerHTML = `<div class="empty-state">${text("explorer.noData")}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <p class="eyebrow">${text("analysis.score")}</p>
        <h3>${local(conversation.patient)} · ${local(conversation.procedure)}</h3>
        <p class="detail-kicker">${text("labels.channel")}: ${local(conversation.channel)} · ${text("labels.value")}: ${conversation.value}</p>
      </div>
      <div class="score-ring" style="--score: ${calculateConversationScore(conversation)}%">
        <strong>${calculateConversationScore(conversation)}</strong>
      </div>
    </div>

    <div class="signal-grid">
      ${signalTile(text("analysis.bookingAttempt"), conversation.bookingAttempt, text("labels.yes"), text("labels.no"))}
      ${signalTile(text("analysis.missedOpportunity"), conversation.missedOpportunity, text("labels.yes"), text("labels.no"))}
      <div class="signal-tile">
        <p>${text("analysis.sentiment")}</p>
        <strong>${local(conversation.sentiment)}</strong>
      </div>
    </div>

    <div class="summary-grid">
      <section>
        <p class="eyebrow">${text("analysis.summary")}</p>
        <p class="summary-copy">${local(conversation.summary)}</p>
      </section>
      <section>
        <p class="eyebrow">${text("analysis.recommendations")}</p>
        <div class="recommendation-list">
          ${conversation.recommendations[currentLang].map((item) => `<div class="recommendation-item">${item}</div>`).join("")}
        </div>
      </section>
    </div>

    <section>
      <p class="eyebrow">${text("analysis.transcript")}</p>
      <div class="transcript">
        ${conversation.signals[currentLang]
          .map(
            ([speaker, line]) => `
              <div class="transcript-line">
                <strong>${speaker}</strong>
                <p>${line}</p>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function resetBookingDrill(metricKey = bookingDrill.metricKey || "confirmedBookings", context = activeReportContext) {
  bookingDrill = {
    metricKey,
    platformId: null,
    sourceId: null,
    contentId: null,
    agentId: null,
    bookingId: null,
    reportTab: "analysis",
    contextIds: null,
    contextLabel: null,
    contextType: null,
    employeeId: null,
    riskKey: null,
  };
  if (context) {
    bookingDrill.contextIds = context.ids;
    bookingDrill.contextLabel = context.label;
  }
}

function stepBookingBack() {
  if (bookingDrill.bookingId) {
    bookingDrill.bookingId = null;
    bookingDrill.reportTab = "analysis";
  } else if (bookingDrill.agentId) {
    bookingDrill.agentId = null;
  } else if (bookingDrill.contentId) {
    bookingDrill.contentId = null;
  } else if (bookingDrill.sourceId) {
    bookingDrill.sourceId = null;
  } else if (bookingDrill.platformId) {
    bookingDrill.platformId = null;
  }
  renderBookingBreakdown();
}

function openBookingModal(metricKey = "confirmedBookings", platformId = null) {
  activeReportContext = null;
  resetBookingDrill(metricKey);
  bookingDrill.platformId = platformId;
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  renderBookingBreakdown();
  document.querySelector("[data-close-booking-modal]")?.focus();
}

function closeBookingModal() {
  const modal = document.getElementById("booking-breakdown-modal");
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  activeReportContext = null;
  document.querySelector("[data-booking-breakdown]")?.focus();
}

document.addEventListener("click", (event) => {
  safeRun("click-handler", () => {
  const navButton = event.target.closest("[data-view]");
  if (navButton) setView(navButton.dataset.view);

  const langButton = event.target.closest("[data-lang]");
  if (langButton) applyLanguage(langButton.dataset.lang);

  const themeButton = event.target.closest("[data-theme]");
  if (themeButton) applyTheme(themeButton.dataset.theme);

  const jumpButton = event.target.closest("[data-jump-analysis]");
  if (jumpButton) setView("analysis");

  const metricButton = event.target.closest("[data-intelligence-metric]");
  if (metricButton) openBookingModal(metricButton.dataset.intelligenceMetric);

  const todayBookingsButton = event.target.closest("[data-today-bookings]");
  if (todayBookingsButton) openTodayBookings();

  const todayConversationsButton = event.target.closest("[data-today-conversations]");
  if (todayConversationsButton) openTodayConversations();

  const problemButton = event.target.closest("[data-problem-report]");
  if (problemButton) openProblemReport();

  const bestEmployeeButton = event.target.closest("[data-best-employee-report]");
  if (bestEmployeeButton) openBestEmployeeReport();

  const employeeScopeButton = event.target.closest("[data-employee-scope]");
  if (employeeScopeButton) openEmployeeReport(employeeScopeButton.dataset.employeeScope);

  const contextBookingButton = event.target.closest("[data-context-booking]");
  if (contextBookingButton) {
    const row = findRowByBookingId(contextBookingButton.dataset.contextBooking);
    if (row) openBookingFromRow(row, bookingDrill.metricKey, getDrillRows());
  }

  const teamActionButton = event.target.closest("[data-team-action]");
  if (teamActionButton) {
    if (teamActionButton.dataset.teamAction === "add") addTeamMember();
    if (teamActionButton.dataset.teamAction === "edit") editTeamMember(teamActionButton.dataset.agentId);
    if (teamActionButton.dataset.teamAction === "delete") deleteTeamMember(teamActionButton.dataset.agentId);
  }

  const revealButton = event.target.closest("[data-reveal-sensitive]");
  if (revealButton) {
    const field = revealButton.dataset.revealSensitive;
    revealedSensitiveFields.add(field);
    logSensitiveReveal({ field, value: field === "name" ? "Ahmad Hassan" : "+971 501234567" });
    renderSettings();
  }

  const fileAnalysisButton = event.target.closest("[data-file-analysis-type]");
  if (fileAnalysisButton) openFileAnalysisDetail(fileAnalysisButton.dataset.fileAnalysisType);

  const fileConversationButton = event.target.closest("[data-file-conversation]");
  if (fileConversationButton) {
    fileAnalysisDrill.conversationId = fileConversationButton.dataset.fileConversation;
    renderFileAnalysisDetail();
  }

  const closeFileButton = event.target.closest("[data-close-file-modal]");
  if (closeFileButton) closeFileAnalysisModal();

  if (event.target.id === "file-analysis-modal") closeFileAnalysisModal();

  const searchBookingButton = event.target.closest("[data-search-booking]");
  if (searchBookingButton) {
    const row = findRowByBookingId(searchBookingButton.dataset.searchBooking);
    if (row) openBookingFromRow(row, "analyzedConversations");
  }

  const alertBookingButton = event.target.closest("[data-alert-booking]");
  if (alertBookingButton) {
    const row = findRowByBookingId(alertBookingButton.dataset.alertBooking);
    if (row) openBookingFromRow(row, "analyzedConversations", [row]);
  }

  const riskButton = event.target.closest("[data-risk-platform]");
  if (riskButton) openRiskReport(riskButton.dataset.riskPlatform);

  const platformOpenButton = event.target.closest("[data-platform-open]");
  if (platformOpenButton) openPlatformReport(platformOpenButton.dataset.platformOpen);

  const platformButton = event.target.closest("[data-drill-platform]");
  if (platformButton) {
    if (!getDrillPlatforms().some((platform) => platform.id === platformButton.dataset.drillPlatform)) {
      activeReportContext = null;
      bookingDrill.contextIds = null;
      bookingDrill.contextLabel = null;
      bookingDrill.contextType = null;
      bookingDrill.employeeId = null;
    }
    bookingDrill.platformId = platformButton.dataset.drillPlatform;
    bookingDrill.sourceId = null;
    bookingDrill.contentId = null;
    bookingDrill.agentId = null;
    bookingDrill.bookingId = null;
    bookingDrill.reportTab = "analysis";
    renderBookingBreakdown();
  }

  const sourceButton = event.target.closest("[data-drill-source]");
  if (sourceButton) {
    bookingDrill.sourceId = sourceButton.dataset.drillSource;
    bookingDrill.contentId = null;
    bookingDrill.agentId = null;
    bookingDrill.bookingId = null;
    bookingDrill.reportTab = "analysis";
    renderBookingBreakdown();
  }

  const contentButton = event.target.closest("[data-drill-content]");
  if (contentButton) {
    bookingDrill.contentId = contentButton.dataset.drillContent;
    bookingDrill.agentId = null;
    bookingDrill.bookingId = null;
    bookingDrill.reportTab = "analysis";
    renderBookingBreakdown();
  }

  const agentButton = event.target.closest("[data-drill-agent]");
  if (agentButton) {
    bookingDrill.agentId = agentButton.dataset.drillAgent;
    bookingDrill.bookingId = null;
    bookingDrill.reportTab = "analysis";
    renderBookingBreakdown();
  }

  const bookingButton = event.target.closest("[data-drill-booking]");
  if (bookingButton) {
    bookingDrill.bookingId = bookingButton.dataset.drillBooking;
    bookingDrill.reportTab = "analysis";
    renderBookingBreakdown();
  }

  const bookingBackButton = event.target.closest("[data-booking-back]");
  if (bookingBackButton) stepBookingBack();

  const bookingResetButton = event.target.closest("[data-booking-reset]");
  if (bookingResetButton) {
    resetBookingDrill(bookingDrill.metricKey, activeReportContext);
    renderBookingBreakdown();
  }

  const reportTabButton = event.target.closest("[data-report-tab]");
  if (reportTabButton) {
    bookingDrill.reportTab = reportTabButton.dataset.reportTab;
    renderBookingBreakdown();
  }

  const closeBookingButton = event.target.closest("[data-close-booking-modal]");
  if (closeBookingButton) closeBookingModal();

  const modalBackdrop = event.target.closest("#booking-breakdown-modal");
  if (event.target === modalBackdrop) closeBookingModal();

  const conversationButton = event.target.closest("[data-conversation-id]");
  if (conversationButton) {
    selectedConversationId = conversationButton.dataset.conversationId;
    renderAnalysis();
  }
  });
});

document.addEventListener("keydown", (event) => {
  safeRun("keydown-handler", () => {
  if (event.key === "Enter" && event.target.id === "ask-platform-input") {
    answerPlatformQuestion(event.target.value);
  }
  if (event.key === "Escape" && !document.getElementById("booking-breakdown-modal").hidden) {
    closeBookingModal();
  }
  if (event.key === "Escape" && !document.getElementById("file-analysis-modal").hidden) {
    closeFileAnalysisModal();
  }
  });
});

document.addEventListener("change", (event) => {
  safeRun("change-handler", () => {
  if (event.target.id === "date-from" || event.target.id === "date-to") {
    dateRange = {
      from: document.getElementById("date-from").value,
      to: document.getElementById("date-to").value,
    };
    activeReportContext = null;
    resetBookingDrill(bookingDrill.metricKey);
    renderDashboard();
    renderAnalysis();
    renderUniversalSearch();
  }

  if (event.target.id === "analysis-file-input" && event.target.files?.[0]) {
    analyzeTestFile(event.target.files[0]);
  }
  });
});

document.addEventListener("input", (event) => {
  safeRun("input-handler", () => {
  if (event.target.id === "global-search") {
    searchQuery = event.target.value;
    renderUniversalSearch();
  }
  if (event.target.id === "file-evidence-search") {
    fileAnalysisDrill.search = event.target.value;
    renderFileAnalysisDetail();
    document.getElementById("file-evidence-search")?.focus();
  }
  });
});

async function replacePlatformData(nextData) {
  platformStore.set(nextData);
  activeReportContext = null;
  resetBookingDrill("confirmedBookings");
  fileAnalysisResult = null;
  renderDashboard();
  renderAnalysis();
}

async function loadPlatformDataFromApi(url, options) {
  await platformStore.loadFromApi(url, options);
  await replacePlatformData(platformStore.get());
}

function bootstrapApp() {
  safeRun("bootstrapApp", () => {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    setView(currentView);
    setupAuthUI();
    loadRealConversations();
  });
}

window.addEventListener("error", (event) => {
  console.error("[Owner Platform] Uncaught error", event.error || event.message);
  showAppError(text("app.bootstrapError"));
});

window.OwnerPlatform = {
  getPlatformData: () => platformStore.get(),
  replacePlatformData,
  loadPlatformDataFromApi,
  refreshDashboard: () => renderDashboard(),
};

const API_BASE_URL = "https://my-server-production-0e71.up.railway.app";

// بيعرض اسم اليوزر المسجل دخول وبيوصل زرار تسجيل الخروج
function setupAuthUI() {
  safeRun("setupAuthUI", () => {
    const nameEl = document.getElementById("sidebar-user-name");
    const logoutBtn = document.getElementById("logout-btn");
    if (nameEl) {
      try {
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;
        nameEl.textContent = user?.name || user?.email || "";
      } catch {
        nameEl.textContent = "";
      }
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("login.html");
      });
    }
  });
}

// بانر بسيط وآمن يعرض عدد المحادثات الحقيقية اللي وصلت من السيرفر،
// من غير ما يحاول يحوّلها لنفس الشكل المعقد بتاع بيانات العرض الوهمية
// (bookingSources المتداخلة ثنائية اللغة). لسه محتاجين نموذج بيانات موحّد
// (راجع "Priority 2: Unified Conversation Model" في ENGINEER_HANDOVER.md)
// قبل ما ندمج البيانات الحقيقية جوه نفس محرك المؤشرات ده.
function showRealDataBanner(count) {
  let banner = document.getElementById("app-info-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "app-info-banner";
    banner.className = "app-info-banner";
    banner.setAttribute("role", "status");
    banner.hidden = true;
    document.body.appendChild(banner);
    banner.addEventListener("click", () => {
      banner.hidden = true;
    });
  }
  const message =
    currentLang === "ar"
      ? `وصلت ${count} محادثة حقيقية من حسابك المربوط. لوحة القيادة تحت لسه بتعرض بيانات تجريبية للعرض.`
      : `${count} real conversation(s) received from your connected account. The dashboard below still shows demo data.`;
  banner.textContent = message;
  banner.hidden = false;
}

// جيب البيانات الحقيقية من السيرفر لو فيه token
async function loadRealConversations() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("login.html");
      return;
    }
    if (!res.ok) return;
    const conversations = await res.json();
    if (Array.isArray(conversations) && conversations.length > 0) {
      showRealDataBanner(conversations.length);
    }
    return conversations;
  } catch (err) {
    console.error("خطأ في جلب البيانات:", err);
  }
}
window.loadRealConversations = loadRealConversations;
bootstrapApp();