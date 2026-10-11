import { test } from "node:test";
import assert from "node:assert/strict";
import { runRegex, buildSegments, applyReplacement, MAX_MATCHES, MAX_TEXT_LENGTH } from "../src/lib/regex";
import { renderMarkdown, safeUrl } from "../src/lib/markdown";
import { convertCase, splitWords, caseStyles } from "../src/lib/caseConvert";
import { getTextStats } from "../src/lib/counter";
import { diffLines, toSideBySide, inlineDiff } from "../src/lib/diff";
import { parseColor, toHex, toRgbString, toHslString, toOpaqueHex, hslToRgb, rgbToHsl } from "../src/lib/color";
import { gradientCss } from "../src/lib/gradient";
import { boxShadowCss, defaultLayer } from "../src/lib/boxShadow";
import { borderRadiusCss, shorthand } from "../src/lib/borderRadius";
import { generatePassword, strengthLabel, LOWER, UPPER, DIGITS, SYMBOLS } from "../src/lib/password";
import { generateLorem, LIMITS } from "../src/lib/lorem";
import { matchesTool, rankTools } from "../src/lib/search";

// ---------- regex ----------
test("regex: matches, positions, groups and named groups", () => {
  const r = runRegex("(?<user>\\w+)@(\\w+)\\.com", "g", "mail ann@site.com and bob@corp.com");
  assert.ok(r.ok && !r.truncated);
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].text, "ann@site.com");
  assert.equal(r.matches[0].index, 5);
  assert.deepEqual(r.matches[0].groups, ["ann", "site"]);
  assert.equal(r.matches[1].named.user, "bob");
});

test("regex: without the g flag only the first match is returned; i flag works", () => {
  const first = runRegex("a", "", "banana");
  assert.ok(first.ok && first.matches.length === 1 && first.matches[0].index === 1);
  const ci = runRegex("HELLO", "gi", "Hello hello");
  assert.ok(ci.ok && ci.matches.length === 2);
  assert.ok(runRegex("x", "g", "abc").ok);
  const none = runRegex("x", "g", "abc");
  assert.ok(none.ok && none.matches.length === 0);
});

test("regex: clear errors for invalid patterns and flags", () => {
  const bad = runRegex("(", "g", "x");
  assert.ok(!bad.ok && /Invalid regular expression/i.test(bad.error));
  assert.ok(!runRegex("a", "gg", "x").ok);
  const unknown = runRegex("a", "z", "x");
  assert.ok(!unknown.ok && /isn’t a supported flag/.test(unknown.error));
  const empty = runRegex("", "g", "x");
  assert.ok(!empty.ok && /Enter a pattern/.test(empty.error));
  assert.ok(!runRegex("a", "g", "x".repeat(MAX_TEXT_LENGTH + 1)).ok);
});

test("regex: empty matches don't loop forever and match count is capped", () => {
  const empty = runRegex("x*", "g", "abc");
  assert.ok(empty.ok && empty.matches.length === 4); // before a, b, c and at the end
  const many = runRegex("a", "g", "a".repeat(MAX_MATCHES + 50));
  assert.ok(many.ok && many.truncated && many.matches.length === MAX_MATCHES);
});

test("regex: unicode flag, segments and replacement", () => {
  const r = runRegex("\\p{L}+", "gu", "héllo wörld 123");
  assert.ok(r.ok && r.matches.map((m) => m.text).join("|") === "héllo|wörld");
  const text = "one two three";
  const seg = runRegex("t\\w+", "g", text);
  assert.ok(seg.ok);
  const segments = buildSegments(text, seg.matches);
  assert.equal(segments.map((s) => s.text).join(""), text);
  assert.deepEqual(segments.filter((s) => s.matched).map((s) => s.text), ["two", "three"]);
  const rep = applyReplacement("(\\w+) (\\w+)", "", "hello world", "$2 $1");
  assert.ok(rep.ok && rep.output === "world hello");
  assert.ok(!applyReplacement("(", "g", "x", "y").ok);
});

