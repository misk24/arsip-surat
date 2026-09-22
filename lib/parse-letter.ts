type ParsedLetter = {
  letterNumber: string | null;
  letterDate: string | null;
  subject: string | null;
  sender: string | null;
  recipient: string | null;
};

function cleanValue(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function extractAfterLabel(text: string, labels: string[]): string | null {
  const labelPattern = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(`(?:${labelPattern})\\s*[:\\-]?\\s*(.+)`, "im");
  const match = text.match(regex);

  if (!match?.[1]) {
    return null;
  }

  return cleanValue(match[1]);
}

function parseIndonesiaDate(value: string): string | null {
  const months: Record<string, string> = {
    januari: "01",
    february: "02",
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

  const match = value.match(
    /(\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4})/i,
  );

  if (!match) {
    return null;
  }

  const day = match[1].padStart(2, "0");
  const month = months[match[2].toLowerCase()];
  const year = match[3];

  return `${year}-${month}-${day}`;
}

function extractDate(text: string): string | null {
  const dateValue = extractAfterLabel(text, ["tanggal", "tgl"]);

  if (dateValue) {
    const parsed = parseIndonesiaDate(dateValue);

    if (parsed) {
      return parsed;
    }

    const numericMatch = dateValue.match(
      /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/,
    );

    if (numericMatch) {
      const day = numericMatch[1].padStart(2, "0");
      const month = numericMatch[2].padStart(2, "0");
      const year = numericMatch[3];

      return `${year}-${month}-${day}`;
    }
  }

  // Fallback: Cari tanggal langsung dalam teks
  const dateMatch = text.match(
    /(\d{1,2}\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+\d{4})/i,
  );

  if (dateMatch) {
    return parseIndonesiaDate(dateMatch[0]);
  }

  return null;
}

export function parseLetterText(text: string): ParsedLetter {
  const letterNumber = extractAfterLabel(text, ["nomor", "no.", "no"]);
  const subject = extractAfterLabel(text, ["perihal", "hal", "subject"]);
  const sender = extractAfterLabel(text, ["dari", "asal"]);
  const recipient = extractAfterLabel(text, ["kepada", "untuk", "tujuan"]);

  return {
    letterNumber,
    letterDate: extractDate(text),
    subject,
    sender,
    recipient,
  };
}
