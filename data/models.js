// Canonical internal models used across data, analysis, search, integrations, and UI.
// Future adapters should normalize platform-specific payloads into these shapes.
export const modelNames = {
  conversation: "Conversation",
  booking: "Booking",
  lead: "Lead",
  agent: "Agent",
  platform: "Platform",
  source: "Source",
  campaign: "Campaign",
  alert: "Alert",
  aiReport: "AIReport",
};

export const modelFields = {
  Conversation: ["id", "date", "time", "customer", "channel", "score", "bookingAttempt", "missedOpportunity", "summary", "signals"],
  Booking: ["id", "client", "employee", "date", "time", "phone", "revenue", "status", "score", "report"],
  Lead: ["id", "platformId", "sourceType", "campaignId", "customer", "createdAt", "status"],
  Agent: ["id", "name", "tags", "aliases", "department", "role"],
  Platform: ["id", "platform", "sources"],
  Source: ["id", "type", "contents"],
  Campaign: ["id", "contentType", "title", "detail", "bookings"],
  Alert: ["key", "priority", "title", "row", "action"],
  AIReport: ["summary", "interest", "response", "bookingQuality", "missed", "objections", "sentiment", "notes", "recommendation", "messages"],
};
