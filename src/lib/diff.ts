// Line-by-line text comparison using the "longest common subsequence" idea:
// find the lines both texts share, in order; everything else was added or removed.

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  oldNumber: number | null; // line number in the original text
  newNumber: number | null; // line number in the changed text
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  unchanged: number;
  identical: boolean;
}

/** The comparison table grows with (lines × lines). This keeps it from freezing a phone. */
export const MAX_COMPARISON_CELLS = 4_000_000;

export function splitLines(text: string): string[] {
  if (text === "") return [];
  const normalized = text.replace(/\r\n?/g, "\n");
  // A single trailing newline ends the last line; it doesn't start a new empty one.
  const trimmed = normalized.endsWith("\n") ? normalized.slice(0, -1) : normalized;
  return trimmed.split("\n");
}

type Step = { type: DiffLineType; text: string };

function diffMiddle(a: string[], b: string[]): Step[] {
  const n = a.length;
  const m = b.length;
  const width = m + 1;

  if ((n + 1) * width > MAX_COMPARISON_CELLS) {
    throw new Error(
      "These texts are too large to compare in the browser. Try comparing smaller sections.",
    );
  }

  // table[i * width + j] = length of the longest shared run of lines in a[i..] and b[j..]
  const table = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  const steps: Step[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      steps.push({ type: "unchanged", text: a[i] });
      i++;
      j++;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      steps.push({ type: "removed", text: a[i] });
      i++;
    } else {
      steps.push({ type: "added", text: b[j] });
      j++;
    }
  }
  while (i < n) steps.push({ type: "removed", text: a[i++] });
  while (j < m) steps.push({ type: "added", text: b[j++] });
  return steps;
}

export function diffLines(oldText: string, newText: string): DiffResult {
  const a = splitLines(oldText);
  const b = splitLines(newText);

  // Lines that match at the very start or end don't need the expensive comparison.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const steps: Step[] = [
    ...a.slice(0, start).map((text): Step => ({ type: "unchanged", text })),
    ...diffMiddle(a.slice(start, endA), b.slice(start, endB)),
    ...a.slice(endA).map((text): Step => ({ type: "unchanged", text })),
  ];

  let oldNumber = 0;
  let newNumber = 0;
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  const lines = steps.map((step): DiffLine => {
    if (step.type === "removed") {
      removed++;
      return { ...step, oldNumber: ++oldNumber, newNumber: null };
    }
    if (step.type === "added") {
      added++;
      return { ...step, oldNumber: null, newNumber: ++newNumber };
    }
    unchanged++;
    return { ...step, oldNumber: ++oldNumber, newNumber: ++newNumber };
  });

  return { lines, added, removed, unchanged, identical: added === 0 && removed === 0 };
}

export interface SideBySideRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

/** Lines up removed lines (left) against the added lines that replaced them (right). */
export function toSideBySide(lines: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "unchanged") {
      rows.push({ left: line, right: line });
      i++;
      continue;
    }
    const removed: DiffLine[] = [];
    const added: DiffLine[] = [];
    while (i < lines.length && lines[i].type === "removed") removed.push(lines[i++]);
    while (i < lines.length && lines[i].type === "added") added.push(lines[i++]);
    for (let k = 0; k < Math.max(removed.length, added.length); k++) {
      rows.push({ left: removed[k] ?? null, right: added[k] ?? null });
    }
  }
  return rows;
}

export interface InlineDiff {
  prefix: string;
  oldMiddle: string;
  newMiddle: string;
  suffix: string;
}

const isHighSurrogate = (code: number) => code >= 0xd800 && code <= 0xdbff;
const isLowSurrogate = (code: number) => code >= 0xdc00 && code <= 0xdfff;

/** Finds which part of two similar lines changed: the text between their shared start and shared end. */
export function inlineDiff(oldLine: string, newLine: string): InlineDiff {
  let start = 0;
  const shortest = Math.min(oldLine.length, newLine.length);
  while (start < shortest && oldLine[start] === newLine[start]) start++;
  if (start > 0 && isHighSurrogate(oldLine.charCodeAt(start - 1))) start--; // never split an emoji

  let end = 0;
  while (end < shortest - start && oldLine[oldLine.length - 1 - end] === newLine[newLine.length - 1 - end]) end++;
  if (end > 0 && isLowSurrogate(oldLine.charCodeAt(oldLine.length - end))) end--;

  return {
    prefix: oldLine.slice(0, start),
    oldMiddle: oldLine.slice(start, oldLine.length - end),
    newMiddle: newLine.slice(start, newLine.length - end),
    suffix: oldLine.slice(oldLine.length - end),
  };
}
