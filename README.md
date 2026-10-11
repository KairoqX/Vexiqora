# Vexiqora

**Free online developer tools that run in your browser.** 23 tools for JSON, encodings, text, design and generators. No accounts, no database, no paid services, no analytics. What you paste into a tool is processed on your own device and is not uploaded by the site's code.

Live at **https://vexiqora.vercel.app**. Built with Next.js (App Router), TypeScript and Tailwind CSS, and deployed on Vercel's free tier.

---

## The tools

Every tool has its own shareable URL (`/tools/<name>`), a "Load sample" button where there is input, Copy / Clear / Reset actions, Download where a file makes sense, clear error messages, and a how-to section with notes on its limits. Tools with predictable output also show a worked example, which an automated test checks against the real tool.

### Data & JSON
- **JSON Formatter & Validator** (`json-formatter`): format with 2 spaces, 4 spaces or tabs, minify, and validate; error line and column when the browser provides them; download the result.
- **JSON Minifier** (`json-minifier`): strips whitespace and shows the exact bytes saved (measured as UTF-8).
- **JSON Tree Viewer** (`json-tree-viewer`): expandable and collapsible tree built on native disclosure elements (keyboard accessible); Expand all / Collapse all; very large nodes show the first 500 children; all values are drawn as text.
- **JSON ⇄ CSV Converter** (`json-csv`): both directions; comma, semicolon, tab or pipe delimiters; quoted fields, escaped quotes and line breaks inside values; optional header row and number/boolean detection; leading zeros and huge integers stay as text; "Use output as input" flips direction.

### Web development
- **URL Encoder & Decoder** (`url-encoder`): component or full-URL encoding, "+ as space" decoding, clear errors for malformed percent-encoding.
- **HTML Entity Encoder & Decoder** (`html-entities`): encodes special characters (optionally all non-ASCII) and decodes numeric and common named entities. Input is handled purely as text and never inserted into the page.
- **Base64 Encoder & Decoder** (`base64`): full UTF-8 (emoji, non-English text), URL-safe option, tolerant decoding, specific error messages.
- **Unix Timestamp Converter** (`timestamp-converter`): seconds or milliseconds with auto-detection; ISO 8601, UTC, your time zone and relative time; dates back to timestamps (UTC, local or with an offset); impossible dates such as 31 February are rejected.
- **HTTP Status Code Reference** (`http-status-codes`): about 60 codes with short explanations, search and class filters, and an empty state.
- **JWT Decoder** (`jwt-decoder`): shows the header, payload and time claims (issued, not-before, expiry). It states prominently that it **decodes only and does not verify signatures**, and warns about unsigned and `alg: none` tokens.

### Text
- **Regex Tester** (`regex-tester`): live match highlighting, positions, capture and named groups, flags, replacement preview, clear syntax errors; text and match counts are capped to protect the tab.
- **Markdown Editor** (`markdown-editor`): live preview, Copy HTML, download `.md`. Raw HTML you type is shown as text, images are never loaded, and only http, https and mailto links are made clickable.
- **Case Converter** (`case-converter`): UPPER, lower, Title, Sentence, camel, Pascal, snake, kebab, CONSTANT and dot case; handles acronyms, digits, accents and multiple lines.
- **Word & Character Counter** (`word-counter`): words, characters (with and without spaces), sentences, lines, paragraphs, and a labelled reading-time estimate.
- **Text Diff Checker** (`text-diff`): single-list or side-by-side view, line numbers, the changed part of each paired line highlighted, hide-unchanged toggle, swap, and a size guard.

### Design
- **HEX, RGB & HSL Color Converter** (`color-converter`): accepts HEX (3/4/6/8 digits), `rgb()`/`rgba()` and `hsl()`/`hsla()`; live preview, color picker, copy buttons.
- **CSS Gradient Generator** (`gradient-generator`): linear, radial and conic; 2 to 6 stops; live preview; copy-ready CSS built only from validated values.
- **CSS Box Shadow Generator** (`box-shadow-generator`): offset, blur, spread, color and opacity sliders; up to 4 layers; inset option.
- **CSS Border Radius Generator** (`border-radius-generator`): independent or linked corners, px or %, elliptical corners, shortest valid CSS.

