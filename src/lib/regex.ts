// Regular expression testing. Patterns run with the browser's own RegExp engine.
// Very complex patterns on long text can be slow, so the text length and match count are capped.

export interface RegexMatch {
  index: number;
  text: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[]; truncated: boolean }
  | { ok: false; error: string };

export const MAX_MATCHES = 1000;
export const MAX_TEXT_LENGTH = 200_000;
export const ALLOWED_FLAGS = "dgimsuy";

export function buildRegex(pattern: string, flags: string): { ok: true; regex: RegExp } | { ok: false; error: string } {
  if (pattern === "") return { ok: false, error: "Enter a pattern to test." };
  for (const flag of flags) {
    if (!ALLOWED_FLAGS.includes(flag)) return { ok: false, error: `“${flag}” isn’t a supported flag. Supported flags are ${ALLOWED_FLAGS.split("").join(", ")}.` };
  }
  if (new Set(flags).size !== flags.length) return { ok: false, error: "Each flag can only be used once." };
  try {
    return { ok: true, regex: new RegExp(pattern, flags) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "This isn’t a valid regular expression." };
  }
}

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  if (text.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: `The test text is too long (the limit is ${MAX_TEXT_LENGTH.toLocaleString("en-US")} characters).` };
  }

  const toMatch = (m: RegExpMatchArray | RegExpExecArray): RegexMatch => ({
    index: m.index ?? 0,
    text: m[0],
    groups: m.slice(1),
    named: m.groups ? { ...m.groups } : {},
  });

  const matches: RegexMatch[] = [];
  let truncated = false;
  if (flags.includes("g")) {
    for (const m of text.matchAll(built.regex)) {
      if (matches.length >= MAX_MATCHES) {
        truncated = true;
        break;
      }
      matches.push(toMatch(m));
    }
  } else {
    const m = built.regex.exec(text);
    if (m) matches.push(toMatch(m));
  }
  return { ok: true, matches, truncated };
}

export interface Segment {
  text: string;
  matched: boolean;
}

/** Splits the text into highlighted and plain pieces. Empty matches can't be highlighted, so they're skipped. */
export function buildSegments(text: string, matches: RegexMatch[]): Segment[] {
  const segments: Segment[] = [];
  let position = 0;
  for (const m of matches) {
    if (m.text === "" || m.index < position) continue;
    if (m.index > position) segments.push({ text: text.slice(position, m.index), matched: false });
    segments.push({ text: m.text, matched: true });
    position = m.index + m.text.length;
  }
  if (position < text.length) segments.push({ text: text.slice(position), matched: false });
  return segments;
}

/** Replacement uses JavaScript's rules: $1 for a group, $& for the whole match, $$ for a dollar sign. */
export function applyReplacement(pattern: string, flags: string, text: string, replacement: string): { ok: true; output: string } | { ok: false; error: string } {
  const built = buildRegex(pattern, flags);
  if (!built.ok) return built;
  if (text.length > MAX_TEXT_LENGTH) return { ok: false, error: "The test text is too long." };
  return { ok: true, output: text.replace(built.regex, replacement) };
}
