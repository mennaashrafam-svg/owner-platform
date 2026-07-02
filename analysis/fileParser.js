const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return "";
};

const parseAmount = (value = "") => {
  const amount = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(amount) ? amount : 0;
};

const parseRevenue = (text) => {
  const explicitValue = firstMatch(text, [
    /^(?:booking\s+value|value|final\s+price|revenue|estimated\s+revenue)[ \t]*:[ \t]*(?:\r?\n[ \t]*)?(?:(?:AED|د\.?\s?إ|درهم)[ \t]*)?([\d,]+(?:\.\d+)?)(?:[ \t]*(?:AED|د\.?\s?إ|درهم))?/im,
    /^(?:قيمه\s+الحجز|قيمة\s+الحجز|السعر\s+النهائي|القيمه|القيمة|الايراد|الإيراد)[ \t]*:[ \t]*(?:\r?\n[ \t]*)?(?:(?:AED|د\.?\s?إ|درهم)[ \t]*)?([\d,]+(?:\.\d+)?)(?:[ \t]*(?:AED|د\.?\s?إ|درهم))?/im,
  ]);
  if (explicitValue) return parseAmount(explicitValue);

  const detectedValue = text.match(/(?:AED|د\.?\s?إ|درهم)\s*([\d,]+(?:\.\d+)?)/i)?.[1];
  return detectedValue ? parseAmount(detectedValue) : 0;
};

const parsePotentialRevenue = (text) => {
  const explicitRevenue = parseRevenue(text);
  if (explicitRevenue) return explicitRevenue;
  const value = normalize(text);
  if (!/(price|cost|package|session|treatment|سعر|السعر|تكلفه|تكلفة|باقة|جلسه|جلسة|علاج)/.test(value)) return 0;
  const bareAmount = text.match(/^\s*([\d,]{3,}(?:\.\d+)?)\s*$/m)?.[1];
  return bareAmount ? parseAmount(bareAmount) : 0;
};

const classifySignal = (value) => {
  if (/(info only|information only|معلومات فقط|استفسار فقط)/.test(value)) return "info";
  if (/(objection only|اعتراض فقط)/.test(value)) return "objection";
  if (/(cancelled booking|canceled booking|booking cancelled|booking canceled|cancelled appointment|canceled appointment|تم الالغاء|الغاء الحجز|حجز ملغي)/.test(value)) return "cancelled";
  if (/(confirmed booking|booking confirmed|booked|حجز مؤكد|تم الحجز|تم تاكيد الحجز)/.test(value)) return "confirmed";
  if (/(missed opportunity|lost opportunity|فرصه ضائعه|فرصة ضائعة|عميل ضائع)/.test(value)) return "missed";
  if (/(conversation not closed|\bcnc\b|لم يتم اغلاق المحادثه|دون خطوه واضحه|no next step|no follow[- ]?up|no booking request)/.test(value)) return "cnc";
  if (/(pending|open lead|follow[- ]?up pending|قيد المتابعه|عميل مفتوح|انتظار)/.test(value)) return "pending";
  return "";
};

const explicitResult = (text) =>
  firstMatch(text, [
    /^(?:result|status|outcome|classification)\s*:\s*(.+)$/im,
    /^(?:النتيجه|النتيجة|الحاله|الحالة|التصنيف)\s*:\s*(.+)$/im,
  ]);

const classify = (text) => {
  const explicitValue = normalize(explicitResult(text));
  const explicitOutcome = explicitValue === "booking" || explicitValue === "حجز" ? "confirmed" : classifySignal(explicitValue);
  if (explicitOutcome) return explicitOutcome;

  const value = normalize(text);
  const detectedOutcome = classifySignal(value);
  if (detectedOutcome) return detectedOutcome;
  if (/(appointment|موعد|follow[- ]?up|متابعه)/.test(value)) return "pending";
  return "cnc";
};

