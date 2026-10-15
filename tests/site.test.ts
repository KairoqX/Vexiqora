import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { examples } from "../src/lib/examples";
import { formatJson } from "../src/lib/json";
import { diffLines } from "../src/lib/diff";
import { encodeBase64, decodeBase64 } from "../src/lib/base64";
import { formatReadingTime, getTextStats } from "../src/lib/counter";
import { absoluteUrl, resolveSiteUrl, siteConfig } from "../src/lib/site";
import { buildMetadata, pageTitle } from "../src/lib/metadata";
import { minifyJson } from "../src/lib/json";
import { jsonToCsv } from "../src/lib/csv";
import { encodeUrl, encodeHtmlEntities } from "../src/lib/textCodec";
import { describeDate } from "../src/lib/timestamp";
import { decodeJwt } from "../src/lib/jwt";
import { runRegex } from "../src/lib/regex";
import { renderMarkdown } from "../src/lib/markdown";
import { convertCase } from "../src/lib/caseConvert";
import { parseColor, toRgbString, toHslString } from "../src/lib/color";
import { gradientCss } from "../src/lib/gradient";
import { boxShadowCss, defaultLayer } from "../src/lib/boxShadow";
import { borderRadiusCss } from "../src/lib/borderRadius";

const root = path.resolve(__dirname, "..");

// ---------- the examples shown on tool pages are produced by the real tool logic ----------
test("example: JSON formatter output is exactly what the tool produces", () => {
  const r = formatJson(examples["json-formatter"].input, "2");
  assert.ok(r.ok);
  assert.equal(r.output, examples["json-formatter"].output);
});

test("example: text diff output is exactly what the tool produces", () => {
  const [oldPart, newPart] = examples["text-diff"].input.replace("Original:\n", "").split("\n\nChanged:\n");
  const symbol = { added: "+ ", removed: "− ", unchanged: "  " } as const;
  const out = diffLines(oldPart, newPart).lines.map((l) => symbol[l.type] + l.text).join("\n");
  assert.equal(out, examples["text-diff"].output);
});

test("example: Base64 output is exactly what the tool produces and decodes back", () => {
  const { input, output } = examples.base64;
  assert.equal(encodeBase64(input), output);
  const back = decodeBase64(output);
  assert.ok(back.ok && back.output === input);
});

test("example: word counter output is exactly what the tool produces", () => {
  const { input, output } = examples["word-counter"];
  const s = getTextStats(input);
  const lines = [
    `Words: ${s.words}`,
    `Characters: ${s.characters}`,
    `Characters (no spaces): ${s.charactersNoSpaces}`,
    `Sentences: ${s.sentences}`,
    `Lines: ${s.lines}`,
    `Paragraphs: ${s.paragraphs}`,
    `Reading time (estimate): ${formatReadingTime(s.words)}`,
  ];
  assert.equal(lines.join("\n"), output);
});

// ---------- configuration and metadata ----------
test("site config: description and title match the agreed wording", () => {
  assert.equal(
    siteConfig.description,
    "Free online developer tools for working with JSON, text, encodings, colors and more. Everything runs in your browser, and your input isn’t uploaded.",
  );
  assert.equal(siteConfig.homeTitle, "Vexiqora — Free Online Developer Tools");
});

test("site config: production domain is vexiqora.vercel.app unless overridden", () => {
  if (!process.env.NEXT_PUBLIC_SITE_URL) assert.equal(siteConfig.url, "https://vexiqora.vercel.app");
  assert.equal(siteConfig.name, "Vexiqora");
});

test("theme: every colour token exists in both the light and dark theme", () => {
  const config = fs.readFileSync(path.join(root, "tailwind.config.ts"), "utf8");
  const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const tokens = [...config.matchAll(/token\("([a-z-]+)"\)/g)].map((m) => m[1]);
  assert.ok(tokens.length >= 13);
  const light = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
  const dark = css.slice(css.indexOf(".dark"), css.indexOf("@layer base"));
  for (const t of tokens) {
    assert.match(light, new RegExp(`--${t}:\\s*\\d+ \\d+ \\d+;`), `light theme is missing --${t}`);
    assert.match(dark, new RegExp(`--${t}:\\s*\\d+ \\d+ \\d+;`), `dark theme is missing --${t}`);
  }
});

