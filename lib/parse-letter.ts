type ParsedLetter = {
  letterNumber: string | null;
  letterDate: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
};

const MONTHS: Record<string, string> = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
};

function cleanValue(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function meaningfulLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => cleanValue(line))
    .filter(Boolean);
}

function extractLabeledLine(lines: string[], labels: string[]): string | null {
  const labelPattern = labels
    .map((label) => label.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(
    "^\\s*(?:" + labelPattern + ")\\s*[:\\-]?\\s*(.*)$",
    "i",
  );

  for (const line of lines) {
    const match = line.match(regex);
    if (match?.[1]) {
      const value = cleanValue(match[1]);
      if (value) return value;
    }
  }

  return null;
}

function parseIndonesiaDate(value: string): string | null {
  const match = value.match(
    /(?:^|[^0-9])(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})(?:$|[^0-9])/i,
  );

  if (!match) return null;

  const day = match[1].padStart(2, "0");
  const month = MONTHS[match[2].toLowerCase()];
  const year = match[3];

  if (!month) return null;

  return year + "-" + month + "-" + day;
}

function parseNumericDate(value: string): string | null {
  const match = value.match(
    /(?:^|[^0-9])(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:$|[^0-9])/,
  );

  if (!match) return null;

  const day = match[1].padStart(2, "0");
  const month = match[2].padStart(2, "0");
  const year = match[3];

  return year + "-" + month + "-" + day;
}

function extractDate(text: string): string | null {
  const lines = meaningfulLines(text);

  for (const line of lines.slice(0, 20)) {
    if (!/,/.test(line)) continue;

    const date = parseIndonesiaDate(line) ?? parseNumericDate(line);
    if (date) return date;
  }

  const labeledDate = extractLabeledLine(lines, ["tanggal", "tgl"]);
  if (labeledDate) {
    return parseIndonesiaDate(labeledDate) ?? parseNumericDate(labeledDate);
  }

  const datePattern =
    /\d{1,2}\s+(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4}/i;
  const dateMatch = text.match(datePattern);

  return dateMatch ? parseIndonesiaDate(dateMatch[0]) : null;
}

function extractRecipient(lines: string[]): string | null {
  const recipientIndex = lines.findIndex((line) =>
    /^kepada(?:\s+yth[.,]?)?\s*[:\-]?\s*$/i.test(line),
  );

  if (recipientIndex >= 0) {
    return lines[recipientIndex + 1] ?? null;
  }

  const inline = extractLabeledLine(lines, ["kepada", "untuk", "tujuan"]);
  if (!inline) return null;

  return inline.replace(/^yth[.,]?\s*/i, "").trim() || null;
}

function extractSender(lines: string[]): string | null {
  const labeled = extractLabeledLine(lines, ["dari", "asal"]);
  if (labeled) return labeled;

  return lines[0] ?? null;
}

export function parseLetterText(text: string): ParsedLetter {
  const lines = meaningfulLines(text);

  return {
    letterNumber: extractLabeledLine(lines, ["nomor", "no.", "no"]),
    letterDate: extractDate(text),
    subject: extractLabeledLine(lines, ["perihal", "hal", "subject"]),
    sender: extractSender(lines),
    recipient: extractRecipient(lines),
  };
}