const detectObjection = (text) => {
  const explicit = firstMatch(text, [/objections?\s*:\s*(.+)/i, /اعتراض(?:ات)?\s*:\s*(.+)/i]);
  if (explicit) return explicit;
  const value = normalize(text);
  if (/(competitor|another provider|cheaper offer|عرض ارخص|منافس|مكان اخر)/.test(value)) return "Competition";
  if (
    /(too expensive|very expensive|price is (?:too )?high|costs? too much|cannot afford|can't afford|overpriced|غالي|السعر (?:غالي|مرتفع|عالي)|سعر ارخص|ما اقدر ادفع)/.test(
      value,
    )
  )
    return "Price";
  if (/(too far|far from|location is far|بعيد|الموقع بعيد)/.test(value)) return "Location";
  if (/(pain|painful|hurt|مؤلم|يوجع|(?:^|\s)الم(?:\s|$))/.test(value)) return "Pain";
  if (/(do not trust|don't trust|not sure about quality|scam|ثقه|ثقة|موثوق|جوده|جودة)/.test(value)) return "Trust";
  if (/(scared|afraid|خايف|خائف|خوف)/.test(value)) return "Fear";
  return "";
};

const detectionReason = (outcome, text) => {
  const explicit = firstMatch(text, [/reason\s*:\s*(.+)/i, /السبب\s*:\s*(.+)/i, /detection reason\s*:\s*(.+)/i]);
  if (explicit) return explicit;
  const result = explicitResult(text);
  if (result) return `Explicit result: ${result}`;
  if (outcome === "confirmed") return "A confirmed booking or appointment was detected.";
  if (outcome === "cancelled") return "A previously booked appointment was explicitly cancelled.";
  if (outcome === "missed") return "The conversation explicitly indicates a lost or missed opportunity.";
  if (outcome === "pending") return "A follow-up or open next step exists, but no booking is confirmed.";
  if (outcome === "objection") return "The conversation contains an objection but does not indicate a closed or missed outcome.";
  if (outcome === "info") return "The conversation was informational only and did not produce a booking.";
  return "The conversation ended without a clear booking, follow-up, appointment, or next step.";
};

const parseBlock = (block, index) => {
  const text = block.trim();
  const outcome = classify(text);
  return {
    id: firstMatch(text, [
      /(?:conversation|chat|case|lead|محادثه|محادثة)\s*(?:id|#|رقم)?\s*[:#-]?\s*((?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+)/i,
      /\bid\s*:\s*([A-Za-z0-9_-]+)/i,
    ]) || `FILE-${String(index + 1).padStart(3, "0")}`,
    source: firstMatch(text, [/source\s*:\s*(.+)/i, /platform\s*:\s*(.+)/i, /المصدر\s*:\s*(.+)/i, /المنصه\s*:\s*(.+)/i]) || "Uploaded file",
    employee: firstMatch(text, [/employee\s*:\s*(.+)/i, /agent\s*:\s*(.+)/i, /الموظف\s*:\s*(.+)/i, /المسؤول\s*:\s*(.+)/i]) || "Unassigned",
    outcome,
    revenue: outcome === "confirmed" ? parseRevenue(text) : 0,
    potentialRevenue: parsePotentialRevenue(text),
    objections: detectObjection(text),
    recommendation: firstMatch(text, [/recommendation\s*:\s*(.+)/i, /التوصيه\s*:\s*(.+)/i, /التوصية\s*:\s*(.+)/i]) || "No explicit recommendation provided.",
    reason: detectionReason(outcome, text),
    evidence: text,
  };
};

const splitCsvLine = (line) => {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else value += character;
  }
  cells.push(value.trim());
  return cells;
};

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2 || !lines[0].includes(",")) return [];
  const headers = splitCsvLine(lines[0]).map(normalize);
  const hasConversationHeader = headers.some((header) => /(conversation|message|transcript|outcome|status|classification|محادث)/.test(header));
  if (!hasConversationHeader) return [];
  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const block = headers.map((header, cellIndex) => `${header}: ${values[cellIndex] || ""}`).join("\n");
    return parseBlock(block, index);
  });
};

const splitConversationBlocks = (text) => {
  const marker = /^(?=(?:conversation|chat|case|lead|محادثه|محادثة)\s*(?:id|#|رقم)?\s*[:#-]?\s*(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+)/gim;
  const starts = [...text.matchAll(marker)].map((match) => match.index);
  if (starts.length > 1) {
    return starts.map((start, index) => text.slice(start, starts[index + 1] ?? text.length).trim()).filter(Boolean);
  }

  const separated = text
    .split(/\r?\n\s*(?:-{3,}|={3,}|\*{3,}|_{3,})\s*\r?\n|\r?\n\s*\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter(Boolean);
  return separated.length > 1 ? separated : text.trim() ? [text.trim()] : [];
};

// الدالة المعدلة بأمان تام لقراءة أي ملف نصي عشوائي بنجاح حتمي
export const parseConversationFileText = (text, fileName = "uploaded-file") => {
  const csvRows = /\.csv$/i.test(fileName) ? parseCsv(text) : [];
  let conversations = csvRows.length ? csvRows : splitConversationBlocks(text).map(parseBlock);
  
  // الخطة البديلة (التعديل السحري الجديد): إذا فشل الفحص الصارم ولم ينتج عنه أي محادثة صالحة
  if (!conversations || conversations.length === 0 || (conversations.length === 1 && !conversations[0].evidence.trim())) {
    if (text && text.trim()) {
      conversations = [parseBlock(text, 0)];
    }
  }

  const summary = conversations.reduce(
    (result, conversation) => {
      result.conversations += 1;
      if (result[conversation.outcome] !== undefined) {
        result[conversation.outcome] += 1;
      } else {
        result.cnc += 1; // حماية للمستقبل
      }
      result.revenue += conversation.revenue;
      if (conversation.objections) result.objections += 1;
      return result;
    },
    { conversations: 0, confirmed: 0, cancelled: 0, missed: 0, cnc: 0, pending: 0, objection: 0, info: 0, objections: 0, revenue: 0 },
  );
  return { fileName, conversations, summary };
};