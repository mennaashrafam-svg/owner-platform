import { agentProfiles } from "../data/agents.js";
import { normalizeSearchText, localizedValues } from "../search/search.js";

const normalizeText = normalizeSearchText;

export const allAgentTags = agentProfiles.flatMap((profile) => profile.tags);

export const findAgentById = (id) => agentProfiles.find((profile) => profile.id === id);

export const findAgentByAlias = (employee = {}) => {
  const values = [employee.en, employee.ar].filter(Boolean).map(normalizeText);
  return agentProfiles.find((profile) => profile.aliases.some((alias) => values.includes(normalizeText(alias)))) || null;
};

export const findAgentByTaggedMessages = (report) => {
  const lines = ["en", "ar"].flatMap((lang) => report?.messages?.[lang]?.flatMap(([speaker, line]) => [speaker, line]) || []);
  const normalizedLines = lines.map(normalizeSearchText);
  return agentProfiles.find((profile) => profile.tags.some((tag) => normalizedLines.some((line) => line.includes(normalizeSearchText(tag))))) || null;
};

export const detectAgentFromTags = (report) => findAgentByTaggedMessages(report);

export const ensureAgentTagInMessages = (booking) => {
  const profile = findAgentByAlias(booking.employee);
  if (!profile || !booking.report?.messages) return booking;

  ["en", "ar"].forEach((lang) => {
    const messages = booking.report.messages[lang];
    const tag = lang === "ar" ? profile.tags.find((item) => /[ء-ي]/.test(item)) || profile.tags[0] : profile.tags[0];
    if (!messages || messages.some(([, line]) => allAgentTags.some((candidate) => String(line).includes(candidate)))) return;
    const target = messages[1];
    if (target) target[1] = `${target[1]} ${tag}`;
  });

  return booking;
};

export const getAgentSearchValues = (profile) => [...localizedValues(profile.name), ...profile.tags, ...profile.aliases];