// ---------- markdown (safety first) ----------
test("markdown: basic formatting", () => {
  assert.equal(renderMarkdown("# Title"), "<h1>Title</h1>");
  assert.equal(renderMarkdown("###### Six"), "<h6>Six</h6>");
  assert.equal(renderMarkdown("Some **bold**, *italic*, ~~gone~~ and `code`."), "<p>Some <strong>bold</strong>, <em>italic</em>, <del>gone</del> and <code>code</code>.</p>");
  assert.equal(renderMarkdown("- a\n- b"), "<ul><li>a</li><li>b</li></ul>");
  assert.equal(renderMarkdown("1. a\n2. b"), "<ol><li>a</li><li>b</li></ol>");
  assert.equal(renderMarkdown("---"), "<hr>");
  assert.equal(renderMarkdown("> quoted"), "<blockquote><p>quoted</p></blockquote>");
  assert.equal(renderMarkdown("line one\nline two"), "<p>line one\nline two</p>");
  assert.equal(renderMarkdown("a  \nb"), "<p>a<br>\nb</p>");
  assert.equal(renderMarkdown("```js\nconst a = 1 < 2;\n```"), '<pre><code class="language-js">const a = 1 &lt; 2;</code></pre>');
  assert.equal(renderMarkdown("one\n\ntwo"), "<p>one</p>\n<p>two</p>");
});

