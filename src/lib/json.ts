// JSON logic. We only ever use JSON.parse, which reads data and never runs it as code.

export type IndentOption = "2" | "4" | "tab";

export type JsonResult =
  | { ok: true; output: string | null; message: string }
  | { ok: false; error: string };

const EMPTY_MESSAGE = "Paste some JSON into the input box first.";

/** Turns a character position into a "line X, column Y" pair (both start at 1). */
export function positionToLineColumn(text: string, position: number) {
  const before = text.slice(0, Math.max(0, position));
  const lines = before.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * Browsers word JSON errors differently, so we pull out a location when the
 * browser gives us one, and otherwise show the browser's message as it is.
 */
function describeError(input: string, err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);

  const lineCol = raw.match(/line (\d+) column (\d+)/i);
  if (lineCol) return `Invalid JSON at line ${lineCol[1]}, column ${lineCol[2]}. ${raw}`;

  const pos = raw.match(/position (\d+)/i);
  if (pos) {
    const { line, column } = positionToLineColumn(input, Number(pos[1]));
    return `Invalid JSON at line ${line}, column ${column}. ${raw}`;
  }

  return `Invalid JSON. ${raw}`;
}

export type ParsedJson = { ok: true; value: unknown } | { ok: false; error: string };

/** Reads JSON text safely. JSON.parse only reads data; it never runs it as code. */
export function parseJson(input: string): ParsedJson {
  // Strip a leading byte-order mark that some editors add to files.
  const text = input.replace(/^\uFEFF/, "");
  if (text.trim() === "") return { ok: false, error: EMPTY_MESSAGE };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: describeError(text, err) };
  }
}

export function formatJson(input: string, indent: IndentOption): JsonResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  const space = indent === "tab" ? "\t" : Number(indent);
  return { ok: true, output: JSON.stringify(parsed.value, null, space), message: "Formatted successfully." };
}

export function minifyJson(input: string): JsonResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  return { ok: true, output: JSON.stringify(parsed.value), message: "Minified successfully." };
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function describeValue(value: unknown): string {
  if (Array.isArray(value)) return `an array with ${plural(value.length, "item")}`;
  if (value === null) return "null";
  if (typeof value === "object") return `an object with ${plural(Object.keys(value).length, "key")}`;
  return `a ${typeof value} value`;
}

export function validateJson(input: string): JsonResult {
  const parsed = parseJson(input);
  if (!parsed.ok) return parsed;
  return { ok: true, output: null, message: `Valid JSON. The top level is ${describeValue(parsed.value)}.` };
}

/** Size of the text in bytes when saved as UTF-8 (what a file or network request would use). */
export function sizeInBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}
