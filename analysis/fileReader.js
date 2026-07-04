const MAX_FILE_BYTES = 10 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([".txt", ".csv", ".eml", ".mbox", ".log", ".json"]);
const ZIP_EXTENSIONS = new Set([".zip"]);
const DOCX_EXTENSIONS = new Set([".docx"]);
const PDF_EXTENSIONS = new Set([".pdf"]);

const getExtension = (fileName = "") => {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
};

const decodeUtf8 = (buffer) => new TextDecoder("utf-8", { fatal: false }).decode(buffer);
const decodeLatin1 = (buffer) => new TextDecoder("latin1").decode(buffer);

const looksBinary = (text) => {
  if (!text) return true;
  const nullCount = (text.match(/\0/g) || []).length;
  return nullCount > 5;
};

// ---------------------------------------------------------------------------
// فك الضغط باستخدام DecompressionStream المدمجة في المتصفح (بدون أي مكتبة خارجية).
// مدعومة في كل المتصفحات الحديثة (Chrome 80+, Edge 80+, Firefox 113+, Safari 16.4+).
// ---------------------------------------------------------------------------
const inflateBytes = async (bytes, format) => {
  // format: "deflate-raw" لملفات ZIP (بما فيها DOCX) أو "deflate" لتيارات PDF (صيغة zlib)
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
};

// ---------------------------------------------------------------------------
// DOCX: قراءة حقيقية عن طريق فك ضغط word/document.xml من داخل بنية ZIP
// ---------------------------------------------------------------------------
const readZipEntries = (buffer) => {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const entries = [];
  let offset = 0;

  while (offset + 30 <= buffer.byteLength) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) break;

    const method = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const uncompressedSize = view.getUint32(offset + 22, true);
    const fileNameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    if (nameEnd > buffer.byteLength) break;

    const entryName = decodeUtf8(bytes.slice(nameStart, nameEnd));
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    entries.push({ entryName, method, dataStart, dataEnd, compressedSize, uncompressedSize });
    offset = dataEnd;
  }

  return entries;
};

const decodeXmlEntities = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

const wordXmlToText = (xml) => {
  // كل </w:p> نهاية فقرة نحوّلها لسطر جديد، وكل تاب/سطر جديد داخلي كمان
  const withBreaks = xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\s*\/>/g, "\t").replace(/<w:br\s*\/>/g, "\n");
  const textMatches = [...withBreaks.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>|(\n)/g)];
  let out = "";
  for (const match of textMatches) {
    out += match[2] ? "\n" : decodeXmlEntities(match[1] || "");
  }
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
};

const extractDocxText = async (buffer) => {
  const entries = readZipEntries(buffer);
  const docEntry = entries.find((e) => e.entryName === "word/document.xml");
  if (!docEntry || docEntry.dataEnd > buffer.byteLength) return "";

  const bytes = new Uint8Array(buffer).slice(docEntry.dataStart, docEntry.dataEnd);
  let xmlBytes;
  if (docEntry.method === 8) {
    try {
      xmlBytes = await inflateBytes(bytes, "deflate-raw");
    } catch {
      return "";
    }
  } else {
    xmlBytes = bytes;
  }

  return wordXmlToText(decodeUtf8(xmlBytes));
};

