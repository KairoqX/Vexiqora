import { test } from "node:test";
import assert from "node:assert/strict";
import { formatJson, minifyJson, validateJson, positionToLineColumn } from "../src/lib/json";
import { diffLines, splitLines, MAX_COMPARISON_CELLS } from "../src/lib/diff";
import { encodeBase64, decodeBase64 } from "../src/lib/base64";
import { getTextStats, formatReadingTime } from "../src/lib/counter";

// ---------- JSON ----------
test("json: formats with 2 spaces, 4 spaces and tabs", () => {
  const input = '{"a":1,"b":[1,2]}';
  const two = formatJson(input, "2");
  assert.ok(two.ok && two.output?.includes('\n  "a": 1'));
  const four = formatJson(input, "4");
  assert.ok(four.ok && four.output?.includes('\n    "a": 1'));
  const tab = formatJson(input, "tab");
  assert.ok(tab.ok && tab.output?.includes('\n\t"a": 1'));
});

test("json: minifies", () => {
  const r = minifyJson('{\n  "a": 1,\n  "b": [1, 2]\n}');
  assert.ok(r.ok);
  assert.equal(r.output, '{"a":1,"b":[1,2]}');
});

test("json: empty input gives a friendly message, not a crash", () => {
  for (const fn of [() => formatJson("  ", "2"), () => minifyJson(""), () => validateJson("\n")]) {
    const r = fn();
    assert.equal(r.ok, false);
    assert.match(!r.ok ? r.error : "", /Paste some JSON/);
  }
});

test("json: invalid input reports an error", () => {
  const r = validateJson('{"a": 1,}');
  assert.equal(r.ok, false);
  assert.match(!r.ok ? r.error : "", /^Invalid JSON/);
});

test("json: validate describes the top-level value", () => {
  const obj = validateJson('{"a":1,"b":2}');
  assert.ok(obj.ok && /object with 2 keys/.test(obj.message));
  const arr = validateJson("[1]");
  assert.ok(arr.ok && /array with 1 item\./.test(arr.message));
  const str = validateJson('"hi"');
  assert.ok(str.ok && /string value/.test(str.message));
  const nul = validateJson("null");
  assert.ok(nul.ok && /null/.test(nul.message));
});

test("json: strips a byte-order mark", () => {
  assert.ok(validateJson('\uFEFF{"a":1}').ok);
});

test("json: user JSON is never executed", () => {
  (globalThis as Record<string, unknown>).__pwned = false;
  const r = validateJson('{"a": "__pwned = true"}');
  assert.ok(r.ok);
  assert.equal((globalThis as Record<string, unknown>).__pwned, false);
  assert.equal(validateJson("(globalThis.__pwned = true)").ok, false);
  assert.equal((globalThis as Record<string, unknown>).__pwned, false);
});

test("json: position to line/column", () => {
  assert.deepEqual(positionToLineColumn("ab\ncd", 4), { line: 2, column: 2 });
  assert.deepEqual(positionToLineColumn("abc", 0), { line: 1, column: 1 });
});

// ---------- Diff ----------
test("diff: marks added, removed and unchanged lines", () => {
  const r = diffLines("a\nb\nc", "a\nc\nd");
  assert.deepEqual(
    r.lines.map((l) => `${l.type}:${l.text}`),
    ["unchanged:a", "removed:b", "unchanged:c", "added:d"],
  );
  assert.equal(r.added, 1);
  assert.equal(r.removed, 1);
  assert.equal(r.unchanged, 2);
  assert.equal(r.identical, false);
});

test("diff: line numbers are tracked per side", () => {
  const r = diffLines("a\nb", "a\nx\nb");
  const added = r.lines.find((l) => l.type === "added");
  assert.equal(added?.oldNumber, null);
  assert.equal(added?.newNumber, 2);
  const last = r.lines[r.lines.length - 1];
  assert.equal(last.oldNumber, 2);
  assert.equal(last.newNumber, 3);
});

test("diff: identical and empty inputs", () => {
  assert.equal(diffLines("x\ny", "x\ny").identical, true);
  const empty = diffLines("", "");
  assert.equal(empty.identical, true);
  assert.equal(empty.lines.length, 0);
  const oneSided = diffLines("", "a\nb");
  assert.equal(oneSided.added, 2);
  assert.equal(oneSided.removed, 0);
});

