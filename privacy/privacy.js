export const auditLog = [];

export const maskName = (name = "") =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0] || ""}${"*".repeat(Math.max(part.length - 1, 3))}`)
    .join(" ");

export const maskPhone = (phone = "") => {
  const value = String(phone);
  const prefix = value.startsWith("+") ? value.slice(0, 4) : "";
  return `${prefix}${prefix ? " " : ""}${"*".repeat(Math.max(value.replace(/\D/g, "").length - prefix.replace(/\D/g, "").length, 8))}`;
};

export const logSensitiveReveal = ({ field, value }) => {
  auditLog.unshift({
    id: `audit-${Date.now()}`,
    action: "sensitive-data-reveal",
    field,
    value,
    timestamp: new Date().toISOString(),
  });
};
