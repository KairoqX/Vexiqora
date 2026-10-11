# Vexiqora

A free online developer toolbox with **23 tools** that run entirely in the visitor’s browser: no accounts, no database, no paid APIs, no analytics. Live at https://vexiqora.vercel.app.

Built with Next.js (App Router), TypeScript and Tailwind CSS.

| Category | Tools |
| --- | --- |
| Data & JSON | JSON Formatter & Validator · JSON Minifier · JSON Tree Viewer · JSON ⇄ CSV Converter |
| Web development | URL Encoder/Decoder · HTML Entity Encoder/Decoder · Base64 Encoder/Decoder · Unix Timestamp Converter · HTTP Status Code Reference · JWT Decoder |
| Text | Regex Tester · Markdown Editor · Case Converter · Word & Character Counter · Text Diff (single list or side by side) |
| Design | HEX/RGB/HSL Color Converter · CSS Gradient Generator · CSS Box Shadow Generator · CSS Border Radius Generator |
| Generators | Password Generator · UUID Generator · Lorem Ipsum Generator · Random Number Generator |

Site features: dark and light themes, a searchable tool directory with category filters, favorites and recently used tools (saved only in your browser), and a **Ctrl+K / Cmd+K** command palette. Each tool has its own URL, `/tools/<slug>`.

**Not built yet:** YAML ⇄ JSON, HTML/CSS/JavaScript minifiers and the QR code generator. They need well-tested third-party libraries (for example `yaml`, `qrcode`, `terser`) and are planned as a later batch.

## 1. Install