### Generators
- **Password Generator** (`password-generator`): 4 to 128 characters; uses `crypto.getRandomValues` with bias-free selection, guarantees each chosen character type, optional look-alike exclusion; shows an entropy-based strength estimate (clearly labelled as an estimate). Passwords are not stored.
- **UUID Generator** (`uuid-generator`): version 4 (random) or 7 (time-ordered), up to 1,000 at once, uppercase and no-hyphen options, copy and download.
- **Lorem Ipsum Generator** (`lorem-ipsum`): paragraphs, sentences or words, optional classic opening, with sensible limits.
- **Random Number Generator** (`random-number`): whole numbers or decimals between any bounds (up to ±9,007,199,254,740,991), secure and unbiased, unique-only, sorting, separators.

---

## The platform

- **Dark and light themes** with a button at the top left; follows your device setting at first, remembers your choice, and applies it before the page draws.
- **Searchable directory** on the homepage with category filters and an empty state.
- **Favorites** (star any tool) and **recently used** tools, saved only in your browser as tool names, with a "Clear recent" button.
- **Command palette:** press **Ctrl+K** (or **Cmd+K** on a Mac) anywhere to search and jump to a tool with the keyboard; built on the native `<dialog>` element, with arrow-key navigation, Enter to open and Esc to close.
- **Lazy loading:** each tool's code loads only when you open it.
- Consistent inputs, buttons, notices and empty states; responsive layout; respects the "reduce motion" setting.

## Privacy and security

- Tool input is processed in the browser and is never sent by the site's code. There are no accounts, analytics, ads or cookies set by Vexiqora.
- Saved in local storage: theme, favorite tool names, recent tool names. Never anything you type. The Privacy page says exactly this.
- User input is treated as untrusted: pasted HTML and Markdown are escaped or shown as text, links are restricted to safe schemes, and generated CSS contains only validated values. Automated tests try common attack strings.
- No secrets or API keys are used anywhere.

## Search and sharing

- Unique title and description for every page, canonical URLs, Open Graph and Twitter large-image cards, all built from `https://vexiqora.vercel.app`.
- Generated `sitemap.xml` (homepage, 23 tools, About, Privacy) and `robots.txt`. Vercel preview deployments are kept out of search.
- Tool pages are linked from the homepage, the footer (grouped by category), related-tool lists and the About page.
- Structured data describes each tool as a free web application, with no ratings or reviews.

---

## Verification status

**Done here:**
- 116 automated unit tests of the tool logic, examples, metadata, assets and security cases pass.
- A TypeScript check of all source against stand-in framework types found no problems in the project's own code.
- **32 real-browser tests** (Chromium) drove the actual tool components: loading samples, valid and invalid input, copy, download, favorites, recents, theme switching, the Ctrl+K palette and a blocked-storage case. All passed with no console errors or React warnings. This ran without Tailwind styling and without Next.js itself.

**Not done (you need to run these):**
- `npm install`, `npm run lint`, `npm run build` against the real packages (the sandbox had no network access).
- Visual checks: Tailwind styling, dark-theme appearance, mobile and tablet layouts, color contrast, focus rings, and any hydration messages in the browser console.
- Performance (Core Web Vitals), accessibility audits and social-card previews. No figures are claimed.
- Deployment, and any indexing or ranking by search engines.

## Not built yet
- YAML ⇄ JSON, HTML / CSS / JavaScript minifiers and the QR code generator. They are best built with established, well-tested libraries, which couldn't be installed or verified in this environment.

## Known limitations
- The regex tester runs on the page; an extremely slow pattern can freeze the tab for a while.
- Markdown supports a safe subset (no tables or nested lists).
- Sentence counts and reading time are estimates.
- Contact email and social profiles are not set, because no real values were provided.