test("diff: windows line endings and a trailing newline don't create false changes", () => {
  assert.equal(diffLines("a\r\nb\r\n", "a\nb").identical, true);
  assert.deepEqual(splitLines("a\n"), ["a"]);
  assert.deepEqual(splitLines(""), []);
});

test("diff: result reconstructs both inputs", () => {
  const a = "one\ntwo\nthree\nfour\nfive";
  const b = "one\n2\nthree\nfive\nsix";
  const r = diffLines(a, b);
  assert.equal(r.lines.filter((l) => l.type !== "added").map((l) => l.text).join("\n"), a);
  assert.equal(r.lines.filter((l) => l.type !== "removed").map((l) => l.text).join("\n"), b);
});

test("diff: refuses inputs that are too large instead of freezing", () => {
  const side = Math.ceil(Math.sqrt(MAX_COMPARISON_CELLS)) + 10;
  const a = Array.from({ length: side }, (_, i) => `a${i}`).join("\n");
  const b = Array.from({ length: side }, (_, i) => `b${i}`).join("\n");
  assert.throws(() => diffLines(a, b), /too large/);
});

// ---------- Base64 ----------
test("base64: encodes ASCII", () => {
  assert.equal(encodeBase64("Hello, World!"), "SGVsbG8sIFdvcmxkIQ==");
});

test("base64: round-trips non-English text and emoji", () => {
  for (const text of ["héllo wörld", "日本語のテキスト", "Привет, мир", "👋🌍 🧑‍💻", "مرحبا", "हिन्दी"]) {
    const decoded = decodeBase64(encodeBase64(text));
    assert.ok(decoded.ok, text);
    assert.equal(decoded.ok && decoded.output, text);
  }
});

test("base64: encodes empty input and very long input", () => {
  assert.equal(encodeBase64(""), "");
  const long = "x".repeat(200_000);
  const d = decodeBase64(encodeBase64(long));
  assert.ok(d.ok && d.output === long);
});

test("base64: url-safe mode", () => {
  const text = "??>>subjects?";
  const safe = encodeBase64(text, true);
  assert.doesNotMatch(safe, /[+/=]/);
  const d = decodeBase64(safe);
  assert.ok(d.ok && d.output === text);
});

test("base64: decodes with missing padding, whitespace and line breaks", () => {
  const d1 = decodeBase64("SGVsbG8");
  assert.ok(d1.ok && d1.output === "Hello");
  const d2 = decodeBase64("SGVs\nbG8s IFdv\r\ncmxkIQ==");
  assert.ok(d2.ok && d2.output === "Hello, World!");
});

test("base64: invalid input returns errors instead of throwing", () => {
  const bad = decodeBase64("not*valid");
  assert.equal(bad.ok, false);
  assert.match(!bad.ok ? bad.error : "", /found “\*” at character 4/);
  assert.equal(decodeBase64("").ok, false);
  assert.equal(decodeBase64("   ").ok, false);
  assert.equal(decodeBase64("A").ok, false); // impossible length
  const binary = decodeBase64("/9j/4AAQ"); // JPEG header bytes, not UTF-8 text
  assert.equal(binary.ok, false);
  assert.match(!binary.ok ? binary.error : "", /UTF-8/);
});

// ---------- Counter ----------
test("counter: empty text is all zeros", () => {
  assert.deepEqual(getTextStats(""), { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, lines: 0, paragraphs: 0 });
});

test("counter: counts words, characters, lines and paragraphs", () => {
  const s = getTextStats("Hello world.\nSecond line here.\n\nNew paragraph!");
  assert.equal(s.words, 7);
  assert.equal(s.lines, 4);
  assert.equal(s.paragraphs, 2);
  assert.equal(s.characters, "Hello world.\nSecond line here.\n\nNew paragraph!".length);
  assert.equal(s.charactersNoSpaces, "Helloworld.Secondlinehere.Newparagraph!".length);
});

test("counter: hyphenated words, punctuation-only tokens, extra spaces", () => {
  assert.equal(getTextStats("e-mail   — well-known").words, 2);
  assert.equal(getTextStats("   \n \t ").words, 0);
});

test("counter: emoji count as one character", () => {
  assert.equal(getTextStats("a👍b").characters, 3);
  assert.equal(getTextStats("🧑‍💻").characters, 1);
});

test("counter: reading time", () => {
  assert.equal(formatReadingTime(0), "0 min");
  assert.equal(formatReadingTime(119), "About 30 sec");
  assert.equal(formatReadingTime(476), "About 2 min");
});