test("theme: the toggle is wired into the navbar and the layout", () => {
  assert.match(fs.readFileSync(path.join(root, "src/components/Navbar.tsx"), "utf8"), /<ThemeToggle \/>/);
  assert.match(fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8"), /themeScript/);
  assert.match(fs.readFileSync(path.join(root, "tailwind.config.ts"), "utf8"), /darkMode: "class"/);
});

test("site config: URLs come from one place and have no trailing slash", () => {
  assert.doesNotMatch(siteConfig.url, /\/$/);
  assert.equal(absoluteUrl("/"), `${siteConfig.url}/`);
  assert.equal(absoluteUrl("/tools/base64"), `${siteConfig.url}/tools/base64`);
});

test("metadata: titles follow '<page> — Vexiqora', and the homepage has its own title", () => {
  assert.equal(pageTitle("Text Diff Checker", "/tools/text-diff"), "Text Diff Checker — Vexiqora");
  assert.equal(pageTitle("ignored", "/"), "Vexiqora — Free Online Developer Tools");
});

test("metadata: canonical, Open Graph and Twitter agree and use an existing image", () => {
  const m = buildMetadata({ title: "Base64 Encoder & Decoder", description: "d", path: "/tools/base64" });
  assert.equal(m.alternates?.canonical, "/tools/base64");
  const og = m.openGraph as { url: string; title: string; images: { url: string; width: number; height: number }[] };
  assert.equal(og.url, "/tools/base64");
  assert.equal(og.title, "Base64 Encoder & Decoder — Vexiqora");
  assert.equal((m.twitter as { card: string }).card, "summary_large_image");
  assert.ok(fs.existsSync(path.join(root, "public", og.images[0].url)));
});

// ---------- assets referenced by the site actually exist, with correct sizes ----------
function pngSize(file: string) {
  const buf = fs.readFileSync(file);
  assert.equal(buf.subarray(1, 4).toString(), "PNG", `${file} is not a PNG`);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("assets: social image is a 1200x630 PNG matching the config", () => {
  const size = pngSize(path.join(root, "public", siteConfig.ogImage.path));
  assert.deepEqual(size, { width: siteConfig.ogImage.width, height: siteConfig.ogImage.height });
  assert.deepEqual(size, { width: 1200, height: 630 });
});

test("assets: apple-icon.png is 180x180", () => {
  assert.deepEqual(pngSize(path.join(root, "src/app/apple-icon.png")), { width: 180, height: 180 });
});

test("assets: favicon.ico is a valid ICO containing 16, 32 and 48 px images", () => {
  const buf = fs.readFileSync(path.join(root, "src/app/favicon.ico"));
  assert.equal(buf.readUInt16LE(0), 0);
  assert.equal(buf.readUInt16LE(2), 1); // 1 = icon
  const count = buf.readUInt16LE(4);
  const sizes = Array.from({ length: count }, (_, i) => buf.readUInt8(6 + 16 * i)).sort((a, b) => a - b);
  assert.deepEqual(sizes, [16, 32, 48]);
  for (let i = 0; i < count; i++) {
    const length = buf.readUInt32LE(6 + 16 * i + 8);
    const offset = buf.readUInt32LE(6 + 16 * i + 12);
    assert.ok(offset + length <= buf.length, "image data lies inside the file");
    assert.equal(buf.subarray(offset + 1, offset + 4).toString(), "PNG");
  }
});

test("assets: icon.svg is a 64x64 SVG that switches colours for dark browser tabs", () => {
  const svg = fs.readFileSync(path.join(root, "src/app/icon.svg"), "utf8");
  assert.match(svg, /^<svg[^>]+viewBox="0 0 64 64"/);
  assert.match(svg, /prefers-color-scheme: dark/);
  assert.match(svg, /<path class="mk"/);
  assert.doesNotMatch(svg, /#1d6b57/i, "no leftover green");
});

test("assets: the logo mark is shared, well-formed and used by the navbar logo and favicon", () => {
  const mark = fs.readFileSync(path.join(root, "src/lib/logoMark.ts"), "utf8");
  const d = (mark.match(/d: "([^"]+)"/) ?? [])[1] ?? "";
  assert.ok(d.length > 800 && d.startsWith("M") && d.endsWith("Z"));
  assert.equal((d.match(/M/g) ?? []).length, 5, "three V pieces, the orbit ring and the sparkle");
  assert.doesNotMatch(d, /NaN|undefined|Infinity/);
  const icon = fs.readFileSync(path.join(root, "src/app/icon.svg"), "utf8");
  assert.ok(icon.includes(d), "icon.svg uses exactly the same path as the navbar logo");
  assert.match(fs.readFileSync(path.join(root, "src/components/Logo.tsx"), "utf8"), /LOGO_MARK/);
  assert.ok(fs.readFileSync(path.join(root, "design/logo-mark.svg"), "utf8").includes(d), "the editable source matches");
});

test("assets: the social image source is monochrome", () => {
  const svg = fs.readFileSync(path.join(root, "design/og-image.svg"), "utf8");
  const colours = new Set((svg.match(/#[0-9a-f]{6}\b/gi) ?? []).map((c) => c.toLowerCase()));
  for (const c of colours) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    assert.ok(r === g && g === b, `${c} is not a grey`);
  }
});

// ---------- accessibility: colour contrast of the real theme values ----------
function themeColours(block: string): Record<string, [number, number, number]> {
  const out: Record<string, [number, number, number]> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(\d+) (\d+) (\d+);/g)) out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  return out;
}
const luminance = ([r, g, b]: [number, number, number]) => {
  const f = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("theme: text meets WCAG AA (4.5:1) and form borders meet 3:1 in both themes", () => {
  const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const themes = {
    light: themeColours(css.slice(css.indexOf(":root"), css.indexOf(".dark"))),
    dark: themeColours(css.slice(css.indexOf(".dark"), css.indexOf("@layer base"))),
  };
  const textPairs: [string, string][] = [
    ["ink", "canvas"], ["ink", "surface"], ["muted", "canvas"], ["muted", "surface"],
    ["accent-text", "surface"], ["accent-text", "canvas"], ["accent-text", "accent-soft"], ["ink", "accent-soft"],
    ["on-accent", "accent"], ["on-accent", "accent-strong"], ["danger", "danger-soft"], ["danger", "surface"],
    ["ink", "added-bg"], ["ink", "removed-bg"], ["muted", "removed-bg"],
  ];
  const uiPairs: [string, string][] = [["line-strong", "surface"], ["line-strong", "canvas"], ["accent", "canvas"], ["accent", "surface"]];
  for (const [name, t] of Object.entries(themes)) {
    for (const [fg, bg] of textPairs) assert.ok(contrast(t[fg], t[bg]) >= 4.5, `${name}: ${fg} on ${bg} is ${contrast(t[fg], t[bg]).toFixed(2)}:1`);
    for (const [fg, bg] of uiPairs) assert.ok(contrast(t[fg], t[bg]) >= 3, `${name}: ${fg} against ${bg} is ${contrast(t[fg], t[bg]).toFixed(2)}:1`);
  }
});

test("theme: the palette is monochrome apart from the error colour", () => {
  const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const block = css.slice(css.indexOf(":root"), css.indexOf("@layer base"));
  for (const [name, [r, g, b]] of Object.entries(themeColours(block))) {
    if (name.startsWith("danger")) continue;
    assert.ok(r === g && g === b, `--${name} (${r} ${g} ${b}) is not a grey`);
  }
});

test("theme: the toggle is an accessible black-and-white switch", () => {
  const toggle = fs.readFileSync(path.join(root, "src/components/ThemeToggle.tsx"), "utf8");
  assert.match(toggle, /role="switch"/);
  assert.match(toggle, /aria-checked=/);
  assert.match(toggle, /aria-label="Dark theme"/);
  assert.match(fs.readFileSync(path.join(root, "src/components/Button.tsx"), "utf8"), /text-on-accent/);
});

test("assets: no static robots.txt or sitemap.xml that would conflict with the generated ones", () => {
  for (const f of ["public/robots.txt", "public/sitemap.xml", "src/app/robots.txt", "src/app/sitemap.xml"]) {
    assert.equal(fs.existsSync(path.join(root, f)), false, `${f} would conflict`);
  }
});

test("routes: every tool in the registry is fully wired up", () => {
  const registry = fs.readFileSync(path.join(root, "src/lib/tools.ts"), "utf8");
  const renderer = fs.readFileSync(path.join(root, "src/components/ToolRenderer.tsx"), "utf8");
  const slugs = [...registry.matchAll(/^\s+slug: "([^"]+)"/gm)].map((m) => m[1]);
  assert.equal(slugs.length, 23);
  assert.equal(new Set(slugs).size, slugs.length, "slugs are unique");
  for (const slug of slugs) {
    assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${slug} is a clean URL segment`);
    const key = slug.includes("-") ? `"${slug}"` : slug;
    const match = renderer.match(new RegExp(`${key}: dynamic\\(\\(\\) => import\\("\\./tools/(\\w+)"\\), \\{ loading: ToolLoading \\}\\)`));
    assert.ok(match, `ToolRenderer has no entry for ${slug}`);
    assert.ok(fs.existsSync(path.join(root, "src/components/tools", `${match[1]}.tsx`)), `component file for ${slug} is missing`);
  }
  // the four original tools keep their original URLs
  for (const slug of ["json-formatter", "text-diff", "base64", "word-counter"]) assert.ok(slugs.includes(slug), slug);
  assert.ok(fs.existsSync(path.join(root, "src/app/tools/[slug]/page.tsx")));
});

test("registry: unique titles and descriptions, and a category for every tool", () => {
  const registry = fs.readFileSync(path.join(root, "src/lib/tools.ts"), "utf8");
  const grab = (field: string) => [...registry.matchAll(new RegExp(`^\\s+${field}:\\s*\\n?\\s*"([^"]+)"`, "gm"))].map((m) => m[1]);
  const titles = grab("seoTitle");
  const descriptions = grab("seoDescription");
  assert.equal(titles.length, 23);
  assert.equal(descriptions.length, 23);
  assert.equal(new Set(titles).size, 23, "titles are unique");
  assert.equal(new Set(descriptions).size, 23, "descriptions are unique");
  for (const d of descriptions) assert.ok(d.length >= 80 && d.length <= 200, `description length ${d.length}: ${d}`);
  const categories = new Set([...registry.matchAll(/^\s+category: "([^"]+)"/gm)].map((m) => m[1]));
  assert.deepEqual([...categories].sort(), ["Data & JSON", "Design", "Generators", "Text", "Web development"]);
});

// ---------- examples for the newer tools are produced by the real tool logic ----------

test("example: JSON minifier and JSON to CSV", () => {
  const min = minifyJson(examples["json-minifier"].input);
  assert.ok(min.ok && min.output === examples["json-minifier"].output);
  const csv = jsonToCsv(examples["json-csv"].input);
  assert.ok(csv.ok && csv.output === examples["json-csv"].output);
});

test("example: URL and HTML entity encoding", () => {
  const url = encodeUrl(examples["url-encoder"].input, "component");
  assert.ok(url.ok && url.output === examples["url-encoder"].output);
  assert.equal(encodeHtmlEntities(examples["html-entities"].input), examples["html-entities"].output);
});

test("example: timestamp rows", () => {
  const rows = describeDate(new Date(1700000000 * 1000), new Date(), "UTC");
  const get = (label: string) => rows.find((r) => r.label === label)?.value;
  const text = ["ISO 8601 (UTC)", "UTC", "Unix seconds", "Unix milliseconds"].map((l) => `${l}: ${get(l)}`).join("\n");
  assert.equal(text, examples["timestamp-converter"].output);
});

test("example: JWT decoder shows exactly what the tool decodes", () => {
  const r = decodeJwt(examples["jwt-decoder"].input);
  assert.ok(r.ok);
  assert.equal(`${r.headerJson}\n\n${r.payloadJson}`, examples["jwt-decoder"].output);
});

test("example: regex matches, markdown and case converter", () => {
  const [pattern, text] = examples["regex-tester"].input.replace("Pattern: ", "").split("\nText: ");
  const rx = runRegex(pattern, "g", text);
  assert.ok(rx.ok);
  const lines = rx.matches.map((m, i) => `Match ${i + 1} at ${m.index}: ${m.text} (groups: ${m.groups.join(", ")})`).join("\n");
  assert.equal(lines, examples["regex-tester"].output);
  assert.equal(renderMarkdown(examples["markdown-editor"].input), examples["markdown-editor"].output);
  const text2 = examples["case-converter"].input;
  const cases = `camelCase: ${convertCase(text2, "camel")}\nsnake_case: ${convertCase(text2, "snake")}\nTitle Case: ${convertCase(text2, "title")}`;
  assert.equal(cases, examples["case-converter"].output);
});

test("example: color, gradient, box shadow and border radius", () => {
  const c = parseColor(examples["color-converter"].input);
  assert.ok(c.ok);
  assert.equal(`${toRgbString(c.color)}\n${toHslString(c.color)}`, examples["color-converter"].output);
  const g = gradientCss({ type: "linear", angle: 90, stops: [{ color: "#111111", position: 0 }, { color: "#e5e5e5", position: 100 }] });
  assert.ok(g.ok && g.css === examples["gradient-generator"].output);
  const s = boxShadowCss([defaultLayer]);
  assert.ok(s.ok && s.css === examples["box-shadow-generator"].output);
  const r = borderRadiusCss({ unit: "px", horizontal: [8, 16, 8, 16], vertical: null });
  assert.ok(r.ok && r.css === examples["border-radius-generator"].output);
});
