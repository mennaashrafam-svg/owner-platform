import { priceSearchTerms } from "../data/searchData.js";

export const normalizeSearchText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}#@+]+/gu, " ")
    .trim();

export const localizedValues = (value = {}) => {
  if (typeof value !== "object" || value === null) return [value].filter(Boolean);
  return [value.en, value.ar].filter(Boolean);
};

export const translationValues = (translations, key) => [translations.en[key], translations.ar[key]].filter(Boolean);

export const searchCorpus = ({ row, translations, agentProfiles, getResponsibleAgentProfile }) => {
  const { platform, source, content, booking } = row;
  const profile = getResponsibleAgentProfile(booking);

  return [
    booking.id,
    booking.phone,
    ...localizedValues(booking.client),
    ...localizedValues(platform.platform),
    ...translationValues(translations, `sources.${source.type}`),
    ...localizedValues(content.title),
    ...localizedValues(content.detail),
    ...localizedValues(booking.employee),
    ...(profile ? [...localizedValues(profile.name), ...profile.tags, ...profile.aliases] : []),
    ...localizedValues(booking.status),
    ...localizedValues(booking.report.summary),
    ...localizedValues(booking.report.interest),
    ...localizedValues(booking.report.response),
    ...localizedValues(booking.report.bookingQuality),
    ...localizedValues(booking.report.missed),
    ...localizedValues(booking.report.objections),
    ...localizedValues(booking.report.sentiment),
    ...localizedValues(booking.report.notes),
    ...localizedValues(booking.report.recommendation),
    ...(booking.report.messages?.en || []).flatMap(([speaker, line]) => [speaker, line]),
    ...(booking.report.messages?.ar || []).flatMap(([speaker, line]) => [speaker, line]),
  ].filter(Boolean);
};

export const textHaystack = (row, options) => searchCorpus({ row, ...options }).map(normalizeSearchText).join(" ");

export const expandedSearchTerms = (query, { agentProfiles }) => {
  const base = normalizeSearchText(query);
  const priceTerms = priceSearchTerms.map(normalizeSearchText);
  const agentTerms = agentProfiles.flatMap((profile) => [...localizedValues(profile.name), ...profile.aliases, ...profile.tags]).map(normalizeSearchText);
  const terms = [base];

  if (priceTerms.some((term) => base.includes(term))) terms.push(...priceTerms);

  agentTerms.forEach((term) => {
    if (!term || !base.includes(term)) return;
    const profile = agentProfiles.find((item) => [...localizedValues(item.name), ...item.aliases, ...item.tags].map(normalizeSearchText).includes(term));
    if (profile) terms.push(...[...localizedValues(profile.name), ...profile.aliases, ...profile.tags].map(normalizeSearchText));
  });

  return [...new Set(terms.filter(Boolean))];
};

export const matchedSnippet = (row, query, localize) => {
  const parts = [
    ...localizedValues(row.booking.report.summary),
    ...localizedValues(row.booking.report.objections),
    ...localizedValues(row.booking.report.missed),
    ...localizedValues(row.booking.report.recommendation),
    ...(row.booking.report.messages?.en || []).map(([, line]) => line),
    ...(row.booking.report.messages?.ar || []).map(([, line]) => line),
  ];
  const match = parts.find((part) => normalizeSearchText(part).includes(query)) || localize(row.booking.report.summary);
  return match.length > 150 ? `${match.slice(0, 150)}...` : match;
};

export const searchRows = ({ query, rows, translations, agentProfiles, getResponsibleAgentProfile, localize }) => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const terms = expandedSearchTerms(normalizedQuery, { agentProfiles });
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const options = { translations, agentProfiles, getResponsibleAgentProfile };

  return rows
    .map((row) => ({ ...row, haystack: textHaystack(row, options) }))
    .filter((row) => terms.some((term) => row.haystack.includes(term)) || tokens.every((token) => row.haystack.includes(token)))
    .map((row) => ({
      ...row,
      snippet: matchedSnippet(row, terms.find((term) => row.haystack.includes(term)) || tokens.find((token) => row.haystack.includes(token)) || normalizedQuery, localize),
    }));
};
