const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export const bookingMeta = (label, value) => `
  <div>
    <span>${label}</span>
    <strong>${value}</strong>
  </div>
`;

export const reportField = (label, value) => `
  <div class="report-field">
    <span>${label}</span>
    <strong>${value}</strong>
  </div>
`;

export const signalTile = (label, value, yesLabel, noLabel) => `
  <div class="signal-tile">
    <p>${label}</p>
    <strong>${value ? yesLabel : noLabel}</strong>
  </div>
`;

export const badge = (label, className) => `<span class="signal-badge ${className}">${label}</span>`;

export const agentKpi = (label, value) => `
  <div class="agent-kpi">
    <span>${label}</span>
    <strong>${value}</strong>
  </div>
`;

export const searchStat = (label, value) => `
  <div class="search-stat">
    <span>${label}</span>
    <strong>${value}</strong>
  </div>
`;

export const settingsField = (label, value) => `
  <div class="settings-field">
    <span>${label}</span>
    <strong>${value}</strong>
  </div>
`;

export const settingsSection = (title, body) => `
  <section class="glass-panel settings-section">
    <div class="section-heading"><h3>${title}</h3></div>
    ${body}
  </section>
`;
