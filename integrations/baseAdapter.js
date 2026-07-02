export const createPlatformAdapter = (platformId) => ({
  platformId,
  normalizeConversation(rawConversation) {
    return rawConversation;
  },
  normalizeLead(rawLead) {
    return rawLead;
  },
});