// ---------------------------------------------------------------------------
// PDF: قراءة حقيقية بفك ضغط FlateDecode واستخراج نصوص عوامل العرض Tj / TJ
// ---------------------------------------------------------------------------
const unescapePdfString = (str) =>
  str.replace(/\\(\d{1,3}|.)/g, (_, token) => {
    if (/^\d+$/.test(token)) return String.fromCharCode(parseInt(token, 8));
    return { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" }[token] ?? token;
  });

const extractTextOperators = (contentText) => {
  const parts = [];
  const opRegex = /\(((?:[^()\\]|\\.)*)\)\s*Tj|\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/g;
  let match;
  while ((match = opRegex.exec(contentText))) {
    if (match[1] !== undefined) {
      parts.push(unescapePdfString(match[1]));
    } else if (match[2] !== undefined) {
      const strRegex = /\(((?:[^()\\]|\\.)*)\)/g;
      let strMatch;
      let line = "";
      while ((strMatch = strRegex.exec(match[2]))) {
        line += unescapePdfString(strMatch[1]);
      }
      if (line) parts.push(line);
    }
  }
  return parts;
};

const extractPdfText = async (buffer) => {
  const bytes = new Uint8Array(buffer);
  const latin1 = decodeLatin1(buffer);
  const lines = [];

  const streamRegex = /stream\r?\n/g;
  let match;
  while ((match = streamRegex.exec(latin1))) {
    const streamStart = match.index + match[0].length;
    const endIdx = latin1.indexOf("endstream", streamStart);
    if (endIdx === -1) continue;

    const dictText = latin1.slice(Math.max(0, match.index - 300), match.index);
    const isFlate = /\/Filter\s*(\/FlateDecode|\[\s*\/FlateDecode)/.test(dictText);

    let streamEnd = endIdx;
    while (streamEnd > streamStart && (latin1[streamEnd - 1] === "\n" || latin1[streamEnd - 1] === "\r")) {
      streamEnd -= 1;
    }
    const rawStreamBytes = bytes.slice(streamStart, streamEnd);

    let contentText = "";
    if (isFlate) {
      try {
        const inflated = await inflateBytes(rawStreamBytes, "deflate");
        contentText = decodeLatin1(inflated);
      } catch {
        continue;
      }
    } else {
      contentText = decodeLatin1(rawStreamBytes);
    }

    const found = extractTextOperators(contentText);
    if (found.length) lines.push(found.join(" "));
  }

  if (lines.length) return lines.join("\n");

  const literalMatches = [...latin1.matchAll(/\(([^\\)]*(?:\\.[^\\)]*)*)\)/g)]
    .map((m) => unescapePdfString(m[1]).trim())
    .filter((line) => line.length > 2 && /[A-Za-z؀-ۿ]/.test(line));
  return literalMatches.length ? [...new Set(literalMatches)].join("\n") : "";
};

const readZipEntryNames = (buffer) => readZipEntries(buffer);

const extractZipText = (buffer) => {
  const entries = readZipEntryNames(buffer);
  const chunks = [];

  for (const entry of entries) {
    const lowerName = entry.entryName.toLowerCase();
    const isUseful =
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".eml") ||
      lowerName.endsWith(".mbox") ||
      lowerName.endsWith(".json") ||
      lowerName.includes("chat");

    if (!isUseful || entry.dataEnd > buffer.byteLength) continue;

    const slice = new Uint8Array(buffer).slice(entry.dataStart, entry.dataEnd);
    const text = decodeUtf8(slice);
    if (text.trim() && !looksBinary(text)) {
      chunks.push(`--- ${entry.entryName} ---\n${text.trim()}`);
    }
  }

  return chunks.join("\n\n");
};

const readArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("FileReader failed."));
    reader.readAsArrayBuffer(file);
  });

const readPlainText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("FileReader failed."));
    reader.readAsText(file, "utf-8");
  });

/**
 * Reads supported upload formats and returns normalized text for the parser.
 */
export const readAnalysisFile = async (file) => {
  if (!file || typeof file.size !== "number") {
    throw new Error("invalid-file");
  }
  if (file.size === 0) {
    throw new Error("empty-file");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("file-too-large");
  }

  const extension = getExtension(file.name);

  if (TEXT_EXTENSIONS.has(extension)) {
    const text = await readPlainText(file);
    if (looksBinary(text)) throw new Error("unreadable-text");
    return text;
  }

  const buffer = await readArrayBuffer(file);

  if (DOCX_EXTENSIONS.has(extension)) {
    const text = await extractDocxText(buffer);
    if (!text.trim()) throw new Error("unsupported-docx");
    return text;
  }

  if (PDF_EXTENSIONS.has(extension)) {
    const text = await extractPdfText(buffer);
    if (!text.trim()) throw new Error("unsupported-pdf");
    return text;
  }

  if (ZIP_EXTENSIONS.has(extension)) {
    const text = extractZipText(buffer);
    if (!text.trim()) throw new Error("unsupported-zip");
    return text;
  }

  const fallbackText = decodeUtf8(buffer);
  if (!looksBinary(fallbackText) && fallbackText.trim()) {
    return fallbackText;
  }

  throw new Error("unsupported-format");
};

export const getAcceptedAnalysisExtensions = () => [...TEXT_EXTENSIONS, ...DOCX_EXTENSIONS, ...PDF_EXTENSIONS, ...ZIP_EXTENSIONS];
