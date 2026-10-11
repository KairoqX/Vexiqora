// JSON <-> CSV conversion. CSV parsing follows RFC 4180: quoted fields, doubled quotes, line breaks inside quotes.
import { parseJson } from "./json";

export type Delimiter = "," | ";" | "\t" | "|";
export type ConvertResult = { ok: true; output: string } | { ok: false; error: string };

function escapeCell(value: string, delimiter: string): string {
  return /["\r\n]/.test(value) || value.includes(delimiter) ? `"${value.replace(/"/g, '""')}"` : value;
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value); // nested data is kept as JSON text
  return String(value);
}

export function jsonToCsv(input: string, delimiter: Delimiter = ","): ConvertResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;

  const rows: unknown[] = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
  if (rows.length === 0) return { ok: false, error: "The JSON array is empty, so there is nothing to convert." };

  // An array of arrays becomes rows of cells directly.
  if (rows.every((row) => Array.isArray(row))) {
    const lines = (rows as unknown[][]).map((row) => row.map((cell) => escapeCell(cellText(cell), delimiter)).join(delimiter));
    return { ok: true, output: lines.join("\n") };
  }

  const columns: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      return { ok: false, error: `Item ${i + 1} isn’t an object. Use an array of objects, such as [{"a": 1}, {"a": 2}].` };
    }
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  const lines = [columns.map((c) => escapeCell(c, delimiter)).join(delimiter)];
  for (const row of rows as Record<string, unknown>[]) {
    lines.push(columns.map((c) => escapeCell(cellText(row[c]), delimiter)).join(delimiter));
  }
  return { ok: true, output: lines.join("\n") };
}

export function parseCsv(text: string, delimiter: string): { ok: true; rows: string[][] } | { ok: false; error: string } {
  const source = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let line = 1;
  let quoteLine = 1;

  const endRow = () => {
    row.push(field);
    // Skip completely blank lines.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
    field = "";
  };

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (inQuotes) {
      if (c === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        if (c === "\n") line++;
        field += c;
      }
    } else if (c === '"' && field === "") {
      inQuotes = true;
      quoteLine = line;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\r" || c === "\n") {
      if (c === "\r" && source[i + 1] === "\n") i++;
      endRow();
      line++;
    } else {
      field += c;
    }
  }
  if (inQuotes) return { ok: false, error: `A quoted value that starts on line ${quoteLine} is never closed. Add the missing closing quote (").` };
  if (field !== "" || row.length > 0) endRow();
  return { ok: true, rows };
}

function inferValue(text: string): string | number | boolean {
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(text)) {
    const n = Number(text);
    // Keep very large whole numbers as text so no digits are lost.
    if (Number.isFinite(n) && (!/^-?\d+$/.test(text) || Number.isSafeInteger(n))) return n;
  }
  return text;
}

export interface CsvToJsonOptions {
  delimiter: Delimiter;
  /** Treat the first row as column names. */
  header: boolean;
  /** Turn numbers and true/false into real JSON numbers and booleans. */
  inferTypes: boolean;
}

export function csvToJson(input: string, { delimiter, header, inferTypes }: CsvToJsonOptions): ConvertResult {
  if (input.trim() === "") return { ok: false, error: "Paste some CSV into the input box first." };
  const parsed = parseCsv(input, delimiter);
  if (!parsed.ok) return parsed;
  if (parsed.rows.length === 0) return { ok: false, error: "No rows were found in the CSV." };

  const convert = (cell: string) => (inferTypes ? inferValue(cell) : cell);

  if (!header) {
    return { ok: true, output: JSON.stringify(parsed.rows.map((r) => r.map(convert)), null, 2) };
  }

  const used = new Map<string, number>();
  const names = parsed.rows[0].map((raw, i) => {
    const base = raw.trim() === "" ? `column_${i + 1}` : raw.trim();
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base}_${count}`; // repeated column names get _2, _3, ...
  });

  const records = parsed.rows.slice(1).map((cells) => {
    const record: Record<string, unknown> = {};
    cells.forEach((cell, i) => {
      record[names[i] ?? `column_${i + 1}`] = convert(cell);
    });
    for (let i = cells.length; i < names.length; i++) record[names[i]] = ""; // short rows are padded
    return record;
  });
  return { ok: true, output: JSON.stringify(records, null, 2) };
}
