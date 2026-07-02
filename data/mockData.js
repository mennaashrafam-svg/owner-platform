import { ensureAgentTagInMessages } from "../analysis/agentDetection.js";
import { createReport } from "../analysis/reports.js";
import { getConversationOutcome } from "../analysis/metrics.js";

export const bookingDates = [
  "2026-05-02",
  "2026-05-04",
  "2026-05-06",
  "2026-05-08",
  "2026-05-10",
  "2026-05-12",
  "2026-05-14",
  "2026-05-16",
  "2026-05-18",
  "2026-05-20",
  "2026-05-22",
  "2026-05-24",
  "2026-05-26",
];
let bookingSequence = 0;

const createBooking = ({ id, client, employee, time, score, report, date, revenue, status }) => {
  const sequence = bookingSequence++;
  const booking = {
    id,
    client,
    employee,
    time,
    score,
    date: date || bookingDates[sequence % bookingDates.length],
    phone: `***${4200 + sequence}`,
    revenue: revenue || 1800 + (sequence % 7) * 650,
    status: status || { en: "Confirmed", ar: "مؤكد" },
    report,
  };
  booking.outcome = getConversationOutcome(booking);
  return ensureAgentTagInMessages(booking);
};

export const data = {
  bookingSources: [
    {
      id: "instagram",
      platform: { en: "Instagram", ar: "إنستغرام" },
      sources: [
        {
          id: "instagram-paid",
          type: "paidCampaign",
          contents: [
            {
              id: "ig-smile-design",
              contentType: "campaign",
              title: { en: "Smile Design Consultation Ads", ar: "إعلانات استشارة تصميم الابتسامة" },
              detail: { en: "Lead campaign for cosmetic dentistry consultations", ar: "حملة عملاء محتملين لاستشارات تجميل الأسنان" },
              bookings: [
                createBooking({
                  id: "BK-IG-201",
                  client: { en: "Client IG-201", ar: "عميل IG-201" },
                  employee: { en: "Sara M.", ar: "سارة م." },
                  time: "09:18",
                  score: 91,
                  report: createReport({
                    summary: {
                      en: "Client asked about veneers and accepted a same-week consultation after the coordinator explained doctor assessment and timing.",
                      ar: "سأل العميل عن الفينير وقبل استشارة خلال نفس الأسبوع بعد شرح التقييم الطبي والمدة.",
                    },
                    interest: { en: "Very high", ar: "مرتفع جدا" },
                    response: { en: "Precise and reassuring", ar: "دقيق ومطمئن" },
                    bookingQuality: { en: "Strong two-slot close", ar: "إغلاق قوي بخيارين للموعد" },
                    missed: { en: "No major missed opportunity", ar: "لا توجد فرصة ضائعة مؤثرة" },
                    objections: { en: "Price range requested", ar: "طلب نطاق السعر" },
                    sentiment: { en: "Confident", ar: "واثق" },
                    notes: { en: "Coordinator kept the conversation focused on diagnosis before price.", ar: "حافظت المسؤولة على التركيز على التشخيص قبل السعر." },
                    recommendation: { en: "Send before/after case examples before the visit.", ar: "إرسال أمثلة قبل وبعد قبل الزيارة." },
                    messages: {
                      en: [["Client", "I want a natural smile design."], ["Sara M.", "The doctor can assess shape and shade this week."], ["AI", "Booking closed with high intent and clear next step."]],
                      ar: [["العميل", "أريد تصميم ابتسامة طبيعي."], ["سارة م.", "يمكن للطبيب تقييم الشكل واللون هذا الأسبوع."], ["الذكاء", "تم إغلاق الحجز بنية عالية وخطوة واضحة."]],
                    },
                  }),
                }),
                createBooking({
                  id: "BK-IG-202",
                  client: { en: "Client IG-202", ar: "عميل IG-202" },
                  employee: { en: "Nadine K.", ar: "نادين ك." },
                  time: "10:44",
                  score: 87,
                  report: createReport({
                    summary: {
                      en: "Client moved from ad inquiry to confirmed consultation after financing availability was clarified.",
                      ar: "انتقل العميل من استفسار إعلاني إلى حجز مؤكد بعد توضيح توفر خيارات الدفع.",
                    },
                    interest: { en: "High", ar: "مرتفع" },
                    response: { en: "Clear with good empathy", ar: "واضح مع تعاطف جيد" },
                    bookingQuality: { en: "Good urgency framing", ar: "صياغة جيدة للاستعجال" },
                    missed: { en: "Could have asked treatment timeline earlier", ar: "كان يمكن سؤال موعد الرغبة بالعلاج مبكرا" },
                    objections: { en: "Financing concern", ar: "قلق من الدفع" },
                    sentiment: { en: "Interested and cautious", ar: "مهتم وحذر" },
                    notes: { en: "Handled financing without discounting the clinical value.", ar: "تعاملت مع الدفع دون تقليل قيمة الرعاية." },
                    recommendation: { en: "Add a follow-up note for financing documents.", ar: "إضافة متابعة لمستندات خيارات الدفع." },
                    messages: {
                      en: [["Client", "Do you have payment plans?"], ["Nadine K.", "Yes, we can explain options during consultation."], ["AI", "Objection handled and booking confirmed."]],
                      ar: [["العميل", "هل توجد خطط دفع؟"], ["نادين ك.", "نعم، يمكن شرح الخيارات أثناء الاستشارة."], ["الذكاء", "تمت معالجة الاعتراض وتأكيد الحجز."]],
                    },
                  }),
                }),
                createBooking({
                  id: "BK-IG-203",
                  client: { en: "Client IG-203", ar: "عميل IG-203" },
                  employee: { en: "Omar A.", ar: "عمر أ." },
                  time: "11:27",
                  score: 84,
                  report: createReport({
                    summary: {
                      en: "Client asked about whitening versus veneers and booked a diagnostic visit after receiving a comparison response.",
                      ar: "سأل العميل عن الفرق بين التبييض والفينير وحجز زيارة تشخيصية بعد تلقي مقارنة واضحة.",
                    },
                    interest: { en: "High", ar: "مرتفع" },
                    response: { en: "Useful clinical framing", ar: "توجيه طبي مفيد" },
                    bookingQuality: { en: "Confirmed with moderate urgency", ar: "تم التأكيد مع استعجال متوسط" },
                    missed: { en: "No treatment goal captured", ar: "لم يتم تسجيل الهدف التجميلي بدقة" },
                    objections: { en: "Procedure uncertainty", ar: "عدم وضوح الإجراء المناسب" },
                    sentiment: { en: "Curious", ar: "فضولي" },
                    notes: { en: "Good education, slightly slow to offer the slot.", ar: "تثقيف جيد مع تأخر بسيط في عرض الموعد." },
                    recommendation: { en: "Ask for desired shade and event date before visit.", ar: "اسأل عن درجة اللون المطلوبة وتاريخ المناسبة قبل الزيارة." },
                    messages: {
                      en: [["Client", "Is whitening enough or do I need veneers?"], ["Omar A.", "A consultation will show what is best for your enamel."], ["AI", "Booking confirmed after clinical education."]],
                      ar: [["العميل", "هل التبييض يكفي أم أحتاج فينير؟"], ["عمر أ.", "الاستشارة توضح الأنسب لمينا الأسنان."], ["الذكاء", "تم تأكيد الحجز بعد تثقيف طبي."]],
                    },
                  }),
                }),
              ],
            },
            {
              id: "ig-implant-reel",
              contentType: "reel",
              title: { en: "Implant Confidence Reel", ar: "ريل الثقة بزراعة الأسنان" },
              detail: { en: "Reel promoted from implant education content", ar: "ريل ممول من محتوى تثقيف زراعة الأسنان" },
              bookings: [
                createBooking({
                  id: "BK-IG-204",
                  client: { en: "Client IG-204", ar: "عميل IG-204" },
                  employee: { en: "Sara M.", ar: "سارة م." },
                  time: "12:05",
                  score: 82,
                  report: createReport({
                    summary: { en: "Client had implant interest and confirmed an assessment after healing time was explained.", ar: "كان لدى العميل اهتمام بالزراعة وأكد التقييم بعد شرح مدة التعافي." },
                    interest: { en: "High", ar: "مرتفع" },
                    response: { en: "Reassuring", ar: "مطمئن" },
                    bookingQuality: { en: "Good slot proposal", ar: "اقتراح موعد جيد" },
                    missed: { en: "Could mention CBCT availability", ar: "كان يمكن ذكر توفر التصوير ثلاثي الأبعاد" },
                    objections: { en: "Recovery concern", ar: "قلق من التعافي" },
                    sentiment: { en: "Anxious but motivated", ar: "قلق لكن متحمس" },
                    notes: { en: "Good empathy around surgery concerns.", ar: "تعاطف جيد مع مخاوف الجراحة." },
                    recommendation: { en: "Send recovery guide before appointment.", ar: "إرسال دليل التعافي قبل الموعد." },
                    messages: { en: [["Client", "How long does implant recovery take?"], ["Sara M.", "The doctor will assess bone and explain timing clearly."], ["AI", "Recovery objection resolved enough to book."]], ar: [["العميل", "كم تستغرق فترة التعافي من الزراعة؟"], ["سارة م.", "سيقيم الطبيب العظم ويشرح المدة بوضوح."], ["الذكاء", "تمت معالجة قلق التعافي بشكل كاف للحجز."]] },
                  }),
                }),
                createBooking({
                  id: "BK-IG-205",
                  client: { en: "Client IG-205", ar: "عميل IG-205" },
                  employee: { en: "Nadine K.", ar: "نادين ك." },
                  time: "13:36",
                  score: 79,
                  report: createReport({
                    summary: { en: "Client asked if implants are painful and accepted a doctor consultation after reassurance.", ar: "سأل العميل إن كانت الزراعة مؤلمة وقبل استشارة الطبيب بعد الطمأنة." },
                    interest: { en: "Medium-high", ar: "متوسط إلى مرتفع" },
                    response: { en: "Empathetic but brief", ar: "متعاطف لكن مختصر" },
                    bookingQuality: { en: "Confirmed, but could be sharper", ar: "مؤكد لكن يحتاج حسم أكثر" },
                    missed: { en: "No mention of sedation options", ar: "لم يتم ذكر خيارات التهدئة" },
                    objections: { en: "Pain concern", ar: "الخوف من الألم" },
                    sentiment: { en: "Nervous", ar: "متوتر" },
                    notes: { en: "Coordinator reassured well but missed a trust-building detail.", ar: "طمأنت المسؤولة جيدا لكنها فوتت تفصيل بناء ثقة." },
                    recommendation: { en: "Add a pain-management reassurance script.", ar: "إضافة صيغة طمأنة لإدارة الألم." },
                    messages: { en: [["Client", "Is implant surgery painful?"], ["Nadine K.", "Most patients are comfortable with local anesthesia."], ["AI", "Booking confirmed with one missed reassurance point."]], ar: [["العميل", "هل جراحة الزراعة مؤلمة؟"], ["نادين ك.", "معظم المرضى يكونون مرتاحين مع التخدير الموضعي."], ["الذكاء", "تم تأكيد الحجز مع نقطة طمأنة ناقصة."]] },
                  }),
                }),
              ],
            },
          ],
        },
        {
          id: "instagram-organic",
          type: "organicDm",
          contents: [
            {
              id: "ig-before-after",
              contentType: "organic",
              title: { en: "Before / After Highlight", ar: "هايلايت قبل وبعد" },
              detail: { en: "Organic profile DM from treatment highlights", ar: "رسالة عضوية من هايلايت النتائج" },
              bookings: [
                createBooking({ id: "BK-IG-206", client: { en: "Client IG-206", ar: "عميل IG-206" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "14:22", score: 88, report: createReport({ summary: { en: "Client referenced before/after results and booked after seeing similar cases.", ar: "أشار العميل إلى نتائج قبل وبعد وحجز بعد رؤية حالات مشابهة." }, interest: { en: "Very high", ar: "مرتفع جدا" }, response: { en: "Personalized", ar: "مخصص" }, bookingQuality: { en: "Smooth consult close", ar: "إغلاق استشارة سلس" }, missed: { en: "None", ar: "لا يوجد" }, objections: { en: "Wanted proof of similar cases", ar: "طلب دليلا لحالات مشابهة" }, sentiment: { en: "Excited", ar: "متحمس" }, notes: { en: "Excellent use of social proof.", ar: "استخدام ممتاز للدليل الاجتماعي." }, recommendation: { en: "Tag this as a strong organic content win.", ar: "وسم هذه الحالة كنجاح قوي للمحتوى العضوي." }, messages: { en: [["Client", "I saw the case in your highlights."], ["Leen R.", "We can assess if the same approach fits you."], ["AI", "Organic proof converted into booking."]], ar: [["العميل", "رأيت الحالة في الهايلايت."], ["لين ر.", "يمكننا تقييم إن كانت نفس الخطة تناسبك."], ["الذكاء", "تحول الدليل العضوي إلى حجز."]] } }) }),
                createBooking({ id: "BK-IG-207", client: { en: "Client IG-207", ar: "عميل IG-207" }, employee: { en: "Sara M.", ar: "سارة م." }, time: "16:08", score: 85, report: createReport({ summary: { en: "Client asked for a natural aesthetic result and booked a consultation after expectations were set.", ar: "طلب العميل نتيجة تجميلية طبيعية وحجز استشارة بعد توضيح التوقعات." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Clear and warm", ar: "واضح ودافئ" }, bookingQuality: { en: "Good", ar: "جيد" }, missed: { en: "Could collect preferred doctor", ar: "كان يمكن معرفة الطبيب المفضل" }, objections: { en: "Natural look concern", ar: "قلق من الشكل الطبيعي" }, sentiment: { en: "Hopeful", ar: "متفائل" }, notes: { en: "Tone matched a premium aesthetic patient.", ar: "النبرة مناسبة لمريض تجميلي يبحث عن تجربة راقية." }, recommendation: { en: "Send aesthetic questionnaire before visit.", ar: "إرسال استبيان تجميلي قبل الزيارة." }, messages: { en: [["Client", "I do not want an artificial look."], ["Sara M.", "The doctor focuses on natural proportions."], ["AI", "Expectation concern handled and booked."]], ar: [["العميل", "لا أريد شكلا مصطنعا."], ["سارة م.", "يركز الطبيب على النسب الطبيعية."], ["الذكاء", "تمت معالجة التوقعات وتأكيد الحجز."]] } }) }),
              ],
            },
          ],
        },
        {
          id: "instagram-story",
          type: "storyReply",
          contents: [
            {
              id: "ig-clinic-tour",
              contentType: "organic",
              title: { en: "Clinic Tour Story", ar: "قصة جولة العيادة" },
              detail: { en: "Story reply from clinic environment content", ar: "رد على قصة تعرض بيئة العيادة" },
              bookings: [
                createBooking({ id: "BK-IG-208", client: { en: "Client IG-208", ar: "عميل IG-208" }, employee: { en: "Omar A.", ar: "عمر أ." }, time: "17:12", score: 83, report: createReport({ summary: { en: "Client replied to the clinic tour and booked after asking about location and parking.", ar: "رد العميل على جولة العيادة وحجز بعد السؤال عن الموقع والمواقف." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Operationally clear", ar: "واضح من ناحية التشغيل" }, bookingQuality: { en: "Efficient", ar: "فعال" }, missed: { en: "No service cross-sell", ar: "لا يوجد عرض لخدمة إضافية" }, objections: { en: "Location convenience", ar: "ملاءمة الموقع" }, sentiment: { en: "Comfortable", ar: "مرتاح" }, notes: { en: "Good practical closing with map context.", ar: "إغلاق عملي جيد مع توضيح الموقع." }, recommendation: { en: "Send parking instructions automatically.", ar: "إرسال تعليمات المواقف تلقائيا." }, messages: { en: [["Client", "Where exactly is the clinic?"], ["Omar A.", "We are in Jumeirah with parking in the building."], ["AI", "Practical objection cleared and booking confirmed."]], ar: [["العميل", "أين موقع العيادة بالضبط؟"], ["عمر أ.", "نحن في جميرا مع مواقف في المبنى."], ["الذكاء", "تمت إزالة الاعتراض العملي وتأكيد الحجز."]] } }) }),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "tiktok",
      platform: { en: "TikTok", ar: "تيك توك" },
      sources: [
        { id: "tiktok-paid", type: "paidCampaign", contents: [{ id: "tt-aligner-ad", contentType: "campaign", title: { en: "Clear Aligner Spark Ad", ar: "إعلان التقويم الشفاف" }, detail: { en: "Paid video campaign for aligner assessments", ar: "حملة فيديو مدفوعة لتقييم التقويم الشفاف" }, bookings: [createBooking({ id: "BK-TT-301", client: { en: "Client TT-301", ar: "عميل TT-301" }, employee: { en: "Maya H.", ar: "مايا هـ." }, time: "10:06", score: 80, report: createReport({ summary: { en: "Client came from aligner ad and booked after treatment duration was clarified.", ar: "جاء العميل من إعلان التقويم وحجز بعد توضيح مدة العلاج." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Concise", ar: "مختصر" }, bookingQuality: { en: "Good", ar: "جيد" }, missed: { en: "No payment-plan prompt", ar: "لم يتم طرح خيارات الدفع" }, objections: { en: "Treatment duration", ar: "مدة العلاج" }, sentiment: { en: "Focused", ar: "مركز" }, notes: { en: "Coordinator answered quickly and moved to booking.", ar: "أجابت المسؤولة بسرعة وانتقلت للحجز." }, recommendation: { en: "Add aligner eligibility pre-question.", ar: "إضافة سؤال تأهيلي للتقويم الشفاف." }, messages: { en: [["Client", "How long do clear aligners take?"], ["Maya H.", "The doctor can estimate after scanning your teeth."], ["AI", "Booking confirmed after duration objection."]], ar: [["العميل", "كم تستغرق مدة التقويم الشفاف؟"], ["مايا هـ.", "يمكن للطبيب التقدير بعد فحص الأسنان."], ["الذكاء", "تم تأكيد الحجز بعد اعتراض المدة."]] } }) })] }] },
        { id: "tiktok-comment", type: "commentReply", contents: [{ id: "tt-braces-video", contentType: "comment", title: { en: "Comment on Braces Transformation Video", ar: "تعليق على فيديو تحول التقويم" }, detail: { en: "Replies from treatment transformation comments", ar: "ردود من تعليقات فيديو تحول علاجي" }, bookings: [createBooking({ id: "BK-TT-302", client: { en: "Client TT-302", ar: "عميل TT-302" }, employee: { en: "Maya H.", ar: "مايا هـ." }, time: "13:19", score: 76, report: createReport({ summary: { en: "Client commented asking if their bite could be fixed and booked after a DM follow-up.", ar: "علق العميل سائلا إن كان يمكن تعديل العضة وحجز بعد متابعة برسالة." }, interest: { en: "Medium-high", ar: "متوسط إلى مرتفع" }, response: { en: "Helpful but reactive", ar: "مفيد لكنه تفاعلي" }, bookingQuality: { en: "Confirmed after follow-up", ar: "تم التأكيد بعد المتابعة" }, missed: { en: "Could ask for concern photo privately", ar: "كان يمكن طلب صورة خاصة للمشكلة" }, objections: { en: "Eligibility uncertainty", ar: "عدم التأكد من الأهلية" }, sentiment: { en: "Curious", ar: "فضولي" }, notes: { en: "Good conversion from public comment to private booking.", ar: "تحويل جيد من تعليق عام إلى حجز خاص." }, recommendation: { en: "Use a saved reply that moves comments to DM faster.", ar: "استخدام رد محفوظ ينقل التعليقات إلى الرسائل بسرعة أكبر." }, messages: { en: [["Client", "Can this fix an overbite?"], ["Maya H.", "Let us assess it privately and book you with the orthodontist."], ["AI", "Comment converted to booking."]], ar: [["العميل", "هل يعالج هذا بروز العضة؟"], ["مايا هـ.", "دعنا نقيمها خاص ونحجز لك مع أخصائي التقويم."], ["الذكاء", "تحول التعليق إلى حجز."]] } }) }), createBooking({ id: "BK-TT-303", client: { en: "Client TT-303", ar: "عميل TT-303" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "15:41", score: 73, report: createReport({ summary: { en: "Client asked from a TikTok comment about braces pain and booked a consult after reassurance.", ar: "سأل العميل من تعليق تيك توك عن ألم التقويم وحجز استشارة بعد الطمأنة." }, interest: { en: "Medium", ar: "متوسط" }, response: { en: "Warm", ar: "دافئ" }, bookingQuality: { en: "Adequate", ar: "مناسب" }, missed: { en: "No clear timeline question", ar: "لم يتم سؤال الجدول الزمني بوضوح" }, objections: { en: "Pain concern", ar: "قلق من الألم" }, sentiment: { en: "Nervous", ar: "متوتر" }, notes: { en: "Good empathy; needs a stronger close.", ar: "تعاطف جيد ويحتاج إغلاقا أقوى." }, recommendation: { en: "Offer two appointment options immediately after reassurance.", ar: "عرض خيارين للموعد مباشرة بعد الطمأنة." }, messages: { en: [["Client", "Does braces hurt a lot?"], ["Leen R.", "The orthodontist will guide you and discomfort is manageable."], ["AI", "Booking confirmed with moderate close strength."]], ar: [["العميل", "هل التقويم مؤلم جدا؟"], ["لين ر.", "سيشرح لك أخصائي التقويم والألم يمكن التحكم به."], ["الذكاء", "تم تأكيد الحجز بقوة إغلاق متوسطة."]] } }) })] }] },
      ],
    },
    {
      id: "whatsapp",
      platform: { en: "WhatsApp", ar: "واتساب" },
      sources: [
        { id: "whatsapp-paid", type: "paidCampaign", contents: [{ id: "wa-implant-link", contentType: "campaign", title: { en: "Implant Landing Page WhatsApp Link", ar: "رابط واتساب لصفحة زراعة الأسنان" }, detail: { en: "WhatsApp clicks from implant landing page ads", ar: "نقرات واتساب من إعلانات صفحة الزراعة" }, bookings: [createBooking({ id: "BK-WA-401", client: { en: "Client WA-401", ar: "عميل WA-401" }, employee: { en: "Nadine K.", ar: "نادين ك." }, time: "09:52", score: 90, report: createReport({ summary: { en: "Client clicked WhatsApp from an implant page and booked after availability was matched.", ar: "ضغط العميل على واتساب من صفحة الزراعة وحجز بعد مطابقة الموعد المناسب." }, interest: { en: "Very high", ar: "مرتفع جدا" }, response: { en: "Fast and complete", ar: "سريع ومكتمل" }, bookingQuality: { en: "Excellent", ar: "ممتاز" }, missed: { en: "None", ar: "لا يوجد" }, objections: { en: "Schedule fit", ar: "ملاءمة الوقت" }, sentiment: { en: "Ready", ar: "جاهز" }, notes: { en: "Strong handling of a high-intent WhatsApp lead.", ar: "تعامل قوي مع عميل واتساب عالي النية." }, recommendation: { en: "Mark as high-value implant pipeline.", ar: "وسمها كفرصة عالية القيمة للزراعة." }, messages: { en: [["Client", "I clicked from the implant page. Is tomorrow possible?"], ["Nadine K.", "Yes, 4:00 PM is available for assessment."], ["AI", "High-intent lead converted quickly."]], ar: [["العميل", "دخلت من صفحة الزراعة. هل غدا مناسب؟"], ["نادين ك.", "نعم، الساعة 4:00 متاحة للتقييم."], ["الذكاء", "تم تحويل عميل عالي النية بسرعة."]] } }) }), createBooking({ id: "BK-WA-402", client: { en: "Client WA-402", ar: "عميل WA-402" }, employee: { en: "Omar A.", ar: "عمر أ." }, time: "12:48", score: 81, report: createReport({ summary: { en: "Client asked about implant consultation cost and confirmed after the assessment value was explained.", ar: "سأل العميل عن تكلفة استشارة الزراعة وأكد بعد شرح قيمة التقييم." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Clear", ar: "واضح" }, bookingQuality: { en: "Good", ar: "جيد" }, missed: { en: "Could mention doctor credentials", ar: "كان يمكن ذكر خبرة الطبيب" }, objections: { en: "Consultation fee", ar: "رسوم الاستشارة" }, sentiment: { en: "Practical", ar: "عملي" }, notes: { en: "Good value framing, short on authority proof.", ar: "شرح جيد للقيمة مع نقص بسيط في إثبات الخبرة." }, recommendation: { en: "Add doctor credential line to implant script.", ar: "إضافة سطر عن خبرة الطبيب في نص الزراعة." }, messages: { en: [["Client", "How much is the implant consultation?"], ["Omar A.", "It includes assessment and treatment planning."], ["AI", "Fee concern handled and booking confirmed."]], ar: [["العميل", "كم سعر استشارة الزراعة؟"], ["عمر أ.", "تشمل التقييم وخطة العلاج."], ["الذكاء", "تمت معالجة قلق الرسوم وتأكيد الحجز."]] } }) })] }] },
        { id: "whatsapp-direct", type: "directMessage", contents: [{ id: "wa-direct-thread", contentType: "organic", title: { en: "Returning Patient Direct Thread", ar: "محادثة مباشرة لمريض سابق" }, detail: { en: "Direct WhatsApp contact from saved clinic number", ar: "تواصل واتساب مباشر من رقم العيادة المحفوظ" }, bookings: [createBooking({ id: "BK-WA-403", client: { en: "Client WA-403", ar: "عميل WA-403" }, employee: { en: "Sara M.", ar: "سارة م." }, time: "14:31", score: 86, report: createReport({ summary: { en: "Returning client booked a hygiene appointment after asking for the same doctor.", ar: "حجز عميل سابق موعد تنظيف بعد طلب نفس الطبيب." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Efficient", ar: "فعال" }, bookingQuality: { en: "Strong repeat-client flow", ar: "مسار قوي لعميل متكرر" }, missed: { en: "Could offer family booking", ar: "كان يمكن عرض حجز للعائلة" }, objections: { en: "Doctor preference", ar: "تفضيل الطبيب" }, sentiment: { en: "Loyal", ar: "وفي" }, notes: { en: "Employee recognized repeat intent and reduced friction.", ar: "تعرفت الموظفة على نية العودة وخففت الاحتكاك." }, recommendation: { en: "Add recall campaign tag.", ar: "إضافة وسم حملة تذكير." }, messages: { en: [["Client", "Can I book with the same doctor?"], ["Sara M.", "Yes, Dr. Lina has availability Thursday."], ["AI", "Repeat booking handled cleanly."]], ar: [["العميل", "هل يمكن الحجز مع نفس الطبيب؟"], ["سارة م.", "نعم، د. لينا متاحة الخميس."], ["الذكاء", "تم التعامل مع الحجز المتكرر بسلاسة."]] } }) }), createBooking({ id: "BK-WA-404", client: { en: "Client WA-404", ar: "عميل WA-404" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "18:05", score: 78, report: createReport({ summary: { en: "Client directly requested a pediatric dental slot and booked after reassurance about child-friendly handling.", ar: "طلب العميل مباشرة موعد أسنان للأطفال وحجز بعد الطمأنة حول التعامل مع الطفل." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Warm", ar: "دافئ" }, bookingQuality: { en: "Confirmed", ar: "مؤكد" }, missed: { en: "No pre-visit child prep sent", ar: "لم يتم إرسال تحضير الطفل قبل الزيارة" }, objections: { en: "Child fear", ar: "خوف الطفل" }, sentiment: { en: "Concerned parent", ar: "ولي أمر قلق" }, notes: { en: "Good empathy, needs automated prep follow-up.", ar: "تعاطف جيد ويحتاج متابعة تحضيرية تلقائية." }, recommendation: { en: "Send child preparation message after confirmation.", ar: "إرسال رسالة تحضير الطفل بعد التأكيد." }, messages: { en: [["Client", "My son is afraid of dentists."], ["Leen R.", "Our pediatric doctor starts gently and explains each step."], ["AI", "Empathy helped confirm the booking."]], ar: [["العميل", "ابني يخاف من طبيب الأسنان."], ["لين ر.", "طبيب الأطفال يبدأ بلطف ويشرح كل خطوة."], ["الذكاء", "ساعد التعاطف على تأكيد الحجز."]] } }) })] }] },
      ],
    },
    {
      id: "facebook",
      platform: { en: "Facebook", ar: "فيسبوك" },
      sources: [
        { id: "facebook-paid", type: "paidCampaign", contents: [{ id: "fb-family-checkup", contentType: "campaign", title: { en: "Family Dental Checkup Campaign", ar: "حملة فحص الأسنان العائلية" }, detail: { en: "Facebook lead campaign for family dental visits", ar: "حملة عملاء محتملين لفحوصات الأسنان العائلية" }, bookings: [createBooking({ id: "BK-FB-501", client: { en: "Client FB-501", ar: "عميل FB-501" }, employee: { en: "Maya H.", ar: "مايا هـ." }, time: "10:55", score: 83, report: createReport({ summary: { en: "Parent booked two checkups after asking about family availability.", ar: "حجز ولي الأمر فحصين بعد السؤال عن توفر العائلة." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Organized", ar: "منظم" }, bookingQuality: { en: "Good multi-booking close", ar: "إغلاق جيد لأكثر من حجز" }, missed: { en: "Could suggest family recall plan", ar: "كان يمكن اقتراح خطة تذكير عائلية" }, objections: { en: "Coordinating family times", ar: "تنسيق أوقات العائلة" }, sentiment: { en: "Practical", ar: "عملي" }, notes: { en: "Good handling of multiple schedules.", ar: "تعامل جيد مع عدة مواعيد." }, recommendation: { en: "Tag household account for recall.", ar: "وسم حساب العائلة للتذكير." }, messages: { en: [["Client", "Can I bring both children on the same day?"], ["Maya H.", "Yes, we can place them back-to-back."], ["AI", "Family booking opportunity converted."]], ar: [["العميل", "هل يمكن إحضار الطفلين في نفس اليوم؟"], ["مايا هـ.", "نعم، يمكن ترتيب المواعيد متتالية."], ["الذكاء", "تم تحويل فرصة حجز عائلية."]] } }) }), createBooking({ id: "BK-FB-502", client: { en: "Client FB-502", ar: "عميل FB-502" }, employee: { en: "Omar A.", ar: "عمر أ." }, time: "15:28", score: 75, report: createReport({ summary: { en: "Client booked a general checkup from a Facebook ad after insurance questions were answered.", ar: "حجز العميل فحصا عاما من إعلان فيسبوك بعد الإجابة عن أسئلة التأمين." }, interest: { en: "Medium-high", ar: "متوسط إلى مرتفع" }, response: { en: "Adequate", ar: "مناسب" }, bookingQuality: { en: "Confirmed with some delay", ar: "تم التأكيد مع بعض التأخير" }, missed: { en: "Could ask about preferred branch earlier", ar: "كان يمكن سؤال الفرع المفضل مبكرا" }, objections: { en: "Insurance coverage", ar: "التغطية التأمينية" }, sentiment: { en: "Cautious", ar: "حذر" }, notes: { en: "Solid answer, slower close than ideal.", ar: "إجابة جيدة لكن الإغلاق أبطأ من المطلوب." }, recommendation: { en: "Add insurance triage shortcut.", ar: "إضافة مسار سريع لفرز التأمين." }, messages: { en: [["Client", "Do you accept my insurance?"], ["Omar A.", "We can verify it before your appointment."], ["AI", "Insurance objection handled, close could be faster."]], ar: [["العميل", "هل تقبلون التأمين الخاص بي؟"], ["عمر أ.", "يمكننا التحقق منه قبل الموعد."], ["الذكاء", "تمت معالجة اعتراض التأمين وكان يمكن الإغلاق أسرع."]] } }) })] }] },
        { id: "facebook-direct", type: "directMessage", contents: [{ id: "fb-page-inbox", contentType: "organic", title: { en: "Clinic Page Inbox", ar: "صندوق رسائل صفحة العيادة" }, detail: { en: "Direct message to clinic Facebook page", ar: "رسالة مباشرة إلى صفحة العيادة في فيسبوك" }, bookings: [createBooking({ id: "BK-FB-503", client: { en: "Client FB-503", ar: "عميل FB-503" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "17:50", score: 82, report: createReport({ summary: { en: "Client messaged the Facebook page for gum bleeding and booked after urgency was triaged.", ar: "راسل العميل صفحة فيسبوك بسبب نزيف اللثة وحجز بعد تحديد درجة الاستعجال." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Clinically careful", ar: "حذر طبيا" }, bookingQuality: { en: "Strong safety-led booking", ar: "حجز قوي قائم على السلامة" }, missed: { en: "No pre-visit symptom checklist", ar: "لا توجد قائمة أعراض قبل الزيارة" }, objections: { en: "Urgency uncertainty", ar: "عدم وضوح الاستعجال" }, sentiment: { en: "Worried", ar: "قلق" }, notes: { en: "Good triage tone without overdiagnosing.", ar: "نبرة فرز جيدة دون تشخيص زائد." }, recommendation: { en: "Send symptom checklist and care instructions.", ar: "إرسال قائمة أعراض وتعليمات رعاية." }, messages: { en: [["Client", "My gums bleed when brushing."], ["Leen R.", "It is best to let the dentist check it soon."], ["AI", "Concern triaged and booking confirmed."]], ar: [["العميل", "لثتي تنزف عند التفريش."], ["لين ر.", "الأفضل أن يفحصها الطبيب قريبا."], ["الذكاء", "تم فرز القلق وتأكيد الحجز."]] } }) })] }] },
      ],
    },
  ],
  channels: [
    { en: "Phone", ar: "الهاتف", score: 91 },
    { en: "WhatsApp", ar: "واتساب", score: 87 },
    { en: "Instagram", ar: "إنستغرام", score: 82 },
    { en: "Web Chat", ar: "دردشة الموقع", score: 94 },
  ],
  risks: [
    {
      en: "No price range offered",
      ar: "لم يتم تقديم نطاق سعري",
      detailEn: "14 high-intent customers asked about premium services or outcomes.",
      detailAr: "14 مريضا عالي النية سألوا عن الزراعة أو التجميل.",
      risk: 76,
    },
    {
      en: "No follow-up after hesitation",
      ar: "لا توجد متابعة بعد التردد",
      detailEn: "9 conversations ended after insurance or timing concerns.",
      detailAr: "9 محادثات انتهت بعد مخاوف التأمين أو الموعد.",
      risk: 61,
    },
    {
      en: "Booking slot not offered",
      ar: "لم يتم عرض موعد حجز",
      detailEn: "6 customers showed availability but no slot was proposed.",
      detailAr: "6 مرضى أبدوا توفرهم ولم يتم اقتراح موعد.",
      risk: 48,
    },
  ],
  conversations: [
    {
      id: "C-1048",
      patient: { en: "Mariam A.", ar: "مريم أ." },
      channel: { en: "WhatsApp", ar: "واتساب" },
      procedure: { en: "Premium service consultation", ar: "استشارة خدمة مميزة" },
      time: "09:42",
      score: 64,
      bookingAttempt: true,
      missedOpportunity: true,
      value: "AED 18,000",
      sentiment: { en: "Interested but price-sensitive", ar: "مهتمة لكن حساسة للسعر" },
      summary: {
        en: "Customer asked about pricing and delivery expectations. The agent explained the service profile but did not offer a consultation slot or financing path after the customer asked for a price range.",
        ar: "سألت العميلة عن السعر وتوقعات التنفيذ. شرح الموظف ملف الخدمة لكنه لم يعرض موعد استشارة أو خيار دفع بعد طلب نطاق سعري.",
      },
      recommendations: {
        en: [
          "Offer a same-week consultation before discussing exact pricing.",
          "Use a price-range response with financing availability.",
          "Create a follow-up task within two hours if the customer does not confirm.",
        ],
        ar: [
          "اعرض استشارة خلال نفس الأسبوع قبل الدخول في السعر الدقيق.",
          "استخدم ردا يتضمن نطاقا سعريا مع توفر خيارات الدفع.",
          "أنشئ مهمة متابعة خلال ساعتين إذا لم تؤكد العميلة.",
        ],
      },
      signals: {
        en: [
          ["Customer", "Can you tell me the approximate cost?"],
          ["Agent", "The specialist will need to review the request first."],
          ["AI", "High booking intent detected; price objection not handled."],
        ],
        ar: [
          ["العميلة", "هل يمكن معرفة التكلفة بشكل تقريبي؟"],
          ["الموظف", "يحتاج المختص إلى مراجعة الطلب أولا."],
          ["الذكاء", "تم رصد نية حجز عالية؛ لم تتم معالجة اعتراض السعر."],
        ],
      },
    },
    {
      id: "C-1049",
      patient: { en: "Omar K.", ar: "عمر ك." },
      channel: { en: "Phone", ar: "الهاتف" },
      procedure: { en: "Service appointment", ar: "موعد خدمة" },
      time: "10:18",
      score: 92,
      bookingAttempt: true,
      missedOpportunity: false,
      value: "AED 950",
      sentiment: { en: "Ready to book", ar: "جاهز للحجز" },
      summary: {
        en: "Agent identified urgency, offered two appointment slots, confirmed location, and closed the booking with a clear arrival instruction.",
        ar: "حدد الموظف درجة الاستعجال، عرض موعدين، أكد الموقع، وأغلق الحجز بتعليمات وصول واضحة.",
      },
      recommendations: {
        en: [
          "Replicate the two-slot close script across phone agents.",
          "Add automated WhatsApp confirmation with map link.",
          "Ask one outcome question before the visit to personalize the experience.",
        ],
        ar: [
          "عمم صيغة عرض الموعدين على موظفي الهاتف.",
          "أضف تأكيد واتساب تلقائي مع رابط الموقع.",
          "اطرح سؤالا واحدا عن النتيجة المطلوبة قبل الزيارة لتخصيص التجربة.",
        ],
      },
      signals: {
        en: [
          ["Customer", "I need to speak with someone this week."],
          ["Agent", "We can do 5:30 today or 11:00 tomorrow."],
          ["AI", "Booking attempt detected and converted."],
        ],
        ar: [
          ["العميل", "أحتاج مقابلة مختص هذا الأسبوع."],
          ["الموظف", "لدينا 5:30 اليوم أو 11:00 غدا."],
          ["الذكاء", "تم رصد محاولة حجز وتحويلها بنجاح."],
        ],
      },
    },
    {
      id: "C-1050",
      patient: { en: "Layla S.", ar: "ليلى س." },
      channel: { en: "Instagram", ar: "إنستغرام" },
      procedure: { en: "Aesthetic package inquiry", ar: "استفسار عن باقة تجميلية" },
      time: "11:03",
      score: 58,
      bookingAttempt: false,
      missedOpportunity: true,
      value: "AED 7,500",
      sentiment: { en: "Curious and comparing providers", ar: "فضولية وتقارن بين مزودين" },
      summary: {
        en: "Customer asked about package inclusions. The response was friendly but generic, with no discovery questions, differentiator, or invitation to assessment.",
        ar: "سألت العميلة عن محتويات الباقة. كان الرد ودودا لكنه عاما، بلا أسئلة اكتشاف أو نقطة تميز أو دعوة للتقييم.",
      },
      recommendations: {
        en: [
          "Ask about goal, timeline, and previous treatments before sending package details.",
          "Lead with expert assessment rather than discount language.",
          "Use a soft booking CTA after answering inclusions.",
        ],
        ar: [
          "اسأل عن الهدف والوقت والعلاجات السابقة قبل إرسال تفاصيل الباقة.",
          "ابدأ بتقييم يقوده مختص بدلا من لغة الخصومات.",
          "استخدم دعوة حجز لطيفة بعد شرح المحتويات.",
        ],
      },
      signals: {
        en: [
          ["Customer", "What is included in the glow package?"],
          ["Agent", "It includes multiple treatments and we have offers."],
          ["AI", "Missed opportunity: no qualification or consult invitation."],
        ],
        ar: [
          ["العميلة", "ما الذي تتضمنه الباقة؟"],
          ["الموظف", "تتضمن عدة علاجات ولدينا عروض."],
          ["الذكاء", "فرصة ضائعة: لا توجد أسئلة تأهيل أو دعوة للاستشارة."],
        ],
      },
    },
    {
      id: "C-1051",
      patient: { en: "Noura H.", ar: "نورة ح." },
      channel: { en: "Web Chat", ar: "دردشة الموقع" },
      procedure: { en: "Family service booking", ar: "حجز خدمة عائلية" },
      time: "12:20",
      score: 86,
      bookingAttempt: true,
      missedOpportunity: false,
      value: "AED 650",
      sentiment: { en: "Anxious parent", ar: "أم قلقة" },
      summary: {
        en: "Agent showed empathy, reassured the parent about pediatric handling, and offered a gentle first-visit slot.",
        ar: "أظهر الموظف تعاطفا، وطمأن الأم بشأن التعامل مع الأطفال، وعرض موعد زيارة أولى مريحة.",
      },
      recommendations: {
        en: [
          "Send preparation guidance for the child before arrival.",
          "Add concern tags to the customer record.",
          "Follow up after the appointment with prevention tips.",
        ],
        ar: [
          "أرسل إرشادات تحضير الطفل قبل الوصول.",
          "أضف وسوم المخاوف إلى ملف العميل.",
          "تابع بعد الموعد بنصائح وقائية.",
        ],
      },
      signals: {
        en: [
          ["Customer", "My child is nervous about the visit."],
          ["Agent", "Our team starts with a calm introduction."],
          ["AI", "Empathy and booking flow detected."],
        ],
        ar: [
          ["العميلة", "طفلي متوتر من الزيارة."],
          ["الموظف", "فريقنا يبدأ بتعارف هادئ."],
          ["الذكاء", "تم رصد التعاطف ومسار الحجز."],
        ],
      },
    },
  ],
};

data.bookingSources.push(
  {
    id: "google",
    platform: { en: "Google", ar: "Google" },
    sources: [
      {
        id: "google-ads",
        type: "googleAds",
        contents: [
          {
            id: "google-implants-keyword",
            contentType: "keyword",
            title: { en: "Keyword: dental implants near me", ar: "كلمة: زراعة أسنان قريبة مني" },
            detail: { en: "High-intent search campaign for implant consultations", ar: "حملة بحث عالية النية لاستشارات الزراعة" },
            bookings: [
              createBooking({
                id: "BK-GG-601",
                client: { en: "Client GG-601", ar: "عميل GG-601" },
                employee: { en: "Huda S.", ar: "هدى س." },
                time: "09:35",
                score: 89,
                revenue: 18500,
                report: createReport({
                  summary: { en: "Client came from a high-intent implant keyword and confirmed after pricing expectations and doctor assessment were explained.", ar: "جاء العميل من كلمة بحث عالية النية للزراعة وأكد الحجز بعد شرح توقعات السعر والتقييم الطبي." },
                  interest: { en: "Very high", ar: "مرتفع جدا" },
                  response: { en: "Structured and commercial", ar: "منظم وتجاري" },
                  bookingQuality: { en: "Strong consult close", ar: "إغلاق استشارة قوي" },
                  missed: { en: "No major missed issue", ar: "لا توجد مشكلة ضائعة مؤثرة" },
                  objections: { en: "Implant cost expectation", ar: "توقع تكلفة الزراعة" },
                  sentiment: { en: "Decisive", ar: "حاسم" },
                  notes: { en: "Employee protected clinical value while moving quickly to booking.", ar: "حافظت الموظفة على قيمة العلاج مع الانتقال السريع للحجز." },
                  recommendation: { en: "Increase budget on this keyword cluster.", ar: "زيادة الميزانية على مجموعة هذه الكلمات." },
                  messages: { en: [["Client", "I searched for implants near me. Can I book today?"], ["Huda S.", "Yes, we can assess you at 6 PM and explain the full plan."], ["AI", "Google high-intent lead converted with strong revenue potential."]], ar: [["العميل", "بحثت عن زراعة أسنان قريبة مني. هل يمكن الحجز اليوم؟"], ["هدى س.", "نعم، يمكن تقييمك الساعة 6 وشرح الخطة كاملة."], ["الذكاء", "تم تحويل عميل Google عالي النية مع فرصة إيراد قوية."]] },
                }),
              }),
              createBooking({
                id: "BK-GG-602",
                client: { en: "Client GG-602", ar: "عميل GG-602" },
                employee: { en: "Rami F.", ar: "رامي ف." },
                time: "11:10",
                score: 82,
                revenue: 12200,
                report: createReport({
                  summary: { en: "Client searched for emergency dental implants and booked after availability was confirmed.", ar: "بحث العميل عن زراعة أسنان عاجلة وحجز بعد تأكيد التوفر." },
                  interest: { en: "High", ar: "مرتفع" },
                  response: { en: "Fast", ar: "سريع" },
                  bookingQuality: { en: "Good urgency match", ar: "مطابقة جيدة للاستعجال" },
                  missed: { en: "Could confirm previous X-ray status", ar: "كان يمكن تأكيد وجود أشعة سابقة" },
                  objections: { en: "Same-day availability", ar: "توفر موعد في نفس اليوم" },
                  sentiment: { en: "Urgent", ar: "مستعجل" },
                  notes: { en: "Speed matched Google lead intent.", ar: "السرعة ناسبت نية عميل Google." },
                  recommendation: { en: "Add X-ray pre-check to Google implant script.", ar: "إضافة سؤال الأشعة لنص زراعة Google." },
                  messages: { en: [["Client", "Do you have implant appointments today?"], ["Rami F.", "Yes, we can see you this afternoon."], ["AI", "Urgency converted, but one diagnostic pre-check was missed."]], ar: [["العميل", "هل لديكم مواعيد زراعة اليوم؟"], ["رامي ف.", "نعم، يمكننا رؤيتك هذا العصر."], ["الذكاء", "تم تحويل الاستعجال مع تفويت سؤال تشخيصي."]] },
                }),
              }),
            ],
          },
        ],
      },
      {
        id: "google-search",
        type: "googleSearch",
        contents: [
          {
            id: "google-root-canal-search",
            contentType: "keyword",
            title: { en: "Organic Search: root canal clinic", ar: "بحث عضوي: عيادة علاج عصب" },
            detail: { en: "Organic Google Search result for urgent treatment", ar: "نتيجة بحث عضوية لعلاج عاجل" },
            bookings: [
              createBooking({ id: "BK-GG-603", client: { en: "Client GG-603", ar: "عميل GG-603" }, employee: { en: "Huda S.", ar: "هدى س." }, time: "13:24", score: 78, revenue: 3200, report: createReport({ summary: { en: "Client found the clinic through organic search and booked for root canal pain.", ar: "وجد العميل العيادة عبر البحث العضوي وحجز بسبب ألم عصب." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Clinically careful", ar: "حذر طبيا" }, bookingQuality: { en: "Confirmed", ar: "مؤكد" }, missed: { en: "Pain severity not fully scored", ar: "لم يتم تقييم شدة الألم بالكامل" }, objections: { en: "Treatment fear", ar: "الخوف من العلاج" }, sentiment: { en: "Worried", ar: "قلق" }, notes: { en: "Good triage, missing one urgency question.", ar: "فرز جيد مع فقدان سؤال استعجال." }, recommendation: { en: "Add pain-scale prompt to organic search workflow.", ar: "إضافة سؤال مقياس الألم لمسار البحث العضوي." }, messages: { en: [["Client", "I found you on Google. My tooth hurts badly."], ["Huda S.", "We should have the dentist check it today."], ["AI", "Pain lead booked with one missing severity question."]], ar: [["العميل", "وجدتكم على Google. سني يؤلمني جدا."], ["هدى س.", "الأفضل أن يفحصه الطبيب اليوم."], ["الذكاء", "تم حجز عميل ألم مع فقدان سؤال شدة واحد."]] } }) }),
            ],
          },
        ],
      },
      {
        id: "google-maps",
        type: "googleMaps",
        contents: [
          {
            id: "google-maps-jumeirah",
            contentType: "map",
            title: { en: "Google Maps: Jumeirah clinic listing", ar: "خرائط Google: فرع جميرا" },
            detail: { en: "Map listing call and direction intent", ar: "نية اتصال واتجاهات من صفحة الخرائط" },
            bookings: [
              createBooking({ id: "BK-GG-604", client: { en: "Client GG-604", ar: "عميل GG-604" }, employee: { en: "Rami F.", ar: "رامي ف." }, time: "15:03", score: 85, revenue: 2600, report: createReport({ summary: { en: "Client called from Google Maps and booked after parking and location details were clarified.", ar: "اتصل العميل من خرائط Google وحجز بعد توضيح الموقع والمواقف." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Operationally strong", ar: "قوي تشغيليا" }, bookingQuality: { en: "Clear location close", ar: "إغلاق واضح مرتبط بالموقع" }, missed: { en: "Could ask treatment reason earlier", ar: "كان يمكن سؤال سبب الزيارة مبكرا" }, objections: { en: "Parking and access", ar: "المواقف والوصول" }, sentiment: { en: "Practical", ar: "عملي" }, notes: { en: "Excellent handling of map-led friction.", ar: "تعامل ممتاز مع احتكاك عميل الخرائط." }, recommendation: { en: "Promote parking details on Google Maps listing.", ar: "إظهار تفاصيل المواقف في صفحة خرائط Google." }, messages: { en: [["Client", "I am looking at your Google Maps location."], ["Rami F.", "Parking is available in the building and we can book you today."], ["AI", "Map lead converted after practical friction was removed."]], ar: [["العميل", "أرى موقعكم في خرائط Google."], ["رامي ف.", "تتوفر مواقف في المبنى ويمكننا حجزك اليوم."], ["الذكاء", "تم تحويل عميل الخرائط بعد إزالة العائق العملي."]] } }) }),
            ],
          },
        ],
      },
      { id: "google-forms", type: "websiteForms", contents: [{ id: "website-smile-form", contentType: "form", title: { en: "Website Smile Assessment Form", ar: "نموذج تقييم الابتسامة في الموقع" }, detail: { en: "Website form from service page", ar: "نموذج موقع من صفحة الخدمة" }, bookings: [createBooking({ id: "BK-GG-605", client: { en: "Client GG-605", ar: "عميل GG-605" }, employee: { en: "Huda S.", ar: "هدى س." }, time: "16:40", score: 86, revenue: 7400, report: createReport({ summary: { en: "Client submitted a smile assessment form and booked after callback qualification.", ar: "أرسل العميل نموذج تقييم الابتسامة وحجز بعد التأهيل عبر الاتصال." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Personalized", ar: "مخصص" }, bookingQuality: { en: "Strong callback close", ar: "إغلاق قوي بعد الاتصال" }, missed: { en: "No preferred treatment photo requested", ar: "لم يتم طلب صورة مرجعية للعلاج المطلوب" }, objections: { en: "Wanted natural result", ar: "رغبة بنتيجة طبيعية" }, sentiment: { en: "Hopeful", ar: "متفائل" }, notes: { en: "Good personalization from form details.", ar: "تخصيص جيد اعتمادا على تفاصيل النموذج." }, recommendation: { en: "Add photo upload prompt to website form.", ar: "إضافة رفع صورة إلى نموذج الموقع." }, messages: { en: [["Client", "I filled the smile assessment."], ["Huda S.", "I saw your goal; the doctor can assess proportions tomorrow."], ["AI", "Form lead converted with strong personalization."]], ar: [["العميل", "ملأت نموذج تقييم الابتسامة."], ["هدى س.", "رأيت هدفك؛ يمكن للطبيب تقييم النسب غدا."], ["الذكاء", "تم تحويل نموذج الموقع بتخصيص قوي."]] } }) })] }] },
      { id: "google-calls", type: "callLeads", contents: [{ id: "google-call-extension", contentType: "call", title: { en: "Google Call Extension", ar: "إضافة الاتصال في Google" }, detail: { en: "Call lead from search ad extension", ar: "عميل مكالمة من إضافة إعلان البحث" }, bookings: [createBooking({ id: "BK-GG-606", client: { en: "Client GG-606", ar: "عميل GG-606" }, employee: { en: "Rami F.", ar: "رامي ف." }, time: "18:11", score: 72, revenue: 2100, report: createReport({ summary: { en: "Client called directly from Google Ads and booked, but insurance qualification was incomplete.", ar: "اتصل العميل مباشرة من إعلان Google وحجز، لكن تأهيل التأمين لم يكتمل." }, interest: { en: "Medium-high", ar: "متوسط إلى مرتفع" }, response: { en: "Fast but incomplete", ar: "سريع لكن غير مكتمل" }, bookingQuality: { en: "Confirmed with missing detail", ar: "مؤكد مع تفصيل ناقص" }, missed: { en: "Insurance network not verified", ar: "لم يتم التحقق من شبكة التأمين" }, objections: { en: "Insurance coverage", ar: "التغطية التأمينية" }, sentiment: { en: "Cautious", ar: "حذر" }, notes: { en: "Speed was good, qualification needs discipline.", ar: "السرعة جيدة لكن التأهيل يحتاج انضباطا." }, recommendation: { en: "Add insurance verification checklist to Google call leads.", ar: "إضافة قائمة تحقق التأمين لمكالمات Google." }, messages: { en: [["Client", "I called from your Google ad. Do you take insurance?"], ["Rami F.", "We can check when you arrive."], ["AI", "Booking confirmed, but insurance verification was missed."]], ar: [["العميل", "اتصلت من إعلان Google. هل تقبلون التأمين؟"], ["رامي ف.", "يمكننا التحقق عند وصولك."], ["الذكاء", "تم تأكيد الحجز مع تفويت التحقق من التأمين."]] } }) })] }] },
      { id: "google-landing", type: "landingPages", contents: [{ id: "implant-landing-page", contentType: "landingPage", title: { en: "Implant Landing Page: May Offer", ar: "صفحة هبوط الزراعة: عرض مايو" }, detail: { en: "Landing page form and WhatsApp lead path", ar: "مسار نموذج وواتساب من صفحة هبوط" }, bookings: [createBooking({ id: "BK-GG-607", client: { en: "Client GG-607", ar: "عميل GG-607" }, employee: { en: "Huda S.", ar: "هدى س." }, time: "19:06", score: 88, revenue: 16200, report: createReport({ summary: { en: "Client came from implant landing page and booked after understanding assessment and payment options.", ar: "جاء العميل من صفحة هبوط الزراعة وحجز بعد فهم التقييم وخيارات الدفع." }, interest: { en: "Very high", ar: "مرتفع جدا" }, response: { en: "Commercially strong", ar: "قوي تجاريا" }, bookingQuality: { en: "Excellent", ar: "ممتاز" }, missed: { en: "No major missed issue", ar: "لا توجد مشكلة ضائعة مؤثرة" }, objections: { en: "Payment options", ar: "خيارات الدفع" }, sentiment: { en: "Ready", ar: "جاهز" }, notes: { en: "Excellent conversion from landing-page intent.", ar: "تحويل ممتاز من نية صفحة الهبوط." }, recommendation: { en: "Scale landing-page traffic with this script.", ar: "توسيع زيارات صفحة الهبوط بهذا النص." }, messages: { en: [["Client", "I saw the implant offer page."], ["Huda S.", "Let us book your assessment and explain payment options."], ["AI", "Landing-page lead converted with high revenue."]], ar: [["العميل", "رأيت صفحة عرض الزراعة."], ["هدى س.", "لنحجز تقييمك ونشرح خيارات الدفع."], ["الذكاء", "تم تحويل عميل صفحة الهبوط بإيراد عال."]] } }) })] }] },
    ],
  },
  {
    id: "snapchat",
    platform: { en: "Snapchat", ar: "سناب شات" },
    sources: [
      { id: "snapchat-ads", type: "snapchatAds", contents: [{ id: "snap-smile-ad", contentType: "campaign", title: { en: "Snap Smile Makeover Ad", ar: "إعلان سناب لتجميل الابتسامة" }, detail: { en: "Snapchat Ads conversion path", ar: "مسار تحويل إعلانات سناب شات" }, bookings: [createBooking({ id: "BK-SC-701", client: { en: "Client SC-701", ar: "عميل SC-701" }, employee: { en: "Maya H.", ar: "مايا هـ." }, time: "12:12", score: 79, revenue: 6800, report: createReport({ summary: { en: "Client came from Snapchat Ads and booked after package expectations were clarified.", ar: "جاء العميل من إعلان سناب وحجز بعد توضيح توقعات الباقة." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Warm and visual", ar: "دافئ وبصري" }, bookingQuality: { en: "Confirmed", ar: "مؤكد" }, missed: { en: "Could ask preferred aesthetic style", ar: "كان يمكن سؤال النمط التجميلي المفضل" }, objections: { en: "Package inclusions", ar: "محتويات الباقة" }, sentiment: { en: "Excited", ar: "متحمس" }, notes: { en: "Good conversion from short-form ad traffic.", ar: "تحويل جيد من زيارات إعلان قصير." }, recommendation: { en: "Add aesthetic style question to Snapchat ad script.", ar: "إضافة سؤال النمط الجمالي لنص إعلانات سناب." }, messages: { en: [["Client", "I saw the smile makeover on Snap."], ["Maya H.", "We can assess which package fits your goals."], ["AI", "Snapchat ad lead converted, qualification can improve."]], ar: [["العميل", "رأيت تجميل الابتسامة في سناب."], ["مايا هـ.", "يمكننا تقييم الباقة الأنسب لهدفك."], ["الذكاء", "تم تحويل عميل إعلان سناب ويمكن تحسين التأهيل."]] } }) })] }] },
      { id: "snapchat-story", type: "storyTraffic", contents: [{ id: "snap-doctor-story", contentType: "story", title: { en: "Doctor Story: Whitening Q&A", ar: "قصة الطبيب: أسئلة التبييض" }, detail: { en: "Story traffic from doctor Q&A", ar: "حركة من قصة أسئلة الطبيب" }, bookings: [createBooking({ id: "BK-SC-702", client: { en: "Client SC-702", ar: "عميل SC-702" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "15:49", score: 84, revenue: 1800, report: createReport({ summary: { en: "Client replied to whitening story and booked a consult after sensitivity concerns were handled.", ar: "رد العميل على قصة التبييض وحجز استشارة بعد معالجة حساسية الأسنان." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Educational", ar: "تثقيفي" }, bookingQuality: { en: "Good", ar: "جيد" }, missed: { en: "No shade goal captured", ar: "لم يتم تسجيل درجة اللون المطلوبة" }, objections: { en: "Sensitivity concern", ar: "قلق من الحساسية" }, sentiment: { en: "Interested", ar: "مهتم" }, notes: { en: "Strong education from story reply.", ar: "تثقيف جيد من رد القصة." }, recommendation: { en: "Add shade-goal question before booking.", ar: "إضافة سؤال درجة اللون قبل الحجز." }, messages: { en: [["Client", "Will whitening make my teeth sensitive?"], ["Leen R.", "The doctor checks sensitivity first and chooses the safest option."], ["AI", "Story traffic converted after objection handling."]], ar: [["العميل", "هل يسبب التبييض حساسية؟"], ["لين ر.", "يفحص الطبيب الحساسية أولا ويختار الخيار الآمن."], ["الذكاء", "تحولت حركة القصة بعد معالجة الاعتراض."]] } }) })] }] },
      { id: "snapchat-direct", type: "directMessage", contents: [{ id: "snap-direct-thread", contentType: "organic", title: { en: "Snap Direct Message Thread", ar: "رسالة مباشرة من سناب" }, detail: { en: "Direct message from Snapchat profile", ar: "رسالة مباشرة من ملف سناب" }, bookings: [createBooking({ id: "BK-SC-703", client: { en: "Client SC-703", ar: "عميل SC-703" }, employee: { en: "Maya H.", ar: "مايا هـ." }, time: "17:14", score: 81, revenue: 2400, report: createReport({ summary: { en: "Client sent a direct message for pediatric dentistry and booked after reassurance.", ar: "أرسل العميل رسالة مباشرة عن أسنان الأطفال وحجز بعد الطمأنة." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Empathetic", ar: "متعاطف" }, bookingQuality: { en: "Confirmed", ar: "مؤكد" }, missed: { en: "No child age captured", ar: "لم يتم تسجيل عمر الطفل" }, objections: { en: "Child fear", ar: "خوف الطفل" }, sentiment: { en: "Concerned", ar: "قلق" }, notes: { en: "Good emotional handling, missing intake detail.", ar: "تعامل عاطفي جيد مع فقدان تفصيل تأهيلي." }, recommendation: { en: "Ask child age before confirming pediatric bookings.", ar: "سؤال عمر الطفل قبل تأكيد حجوزات الأطفال." }, messages: { en: [["Client", "My child is scared of dentists."], ["Maya H.", "Our pediatric doctor starts gently and explains everything."], ["AI", "Direct message converted with one missing intake detail."]], ar: [["العميل", "طفلي يخاف من الطبيب."], ["مايا هـ.", "طبيب الأطفال يبدأ بلطف ويشرح كل شيء."], ["الذكاء", "تم تحويل الرسالة المباشرة مع نقص تفصيل تأهيلي."]] } }) })] }] },
      { id: "snapchat-swipe", type: "swipeUpTraffic", contents: [{ id: "snap-implant-swipe", contentType: "swipe", title: { en: "Implant Swipe-up Story", ar: "قصة سحب للأعلى للزراعة" }, detail: { en: "Swipe-up traffic to implant landing page", ar: "حركة سحب للأعلى إلى صفحة الزراعة" }, bookings: [createBooking({ id: "BK-SC-704", client: { en: "Client SC-704", ar: "عميل SC-704" }, employee: { en: "Leen R.", ar: "لين ر." }, time: "19:22", score: 77, revenue: 9800, report: createReport({ summary: { en: "Client swiped up from implant story and booked, but bone-scan expectation was not explained.", ar: "سحب العميل للأعلى من قصة الزراعة وحجز، لكن لم يتم شرح توقعات فحص العظم." }, interest: { en: "High", ar: "مرتفع" }, response: { en: "Efficient", ar: "فعال" }, bookingQuality: { en: "Confirmed", ar: "مؤكد" }, missed: { en: "CBCT / bone scan expectation not explained", ar: "لم يتم شرح توقع فحص العظم أو التصوير" }, objections: { en: "Procedure complexity", ar: "تعقيد الإجراء" }, sentiment: { en: "Curious and cautious", ar: "فضولي وحذر" }, notes: { en: "Good booking close, needs stronger clinical preparation.", ar: "إغلاق جيد ويحتاج تحضيرا طبيا أقوى." }, recommendation: { en: "Add bone-scan expectation to swipe-up implant script.", ar: "إضافة توقع فحص العظم لنص زراعة السحب للأعلى." }, messages: { en: [["Client", "I opened the implant story link."], ["Leen R.", "We can book an assessment to confirm your plan."], ["AI", "Swipe-up lead converted with a missed diagnostic expectation."]], ar: [["العميل", "فتحت رابط قصة الزراعة."], ["لين ر.", "يمكننا حجز تقييم لتأكيد خطتك."], ["الذكاء", "تحول عميل السحب للأعلى مع تفويت توقع تشخيصي."]] } }) })] }] },
    ],
  },
);

data.conversations.forEach((conversation, index) => {
  conversation.date = conversation.date || bookingDates[(index * 3 + 1) % bookingDates.length];
});
