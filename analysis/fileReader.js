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

const extractDocxText = (buffer) => {
  const raw = decodeUtf8(buffer);
  const xmlMatches = [...raw.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((match) => match[1].trim());
  if (xmlMatches.length) return xmlMatches.filter(Boolean).join("\n");

  const plainMatches = [...raw.matchAll(/[A-Za-z\u0600-\u06FF][A-Za-z0-9\u0600-\u06FF .,!?:;'"()-]{8,}/g)].map((match) => match[0].trim());
  return plainMatches.length ? [...new Set(plainMatches)].join("\n") : "";
};

const extractPdfText = (buffer) => {
  const raw = decodeLatin1(buffer);
  const literalMatches = [...raw.matchAll(/\(([^\\)]*(?:\\.[^\\)]*)*)\)/g)]
    .map((match) => match[1].replace(/\\([nrtbf()\\])/g, (_, token) => ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" }[token] || token)).trim())
    .filter((line) => line.length > 2 && /[A-Za-z\u0600-\u06FF]/.test(line));

  if (literalMatches.length) return [...new Set(literalMatches)].join("\n");

  const streamMatches = [...raw.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
    .map((match) => match[1].replace(/[^\x20-\x7E\u0600-\u06FF\r\n]/g, " "))
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 20);

  return streamMatches.length ? streamMatches.join("\n\n") : "";
};

const readZipEntryNames = (buffer) => {
  const view = new DataView(buffer);
  const names = [];
  let offset = 0;

  while (offset + 30 < buffer.byteLength) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) break;

    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const nameEnd = nameStart + fileNameLength;
    if (nameEnd > buffer.byteLength) break;

    const entryName = decodeUtf8(buffer.slice(nameStart, nameEnd));
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    names.push({ entryName, dataStart, dataEnd, compressedSize });
    offset = dataEnd;
  }

  return names;
};

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

    const slice = buffer.slice(entry.dataStart, entry.dataEnd);
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
    const text = extractDocxText(buffer);
    if (!text.trim()) throw new Error("unsupported-docx");
    return text;
  }

  if (PDF_EXTENSIONS.has(extension)) {
    const text = extractPdfText(buffer);
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