test("markdown: raw HTML is shown as text, never rendered", () => {
  const attacks = [
    "<script>alert(1)</script>",
    '<img src=x onerror="alert(1)">',
    "<iframe src='https://evil.example'></iframe>",
    '<a href="javascript:alert(1)">x</a>',
    "<svg onload=alert(1)>",
    "<style>body{display:none}</style>",
  ];
  for (const attack of attacks) {
    const html = renderMarkdown(attack);
    assert.doesNotMatch(html, /<(script|img|iframe|svg|style|a )/i, html);
    assert.match(html, /&lt;/);
  }
  // attributes can't be broken out of
  const html = renderMarkdown('[x](https://a.test/"onmouseover="alert(1))');
  const tag = (html.match(/<a [^>]*>/) ?? [""])[0];
  assert.equal((tag.match(/="/g) ?? []).length, 3, `the link tag must have exactly href, rel and target: ${tag}`);
  assert.match(tag, /^<a href="[^"]*" rel="noopener noreferrer nofollow" target="_blank">$/);
});

test("markdown: only safe link addresses become links, and images are never loaded", () => {
  assert.equal(safeUrl("https://example.com/a?b=1&c=2"), "https://example.com/a?b=1&c=2");
  assert.equal(safeUrl("mailto:a@b.com"), "mailto:a@b.com");
  assert.equal(safeUrl("#section"), "#section");
  assert.equal(safeUrl("/docs"), "/docs");
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\tscript:alert(1)", "data:text/html;base64,AAAA", "//evil.example", "vbscript:x", " javascript:alert(1)", "https://a b", ""]) {
    assert.equal(safeUrl(bad), null, bad);
  }
  assert.doesNotMatch(renderMarkdown("[click](javascript:alert(1))"), /<a /);
  assert.match(renderMarkdown("[click](javascript:alert(1))"), /\[click\]\(javascript:alert\(1\)\)/);
  const link = renderMarkdown("[Site](https://example.com)");
  assert.equal(link, '<p><a href="https://example.com" rel="noopener noreferrer nofollow" target="_blank">Site</a></p>');
  const img = renderMarkdown("![logo](https://tracker.example/pixel.png)");
  assert.doesNotMatch(img, /<img/);
  assert.match(img, /\[image: logo\]/);
});

test("markdown: code content is escaped and not formatted; odd input doesn't crash", () => {
  assert.equal(renderMarkdown("`<b>*x*</b>`"), "<p><code>&lt;b&gt;*x*&lt;/b&gt;</code></p>");
  assert.equal(renderMarkdown("[**bold** `code`](https://e.com)").includes("<strong>bold</strong> <code>code</code>"), true);
  assert.doesNotThrow(() => renderMarkdown("\u0000\u0001 ``` \n```\n[\n](\n**\n_ _\n> > > >"));
  assert.doesNotThrow(() => renderMarkdown(">".repeat(100) + " deep"));
  assert.equal(renderMarkdown(""), "");
  // user text that looks like our internal placeholders is stripped, not trusted
  assert.doesNotMatch(renderMarkdown("\u00000\u0000 \u00010\u0001"), /undefined/);
});

// ---------- case conversion ----------
test("case: every style", () => {
  const t = "hello big World";
  const expected: Record<string, string> = {
    upper: "HELLO BIG WORLD", lower: "hello big world", title: "Hello Big World", sentence: "Hello big world",
    camel: "helloBigWorld", pascal: "HelloBigWorld", snake: "hello_big_world", kebab: "hello-big-world",
    constant: "HELLO_BIG_WORLD", dot: "hello.big.world",
  };
  for (const { value } of caseStyles) assert.equal(convertCase(t, value), expected[value], value);
  assert.equal(caseStyles.length, 10);
});

test("case: converting between identifier styles, acronyms, digits, unicode and multiple lines", () => {
  assert.deepEqual(splitWords("myHTTPServer2Go"), ["my", "HTTP", "Server2", "Go"]);
  assert.equal(convertCase("userID", "snake"), "user_id");
  assert.equal(convertCase("some_snake_case-and kebab", "camel"), "someSnakeCaseAndKebab");
  assert.equal(convertCase("XMLHttpRequest", "kebab"), "xml-http-request");
  assert.equal(convertCase("first line\nsecond line", "pascal"), "FirstLine\nSecondLine");
  assert.equal(convertCase("élan vital", "title"), "Élan Vital");
  assert.equal(convertCase("one. two! three? four", "sentence"), "One. Two! Three? Four");
  assert.equal(convertCase("well-known (thing)", "title"), "Well-Known (Thing)");
  assert.equal(convertCase("", "camel"), "");
  assert.equal(convertCase("  ", "snake"), "");
});

// ---------- counter: sentences ----------
test("counter: sentences", () => {
  assert.equal(getTextStats("").sentences, 0);
  assert.equal(getTextStats("Hello world. How are you? Fine!").sentences, 3);
  assert.equal(getTextStats("3.14 is pi.").sentences, 1);
  assert.equal(getTextStats("No punctuation at all").sentences, 1);
  assert.equal(getTextStats("Wow!!! Really?!").sentences, 2);
  assert.equal(getTextStats("...   ").sentences, 0);
});

// ---------- diff: side by side ----------
test("diff: side-by-side pairs removed lines with their replacements", () => {
  const rows = toSideBySide(diffLines("a\nb\nc", "a\nx\nc\nd").lines);
  assert.deepEqual(rows.map((r) => [r.left?.text ?? null, r.right?.text ?? null]), [["a", "a"], ["b", "x"], ["c", "c"], [null, "d"]]);
  const removedOnly = toSideBySide(diffLines("a\nb", "a").lines);
  assert.deepEqual(removedOnly.map((r) => [r.left?.text ?? null, r.right?.text ?? null]), [["a", "a"], ["b", null]]);
  assert.deepEqual(toSideBySide([]), []);
});

test("diff: in-line highlighting finds the changed middle", () => {
  assert.deepEqual(inlineDiff("the quick fox", "the slow fox"), { prefix: "the ", oldMiddle: "quick", newMiddle: "slow", suffix: " fox" });
  assert.deepEqual(inlineDiff("abc", "abc"), { prefix: "abc", oldMiddle: "", newMiddle: "", suffix: "" });
  assert.deepEqual(inlineDiff("", "new"), { prefix: "", oldMiddle: "", newMiddle: "new", suffix: "" });
  const emoji = inlineDiff("a😀b", "a😁b");
  assert.equal(emoji.oldMiddle, "😀");
  assert.equal(emoji.newMiddle, "😁");
  const parts = inlineDiff("hello world", "hello brave world");
  assert.equal(parts.prefix + parts.oldMiddle + parts.suffix, "hello world");
  assert.equal(parts.prefix + parts.newMiddle + parts.suffix, "hello brave world");
});

// ---------- colors ----------
test("color: parses HEX, RGB and HSL forms", () => {
  const cases: [string, string, string, string][] = [
    ["#ff0000", "#ff0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)"],
    ["00ff00", "#00ff00", "rgb(0, 255, 0)", "hsl(120, 100%, 50%)"],
    ["#fff", "#ffffff", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"],
    ["rgb(0 0 0)", "#000000", "rgb(0, 0, 0)", "hsl(0, 0%, 0%)"],
    ["hsl(210, 50%, 50%)", "#4080bf", "rgb(64, 128, 191)", "hsl(210, 50%, 50%)"],
    ["rgb(100%, 0%, 0%)", "#ff0000", "rgb(255, 0, 0)", "hsl(0, 100%, 50%)"],
  ];
  for (const [input, hex, rgb, hsl] of cases) {
    const r = parseColor(input);
    assert.ok(r.ok, input);
    assert.equal(toHex(r.color), hex, input);
    assert.equal(toRgbString(r.color), rgb, input);
    assert.equal(toHslString(r.color), hsl, input);
  }
});

test("color: transparency in every format", () => {
  const a = parseColor("#ff000080");
  assert.ok(a.ok && a.color.a === 0.5);
  assert.ok(a.ok && toRgbString(a.color) === "rgba(255, 0, 0, 0.5)" && toHex(a.color) === "#ff000080" && toOpaqueHex(a.color) === "#ff0000");
  const b = parseColor("rgba(10, 20, 30, 0.25)");
  assert.ok(b.ok && toHslString(b.color).startsWith("hsla("));
  const c = parseColor("rgb(10 20 30 / 50%)");
  assert.ok(c.ok && c.color.a === 0.5);
  const d = parseColor("#abcd");
  assert.ok(d.ok && d.color.r === 0xaa && Math.abs(d.color.a - 0.87) < 0.01);
});

test("color: out-of-range values are clamped and bad input is rejected", () => {
  const r = parseColor("rgb(300, -5, 128)");
  assert.ok(r.ok && r.color.r === 255 && r.color.g === 0 && r.color.b === 128);
  for (const bad of ["", "not a color", "#12", "#ggg", "rgb(1,2)", "rgb(a,b,c)", "hsl(x, 1%, 2%)", "rgb(1,2,3,4,5)"]) {
    assert.equal(parseColor(bad).ok, false, bad);
  }
});

test("color: HSL and RGB conversions round-trip", () => {
  for (const [r, g, b] of [[29, 107, 87], [255, 128, 0], [0, 0, 0], [200, 200, 200], [12, 34, 250]]) {
    const { h, s, l } = rgbToHsl(r, g, b);
    assert.deepEqual(hslToRgb(h, s, l), { r, g, b });
  }
  assert.deepEqual(hslToRgb(-120, 100, 50), { r: 0, g: 0, b: 255 }); // negative hues wrap
  assert.deepEqual(hslToRgb(480, 100, 50), { r: 0, g: 255, b: 0 });
});

// ---------- gradient ----------
test("gradient: linear, radial and conic CSS", () => {
  const stops = [{ color: "#ff0000", position: 0 }, { color: "rgb(0, 0, 255)", position: 100 }];
  const lin = gradientCss({ type: "linear", angle: 90, stops });
  assert.ok(lin.ok);
  assert.equal(lin.css, "background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);");
  const rad = gradientCss({ type: "radial", angle: 0, stops });
  assert.ok(rad.ok && rad.value === "radial-gradient(circle, #ff0000 0%, #0000ff 100%)");
  const con = gradientCss({ type: "conic", angle: 45, stops });
  assert.ok(con.ok && con.value === "conic-gradient(from 45deg, #ff0000 0%, #0000ff 100%)");
});

test("gradient: sorting, angle wrapping, clamping and validation", () => {
  const r = gradientCss({ type: "linear", angle: -90, stops: [{ color: "#000", position: 150 }, { color: "#fff", position: -20 }] });
  assert.ok(r.ok && r.value === "linear-gradient(270deg, #ffffff 0%, #000000 100%)");
  assert.ok(!gradientCss({ type: "linear", angle: 0, stops: [{ color: "#000", position: 0 }] }).ok);
  assert.ok(!gradientCss({ type: "linear", angle: 0, stops: Array(7).fill({ color: "#000", position: 0 }) }).ok);
  const badColor = gradientCss({ type: "linear", angle: 0, stops: [{ color: "red; background:url(x)", position: 0 }, { color: "#fff", position: 1 }] });
  assert.ok(!badColor.ok && /Stop 1/.test(badColor.error));
  assert.ok(!gradientCss({ type: "linear", angle: NaN, stops: [{ color: "#000", position: 0 }, { color: "#fff", position: 1 }] }).ok);
});

// ---------- box shadow ----------
test("box shadow: single, inset and multiple layers", () => {
  const one = boxShadowCss([defaultLayer]);
  assert.ok(one.ok && one.css === "box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);");
  const inset = boxShadowCss([{ ...defaultLayer, inset: true, color: "#ff0000", opacity: 50, x: 2, y: -3, blur: -5, spread: 4 }]);
  assert.ok(inset.ok && inset.value === "inset 2px -3px 0px 4px rgba(255, 0, 0, 0.5)"); // negative blur becomes 0
  const two = boxShadowCss([defaultLayer, { ...defaultLayer, y: 1 }]);
  assert.ok(two.ok && two.value.includes(",\n    0px 1px"));
  assert.deepEqual(boxShadowCss([]), { ok: true, value: "none", css: "box-shadow: none;" });
  assert.ok(!boxShadowCss(Array(5).fill(defaultLayer)).ok);
  assert.ok(!boxShadowCss([{ ...defaultLayer, x: NaN }]).ok);
  assert.ok(!boxShadowCss([{ ...defaultLayer, color: "nope" }]).ok);
  const full = boxShadowCss([{ ...defaultLayer, opacity: 100 }]);
  assert.ok(full.ok && full.value.endsWith("rgb(0, 0, 0)"));
});

// ---------- border radius ----------
test("border radius: shortest shorthand and elliptical corners", () => {
  assert.equal(shorthand([8, 8, 8, 8], "px"), "8px");
  assert.equal(shorthand([8, 16, 8, 16], "px"), "8px 16px");
  assert.equal(shorthand([8, 16, 4, 16], "px"), "8px 16px 4px");
  assert.equal(shorthand([1, 2, 3, 4], "%"), "1% 2% 3% 4%");
  const round = borderRadiusCss({ unit: "px", horizontal: [10, 10, 10, 10], vertical: null });
  assert.ok(round.ok && round.css === "border-radius: 10px;");
  const ellipse = borderRadiusCss({ unit: "px", horizontal: [10, 20, 10, 20], vertical: [30, 40, 30, 40] });
  assert.ok(ellipse.ok && ellipse.value === "10px 20px / 30px 40px");
  const same = borderRadiusCss({ unit: "%", horizontal: [50, 50, 50, 50], vertical: [50, 50, 50, 50] });
  assert.ok(same.ok && same.value === "50%");
  assert.ok(!borderRadiusCss({ unit: "px", horizontal: [-1, 0, 0, 0], vertical: null }).ok);
  assert.ok(!borderRadiusCss({ unit: "%", horizontal: [101, 0, 0, 0], vertical: null }).ok);
  assert.ok(!borderRadiusCss({ unit: "px", horizontal: [NaN, 0, 0, 0], vertical: null }).ok);
});

// ---------- password ----------
const allOn = { length: 16, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false };

test("password: length, character types and uniqueness", () => {
  for (let i = 0; i < 200; i++) {
    const r = generatePassword(allOn);
    assert.ok(r.ok);
    assert.equal(r.password.length, 16);
    assert.match(r.password, /[a-z]/);
    assert.match(r.password, /[A-Z]/);
    assert.match(r.password, /[0-9]/);
    assert.ok([...r.password].some((c) => SYMBOLS.includes(c)));
  }
  const set = new Set(Array.from({ length: 200 }, () => { const r = generatePassword(allOn); return r.ok ? r.password : ""; }));
  assert.equal(set.size, 200);
});

test("password: only the selected types, ambiguous characters excluded, minimum length equals type count", () => {
  const digits = generatePassword({ ...allOn, lower: false, upper: false, symbols: false, length: 40 });
  assert.ok(digits.ok && /^[0-9]{40}$/.test(digits.password) && digits.poolSize === 10);
  const clear = generatePassword({ ...allOn, length: 128, excludeAmbiguous: true });
  assert.ok(clear.ok && !/[Il1O0o]/.test(clear.password));
  const four = generatePassword({ ...allOn, length: 4 });
  assert.ok(four.ok && four.password.length === 4 && /[a-z]/.test(four.password) && /[A-Z]/.test(four.password));
  for (const c of LOWER + UPPER + DIGITS + SYMBOLS) assert.ok(c.length === 1);
});

test("password: errors and entropy estimate", () => {
  assert.ok(!generatePassword({ ...allOn, lower: false, upper: false, digits: false, symbols: false }).ok);
  assert.ok(!generatePassword({ ...allOn, length: 3 }).ok);
  assert.ok(!generatePassword({ ...allOn, length: 129 }).ok);
  assert.ok(!generatePassword({ ...allOn, length: 10.5 }).ok);
  const r = generatePassword({ ...allOn, upper: false, symbols: false, length: 20 }); // pool of 36
  assert.ok(r.ok && r.poolSize === 36 && r.entropyBits === Math.round(20 * Math.log2(36)));
  assert.equal(strengthLabel(20), "Weak");
  assert.equal(strengthLabel(50), "Fair");
  assert.equal(strengthLabel(70), "Strong");
  assert.equal(strengthLabel(100), "Very strong");
});

// ---------- lorem ipsum ----------
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

test("lorem: exact counts for words, sentences and paragraphs", () => {
  const words = generateLorem({ unit: "words", count: 25, startWithLorem: false }, seeded(1));
  assert.equal(words.split(" ").length, 25);
  assert.match(words, /^[A-Z]/);
  const sentences = generateLorem({ unit: "sentences", count: 7, startWithLorem: false }, seeded(2));
  assert.equal((sentences.match(/\./g) ?? []).length, 7);
  const paragraphs = generateLorem({ unit: "paragraphs", count: 4, startWithLorem: false }, seeded(3));
  assert.equal(paragraphs.split("\n\n").length, 4);
  assert.ok(paragraphs.split("\n\n").every((p) => p.endsWith(".")));
});

test("lorem: classic opening, limits and bad counts", () => {
  assert.ok(generateLorem({ unit: "paragraphs", count: 2, startWithLorem: true }, seeded(4)).startsWith("Lorem ipsum dolor sit amet, consectetur adipiscing elit."));
  assert.equal(generateLorem({ unit: "words", count: 3, startWithLorem: true }), "Lorem ipsum dolor");
  assert.ok(generateLorem({ unit: "sentences", count: 1, startWithLorem: true }).startsWith("Lorem ipsum"));
  assert.equal(generateLorem({ unit: "words", count: 0, startWithLorem: false }).split(" ").length, 1);
  assert.equal(generateLorem({ unit: "words", count: 99999, startWithLorem: false }).split(" ").length, LIMITS.words);
  assert.equal(generateLorem({ unit: "words", count: 12, startWithLorem: true }, seeded(5)).split(" ").length, 12);
});

// ---------- search ----------
const sample = [
  { slug: "json-formatter", name: "JSON Formatter", summary: "Pretty-print JSON", category: "Data & JSON", keywords: ["beautify"] },
  { slug: "base64", name: "Base64 Encoder", summary: "Encode text", category: "Web development" },
  { slug: "word-counter", name: "Word Counter", summary: "Count words", category: "Text" },
];

test("search: matches name, summary, category and keywords; every word must match", () => {
  assert.equal(matchesTool(sample[0], ""), true);
  assert.equal(matchesTool(sample[0], "beautify"), true);
  assert.equal(matchesTool(sample[0], "json pretty"), true);
  assert.equal(matchesTool(sample[0], "json zzz"), false);
  assert.equal(matchesTool(sample[2], "TEXT"), true);
  assert.equal(matchesTool(sample[1], "  "), true);
});

test("search: ranking puts name matches, favorites and recents first", () => {
  assert.deepEqual(rankTools(sample, "").map((t) => t.slug), ["json-formatter", "base64", "word-counter"]);
  assert.deepEqual(rankTools(sample, "", ["word-counter"]).map((t) => t.slug)[0], "word-counter");
  assert.deepEqual(rankTools(sample, "", [], ["base64"]).map((t) => t.slug)[0], "base64");
  assert.deepEqual(rankTools(sample, "word").map((t) => t.slug), ["word-counter"]);
  assert.deepEqual(rankTools(sample, "encode")[0].slug, "base64");
  assert.equal(rankTools(sample, "nothing matches this").length, 0);
});
