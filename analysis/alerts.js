import { normalizeSearchText } from "../search/search.js";

export const buildIntelligenceAlerts = ({ rows, language, hasMissedIssue, textHaystack }) => {
  const missedRows = rows.filter(({ booking }) => hasMissedIssue(booking));
  const lowScoreRows = [...rows].filter(({ booking }) => booking.score < 78).sort((a, b) => a.booking.score - b.booking.score);
  const highValueRows = [...rows].filter(({ booking }) => booking.revenue >= 9000).sort((a, b) => b.booking.revenue - a.booking.revenue);
  const priceRows = rows.filter((row) => textHaystack(row).includes(normalizeSearchText("price")) || textHaystack(row).includes(normalizeSearchText("غالي")));
  const campaignRows = rows.filter(({ source }) => ["paidCampaign", "googleAds", "snapchatAds"].includes(source.type));
  const newestBooking = rows[rows.length - 1];
  const isArabic = language === "ar";

  return [
    newestBooking && {
      key: "newBooking",
      priority: isArabic ? "فوري" : "Instant",
      title: isArabic ? "حجز جديد مؤكد" : "New Booking",
      row: newestBooking,
      action: isArabic ? "راجع المصدر والموظف للتأكد من جودة التحويل." : "Review source and employee quality for this conversion.",
    },
    highValueRows[0] && {
      key: "vipLead",
      priority: isArabic ? "عال" : "High",
      title: isArabic ? "عميل مهم يحتاج متابعة" : "VIP lead not followed up",
      row: highValueRows[0],
      action: isArabic ? "ثبّت متابعة المالك أو المدير للحفاظ على قيمة الفرصة." : "Assign owner or manager follow-up to protect the opportunity value.",
    },
    missedRows.length >= 6 && {
      key: "missedOpportunity",
      priority: isArabic ? "عال" : "High",
      title: isArabic ? `${missedRows.length} فرص ضائعة ضمن الفترة` : `${missedRows.length} missed opportunities in this period`,
      row: missedRows[0],
      action: isArabic ? "افتح التقرير وشاهد أكثر اعتراض يتكرر." : "Open the report and inspect the most repeated missed issue.",
    },
    {
      key: "revenueDrop",
      priority: isArabic ? "متوسط" : "Medium",
      title: isArabic ? "انخفاض الإيراد هذا الأسبوع" : "Revenue dropped this week",
      row: lowScoreRows[0] || rows[0],
      action: isArabic ? "قارن المصادر منخفضة التحويل مع أفضل حملة." : "Compare low-converting sources against the best campaign.",
    },
    campaignRows[0] && {
      key: "campaignFailure",
      priority: isArabic ? "متوسط" : "Medium",
      title: isArabic ? "حملة تنفق بدون حجوزات كافية" : "Campaign spent money without bookings",
      row: campaignRows[0],
      action: isArabic ? "راجع الرسائل الأولى ونقطة عرض الموعد." : "Review first responses and the appointment offer point.",
    },
    lowScoreRows[0] && {
      key: "employeeIssue",
      priority: isArabic ? "عال" : "High",
      title: isArabic ? "موظف يخسر عملاء عاليي الاهتمام" : "Employee is losing high-interest leads",
      row: lowScoreRows[0],
      action: isArabic ? "افتح المحادثة الكاملة وحدد نص التدريب المطلوب." : "Open the full conversation and identify the training script needed.",
    },
    priceRows[0] && {
      key: "followupFailure",
      priority: isArabic ? "متوسط" : "Medium",
      title: isArabic ? "اعتراض السعر في ازدياد" : "Price objection increased",
      row: priceRows[0],
      action: isArabic ? "أضف رد نطاق سعري وخيارات دفع قبل ضياع الفرصة." : "Add a price-range and payment-options response before the lead drops.",
    },
  ].filter(Boolean).filter((alert) => alert.row).slice(0, 7);
};