You need **Node.js 20 or newer** (check with `node -v`; download from https://nodejs.org if needed).

```bash
cd vexiqora
npm install
cp .env.example .env.local
```

## 2. Run it locally

```bash
npm run dev
```

Open http://localhost:3000. Edits you save appear automatically.

## 3. Check it

```bash
npm run test        # 116 unit tests for the tool logic, examples, metadata and assets
npm run lint        # code-style and accessibility checks
npm run typecheck   # TypeScript checks
npm run build       # production build, the same one Vercel runs
npm run start       # serve the production build at http://localhost:3000
```

Run `npm run build` before every deploy. If it fails, read the first error message; it names the file and line. After building, click through a few tools by hand in the browser. The automated tests check the logic, not the screen.

## 4. Environment variables

The production domain, **https://vexiqora.vercel.app**, is already set in `src/lib/site.ts`, so none of these are required. Set them in `.env.local` locally, and in Vercel under **Project → Settings → Environment Variables**.

| Name | What it does |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Only needed if the site moves to another domain. Overrides the default for canonical links, Open Graph URLs, `sitemap.xml` and `robots.txt`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional. Shown on the Contact page, which is then added to the sitemap. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional. The code from Google Search Console’s “HTML tag” method (see below). |

`NEXT_PUBLIC_` means the value is visible in the browser. That’s fine here: none are secret. Never put passwords or API keys in a `NEXT_PUBLIC_` variable. Redeploy after changing a variable.

## 5. Deploy to Vercel (free)

1. Create a GitHub account if you don’t have one, then create a new empty repository.
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial Vexiqora"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/vexiqora.git
   git push -u origin main
   ```
3. Go to https://vercel.com, sign in with GitHub, choose **Add New → Project**, and import the repository. Vercel detects Next.js; keep the defaults.
4. No environment variables are required. Add `NEXT_PUBLIC_CONTACT_EMAIL` if you want a contact address shown.
5. Select **Deploy**. Every later `git push` redeploys automatically.
6. Make sure the project’s domain is `vexiqora.vercel.app` (**Project → Settings → Domains**). If you later add a custom domain, set `NEXT_PUBLIC_SITE_URL` to it and redeploy.
7. After launch, follow the Search Console steps below.

## Project structure

```
src/
  app/                        Each folder here becomes a URL ("routes").
    layout.tsx                Wraps every page: fonts, navbar, footer, theme script, default metadata.
    page.tsx                  Homepage (/).
    tools/[slug]/page.tsx     ONE page that serves every tool at /tools/<slug>. Titles, descriptions
                              and canonical URLs come from the tool list in src/lib/tools.ts.
    about/ privacy/ contact/  Text pages.
    sitemap.ts, robots.ts     Generate /sitemap.xml and /robots.txt (tools are added automatically).
    favicon.ico, icon.svg, apple-icon.png   Site icons, linked automatically by filename.
    globals.css               Light and dark colour values, Markdown preview styles, reduced-motion rule.
  components/
    tools/                    One interactive component per tool (JsonTool.tsx, RegexTool.tsx, ...).
    ToolRenderer.tsx          Maps each tool's URL name to its component and loads it only when needed.
    ToolLayout.tsx            Frame shared by all tool pages: heading, favorite button, how-to, example, notes.
    ToolBrowser.tsx           Homepage search, category filters, favorites and recently used.
    CommandPalette.tsx        The Ctrl+K / Cmd+K search window.
    Fields.tsx                Shared form controls (text box, dropdown, checkbox, slider, choice group).
    Button, CopyButton, DownloadButton, TextArea, Notice, ThemeToggle, ToolActions, Navbar, Footer, Logo, ToolCard, PageShell
  lib/                        Plain TypeScript with no screen code, so it is easy to test.
    json.ts jsonTree.ts csv.ts textCodec.ts uuid.ts random.ts randomNumbers.ts timestamp.ts httpStatus.ts
    jwt.ts regex.ts markdown.ts caseConvert.ts counter.ts diff.ts color.ts gradient.ts boxShadow.ts
    borderRadius.ts password.ts lorem.ts base64.ts     The logic of each tool.
    tools.ts                  The list of tools: names, descriptions, how-to text (one source of truth).
    examples.ts samples.ts    The worked examples shown on pages, and the "Load sample" inputs.
    search.ts storage.ts useList.ts   Tool search, and favorites / recents in local storage.
    site.ts metadata.ts       Domain, titles, canonical URLs, Open Graph and Twitter tags.
public/og-image.png           Social sharing image (1200 × 630). Editable source: design/og-image.svg.
tests/                        Unit tests (run with npm run test).
tailwind.config.ts            Colour names and fonts. The colour values are in src/app/globals.css.
```

## A few concepts, in plain language

- **Component**: a function that returns a piece of the page. `<Button />` is a component. Small components are combined into pages.
- **Props**: the inputs you pass to a component, like arguments to a Python function: `<CopyButton text="hi" label="Copy" />`.
- **Server vs client components**: by default, Next.js components are built ahead of time on the server and sent as plain HTML (fast, good for search engines). A file that starts with `"use client"` also runs in the visitor’s browser, which is needed for anything interactive such as buttons, typing and the clipboard.
- **`useState`**: how a component remembers a value (such as the text in a box). When you change it, React redraws the part of the page that uses it.
- **Lazy loading**: each tool’s code is downloaded only when you open that tool (see `ToolRenderer.tsx`), so opening one tool doesn’t load the other twenty-two.
- **Dynamic route**: the folder name `[slug]` means “any value here”. One file serves `/tools/json-formatter`, `/tools/regex-tester` and so on.

## Adding a new tool

1. Put its logic in `src/lib/<name>.ts` and add tests in `tests/`.
2. Build its interface in `src/components/tools/<Name>Tool.tsx` (start the file with `"use client";`). Copy a similar existing tool as a starting point.
3. Add an entry to the `tools` list in `src/lib/tools.ts` (name, category, icon, description, how-to text).
4. Add one line to the list in `src/components/ToolRenderer.tsx`.
5. Optionally add a worked example in `src/lib/examples.ts` and a sample in `src/lib/samples.ts`.

The homepage, command palette, footer, About page and sitemap update automatically. `npm run test` checks that every tool in the list has a component and is registered.

## Privacy and monetization notes

- The tools never send input anywhere. The only things saved in the browser are the theme, favorite tool names and recently used tool names (never what you type). The privacy page describes this accurately. **If you add analytics or ads later, update `src/app/privacy/page.tsx` first.**
- Safety measures: the Markdown preview escapes all text and shows raw HTML as text, loads no images, and only links http, https and mailto addresses (covered by tests). The password, UUID and random-number tools use `crypto.getRandomValues`, never `Math.random`. The JWT decoder only decodes and says clearly that it does not verify signatures.
- The code has no ad or analytics hooks, by design. Ethical ad networks or a premium tier can be added later; reserve fixed-height ad slots to avoid layout shift.
- Icons and the social image are files served from your own site. No third-party requests are involved.

## Dark theme

The button at the top left switches themes. The first visit follows your device’s light/dark setting; after you click, your choice is remembered in your browser’s local storage (described on the Privacy page). To change colours, edit the two blocks of variables at the top of `src/app/globals.css` (`:root` for light, `.dark` for dark).

## SEO and indexing: how it's set up

- **One domain setting.** Every canonical URL, Open Graph URL, sitemap entry and the `robots.txt` sitemap line is built from `src/lib/site.ts`, which defaults to `https://vexiqora.vercel.app`.
- **Previews are kept out of search.** Vercel *Preview* deployments (test copies on other addresses) send `noindex` and a `Disallow: /` robots.txt, so they can’t compete with the real site. The Production deployment allows normal crawling.
- **Titles.** Pages use `<Page> — Vexiqora`; the homepage uses `Vexiqora — Free Online Developer Tools`. Change the wording in `src/lib/site.ts` and `src/lib/tools.ts`.
- **Sitemap** lists the homepage, the four tools, About and Privacy. Contact is added only when `NEXT_PUBLIC_CONTACT_EMAIL` is set, because the page has nothing useful until then.
- **Social profiles** are not set. If you want them, add real URLs to `socialProfiles` and your handle to `twitterHandle` in `src/lib/site.ts`.

## After you deploy: Search Console (manual steps)

Because the address ends in `.vercel.app`, you don’t control its DNS, so use a **URL prefix** property (not a Domain property).

1. Open https://search.google.com/search-console and choose **Add property → URL prefix**, then enter `https://vexiqora.vercel.app`.
2. Choose the **HTML tag** verification method. Copy only the `content` value of the tag it shows.
3. In Vercel, add it as the environment variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (Production), redeploy, then select **Verify** in Search Console.
4. Under **Sitemaps**, submit `https://vexiqora.vercel.app/sitemap.xml`.
5. Use **URL inspection** on the homepage and each tool page, then **Request indexing**.
6. Check `https://vexiqora.vercel.app/robots.txt` shows `Allow: /`.
7. Indexing and ranking are decided by the search engine and can take days or weeks. Nothing in this project can guarantee them.

## Checking a deployed site by hand

- `/favicon.ico`, `/icon.svg`, `/apple-icon.png` and `/og-image.png` each open an image.
- View the page source of a tool page: the `<title>`, `<link rel="canonical">`, `og:image` and `twitter:card` tags should all use your domain.
- Paste a tool URL into https://www.opengraph.xyz or the Facebook Sharing Debugger / LinkedIn Post Inspector to preview the share card (these services may cache; use their "re-scrape" option after changes).
