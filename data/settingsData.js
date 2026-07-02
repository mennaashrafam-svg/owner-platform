export const businessSettings = {
  name: "Smart INV Business",
  logo: "SI",
  defaultLanguage: "English / العربية",
  currency: "AED",
  timeZone: "Asia/Dubai",
  industryType: "Business services",
};

export const connectionSettings = [
  { platform: "Facebook", connected: true, lastSync: "2026-05-29 09:30", conversations: 438, leads: 92, bookings: 3 },
  { platform: "Instagram", connected: true, lastSync: "2026-05-29 09:34", conversations: 812, leads: 144, bookings: 8 },
  { platform: "TikTok", connected: true, lastSync: "2026-05-29 08:50", conversations: 265, leads: 41, bookings: 3 },
  { platform: "Google", connected: true, lastSync: "2026-05-29 09:12", conversations: 321, leads: 68, bookings: 7 },
  { platform: "WhatsApp", connected: true, lastSync: "2026-05-29 09:41", conversations: 1090, leads: 156, bookings: 4 },
  { platform: "Snapchat", connected: false, lastSync: "2026-05-28 20:15", conversations: 98, leads: 23, bookings: 4 },
];

export const alertSettings = [
  { key: "newBooking", enabled: true, instant: true, label: { en: "New Booking", ar: "حجز جديد" } },
  { key: "vipLead", enabled: true, label: { en: "VIP Lead", ar: "عميل مهم" } },
  { key: "missedOpportunity", enabled: true, label: { en: "Missed Opportunity", ar: "فرصة ضائعة" } },
  { key: "revenueDrop", enabled: true, label: { en: "Revenue Drop", ar: "انخفاض الإيراد" } },
  { key: "employeeIssue", enabled: true, label: { en: "Employee Performance Issue", ar: "مشكلة أداء موظف" } },
  { key: "campaignFailure", enabled: true, label: { en: "Campaign Failure", ar: "فشل حملة" } },
  { key: "followupFailure", enabled: true, label: { en: "Follow-up Failure", ar: "فشل متابعة" } },
];

export const privacySettings = [
  { key: "maskNames", enabled: true },
  { key: "maskPhones", enabled: true },
  { key: "hideSensitive", enabled: true },
  { key: "ownerOnly", enabled: true },
  { key: "activityLogs", enabled: true },
  { key: "auditLogs", enabled: true },
];
