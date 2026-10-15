import {
  AlignLeft, Binary, Box, Braces, CaseSensitive, Clock, Code, FileText, Fingerprint, GitCompare, Globe,
  KeyRound, Layers, Link as LinkIcon, ListTree, Lock, Minimize2, Palette, Regex, Shuffle, Square, Table, Type,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "Data & JSON" | "Web development" | "Text" | "Design" | "Generators";

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  icon: LucideIcon;
  /** Short line shown on the tool card and under the page heading. */
  summary: string;
  /** Extra words people might search for, such as "beautify" for a JSON formatter. */
  keywords: string[];
  /** Page title (the site name is added automatically). */
  seoTitle: string;
  seoDescription: string;
  /** Longer explanation shown below the tool. */
  about: string;
  howTo: string[];
  goodToKnow: string[];
}

export const categoryOrder: ToolCategory[] = ["Data & JSON", "Web development", "Text", "Design", "Generators"];

// To add a tool:
//  1. add an entry here,
//  2. build its component in src/components/tools/ and register it in src/components/ToolRenderer.tsx.
// The homepage, command palette, footer, sitemap and the /tools/<slug> page pick it up automatically.
export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    category: "Data & JSON",
    icon: Braces,
    summary: "Pretty-print, minify and validate JSON, with clear error locations.",
    keywords: ["beautify", "prettify", "lint", "indent", "syntax"],
    seoTitle: "JSON Formatter & Validator",
    seoDescription:
      "Format, minify and validate JSON online. See exactly where a syntax error is. Runs in your browser, so your data isn’t uploaded.",
    about:
      "JSON is the text format most web APIs and config files use. This tool reads your JSON, checks that it is valid, and rewrites it either with neat indentation (easier for people to read) or with all extra whitespace removed (smaller to send over a network).",
    howTo: ["Paste your JSON into the input box, or select Load sample.", "Choose Format to indent it, Minify to remove whitespace, or Validate to only check it.", "Fix any error shown, using the line and column as a guide, then copy or download the result."],
    goodToKnow: ["Your JSON is parsed as data and never run as code.", "Browsers read JSON numbers as floating-point values, so integers larger than 9,007,199,254,740,991 can lose precision.", "Error wording and positions come from your browser, so they can differ slightly between Chrome, Firefox and Safari."],
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    category: "Data & JSON",
    icon: Minimize2,
    summary: "Strip whitespace from JSON and see how many bytes you save.",
    keywords: ["compress", "compact", "shrink", "minify"],
    seoTitle: "JSON Minifier",
    seoDescription:
      "Minify JSON online by removing spaces and line breaks, and see the exact size saved. Runs in your browser, so your data isn’t uploaded.",
    about:
      "Minifying JSON removes every space, tab and line break that isn’t part of a value. The data stays identical, but the text gets smaller, which helps when you store it or send it over a network. This tool also tells you the size before and after, measured in bytes.",
    howTo: ["Paste formatted JSON into the input box.", "Select Minify. The compact version and the size saved appear.", "Copy the result or download it as a .json file."],
    goodToKnow: ["Only whitespace outside values is removed. Spaces inside strings are kept exactly.", "Invalid JSON is rejected with an error instead of being guessed at.", "Sizes are measured as UTF-8 bytes, so accented letters and emoji count as more than one byte."],
  },
  {
    slug: "json-tree-viewer",
    name: "JSON Tree Viewer",
    category: "Data & JSON",
    icon: ListTree,
    summary: "Explore JSON as a tree you can expand and collapse.",
    keywords: ["explorer", "viewer", "navigate", "nested", "inspect"],
    seoTitle: "JSON Tree Viewer",
    seoDescription:
      "View JSON as a collapsible tree. Expand and collapse nested objects and arrays to explore large documents. Runs in your browser.",
    about:
      "Long JSON can be hard to read as plain text. The tree view shows each object and array as a node you can open or close, with a short summary such as the number of keys or items, so you can find the part you care about quickly.",
    howTo: ["Paste JSON into the input box, or select Load sample.", "Select a node’s arrow or label to open or close it. Use Expand all or Collapse all for the whole tree.", "If the JSON is invalid, the error shows where the parser stopped."],
    goodToKnow: ["Values are always drawn as plain text, never as HTML.", "Objects and arrays with more than 500 children show the first 500 and a count of the rest, to keep the page responsive.", "Nodes are native disclosure elements, so Tab and Enter or Space work from the keyboard."],
  },
  {
    slug: "json-csv",
    name: "JSON to CSV & CSV to JSON Converter",
    category: "Data & JSON",
    icon: Table,
    summary: "Convert between JSON arrays and CSV tables in either direction.",
    keywords: ["spreadsheet", "excel", "table", "comma separated", "convert"],
    seoTitle: "JSON to CSV and CSV to JSON Converter",
    seoDescription:
      "Convert JSON to CSV or CSV to JSON online, with delimiter choice, quoted fields and type detection. Runs in your browser.",
    about:
      "CSV is the table format spreadsheets use, and JSON is the format most APIs use. This tool turns an array of JSON objects into CSV rows, or CSV rows back into JSON objects, handling commas, quotes and line breaks inside values.",
    howTo: ["Choose the direction: JSON to CSV or CSV to JSON.", "Paste your data, or select Load sample. The result updates as you type.", "Copy the output or download it as a .csv or .json file."],
    goodToKnow: ["For JSON to CSV, use an array of objects. Columns are the keys found across all objects, and nested objects or arrays are kept as JSON text in one cell.", "For CSV to JSON, the first row can be treated as column names, and numbers and true/false can be detected. Values like 007 stay as text so no digits are lost.", "If you open generated CSV in a spreadsheet, be careful with cells that start with =, +, - or @: spreadsheets can treat them as formulas."],
  },
  {
    slug: "url-encoder",
    name: "URL Encoder & Decoder",
    category: "Web development",
    icon: LinkIcon,
    summary: "Percent-encode or decode text for use in URLs.",
    keywords: ["percent encoding", "uri", "query string", "escape", "urlencode"],
    seoTitle: "URL Encoder & Decoder",
    seoDescription:
      "Encode or decode URLs and query-string values with percent-encoding, including emoji and non-English text. Runs in your browser.",
    about:
      "URLs can only contain certain characters, so anything else, such as spaces, & signs or accented letters, is written as a percent sign followed by hex digits. This tool converts text to that form and back.",
    howTo: ["Choose Encode or Decode.", "Type or paste your text. The result updates as you type.", "When encoding, pick Component for a single value, or Full URL to keep characters like / and ? intact."],
    goodToKnow: ["Component mode escapes almost everything and is right for a value inside a query string. Full URL mode leaves the structure of a web address alone.", "When decoding form data, tick “Treat + as a space”, because forms use + for spaces.", "Text is converted as UTF-8, so emoji and non-English characters work."],
  },
  {
    slug: "html-entities",
    name: "HTML Entity Encoder & Decoder",
    category: "Web development",
    icon: Code,
    summary: "Escape special characters as HTML entities, or turn entities back into text.",
    keywords: ["escape", "unescape", "ampersand", "html encode", "entities"],
    seoTitle: "HTML Entity Encoder & Decoder",
    seoDescription:
      "Encode special characters as HTML entities or decode entities back to text. Pasted markup is treated as plain text and never run.",
    about:
      "Characters like < and & have special meaning in HTML, so to show them as text they are written as entities such as &lt; and &amp;. This tool escapes text for use in a page and decodes entities back to normal characters.",
    howTo: ["Choose Encode or Decode.", "Paste your text. The result updates as you type.", "When encoding, optionally convert every non-ASCII character to a numeric entity."],
    goodToKnow: ["Pasted HTML is handled purely as text. Nothing you paste is ever added to the page, so it can’t run.", "Decoding understands numeric entities and a common set of named ones. Unknown names are left exactly as typed.", "Escaping the characters &, <, >, double quotes and single quotes helps when placing text inside HTML, but it is not a substitute for a full security review of your site."],
  },
  {
    slug: "base64",
    name: "Base64 Encoder & Decoder",
    category: "Web development",
    icon: Binary,
    summary: "Encode text to Base64 or decode it back, including emoji and non-English text.",
    keywords: ["base 64", "atob", "btoa", "encode", "decode"],
    seoTitle: "Base64 Encoder & Decoder",
    seoDescription:
      "Encode text to Base64 or decode Base64 to text online, with full UTF-8 support for emoji and non-English characters. Runs in your browser.",
    about:
      "Base64 represents data using only letters, numbers and a few symbols, so it can travel safely through systems built for plain text, such as email and URLs. It is an encoding, not encryption: anyone can decode it.",
    howTo: ["Choose Encode (text to Base64) or Decode (Base64 to text).", "Type or paste your input, or select Load sample. The result updates as you type.", "Copy the output, or use “Use output as input” to run it back the other way."],
    goodToKnow: ["Base64 is not a way to keep secrets. Don’t use it to protect passwords or private data.", "Decoding accepts both the standard alphabet and the URL-safe alphabet, with or without = padding.", "Only text is supported. Base64 that decodes to a file, such as an image, is reported as an error."],
  },
  {
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    category: "Web development",
    icon: Clock,
    summary: "Convert Unix seconds or milliseconds to dates, and dates back to timestamps.",
    keywords: ["epoch", "unix time", "date", "time zone", "iso 8601"],
    seoTitle: "Unix Timestamp Converter",
    seoDescription:
      "Convert Unix timestamps in seconds or milliseconds to readable dates in UTC and your time zone, and convert dates back. Runs in your browser.",
    about:
      "A Unix timestamp counts the seconds (or milliseconds) since 1 January 1970 UTC. Programs use it to store moments in time. This tool turns a timestamp into a readable date, and a date into a timestamp.",
    howTo: ["Paste a timestamp, or select Use current time. Leave the unit on Auto, or choose seconds or milliseconds.", "Read the date in ISO 8601, UTC and your own time zone, plus how long ago or from now it is.", "To go the other way, type a date such as 2023-11-14 22:13:20 and choose whether it is in UTC or your local time."],
    goodToKnow: ["Auto treats numbers of 100,000,000,000 or more as milliseconds. Choose a unit yourself if you need to override that.", "Dates must be written as YYYY-MM-DD, optionally with HH:MM:SS and a time zone such as Z or +05:30.", "“Your time zone” comes from your device settings, so it may differ from someone else’s."],
  },
  {
    slug: "http-status-codes",
    name: "HTTP Status Code Reference",
    category: "Web development",
    icon: Globe,
    summary: "Look up what any HTTP status code means.",
    keywords: ["404", "500", "301", "error codes", "response codes", "rest api"],
    seoTitle: "HTTP Status Code Reference",
    seoDescription:
      "Search a reference of HTTP status codes from 1xx to 5xx with short plain-language explanations of what each one means.",
    about:
      "Every HTTP response starts with a three-digit status code. The first digit tells you the kind of result: information, success, redirection, a problem with the request, or a problem on the server. This page lists the codes in common use with a short explanation of each.",
    howTo: ["Type a code, name or word such as 404, redirect or timeout in the search box.", "Use the class buttons to show only 2xx, 3xx, 4xx or 5xx codes.", "Read the short description under each code."],
    goodToKnow: ["Descriptions are short summaries, not the full specification. See the HTTP standards (RFC 9110) for exact rules.", "Some codes, such as 418, are jokes or are used only in specific protocols like WebDAV.", "How a code is used in practice can vary between APIs, so check the documentation of the service you call."],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    category: "Web development",
    icon: KeyRound,
    summary: "Read a JWT’s header and payload. Decoding only: it does not verify signatures.",
    keywords: ["json web token", "bearer", "claims", "auth", "token"],
    seoTitle: "JWT Decoder",
    seoDescription:
      "Decode a JSON Web Token to read its header and payload, including expiry times. Decoding only: signatures are not verified. Runs in your browser.",
    about:
      "A JSON Web Token has three parts separated by dots: a header, a payload of claims, and a signature. The first two are just encoded text, so anyone can read them. This tool decodes them and explains the time-based claims.",
    howTo: ["Paste a token. A leading “Bearer ” is fine.", "Read the header, the payload and the claims such as when it expires.", "Remember that this only reads the token: it cannot tell you whether the token is genuine."],
    goodToKnow: ["This tool does not verify the signature. A token that decodes correctly can still be forged or tampered with. Only a server holding the right key can verify it.", "Never trust the contents of a token you haven’t verified when making security decisions.", "Nothing is sent anywhere, but treat live tokens like passwords: prefer expired or test tokens when you can."],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    category: "Text",
    icon: Regex,
    summary: "Test regular expressions with live match highlighting and replacement.",
    keywords: ["regular expression", "regexp", "pattern", "match", "replace", "javascript"],
    seoTitle: "Regex Tester",
    seoDescription:
      "Test JavaScript regular expressions online with live match highlighting, capture groups, flags and replacement. Runs in your browser.",
    about:
      "A regular expression is a compact pattern for finding text. Type a pattern and some test text, and every match is highlighted immediately, with its position and capture groups listed below. You can also preview a replacement.",
    howTo: ["Enter a pattern and choose flags such as g (all matches) or i (ignore case).", "Type or paste the text to search, or select Load sample.", "Read the highlighted matches and groups. Optionally enter a replacement to preview the result."],
    goodToKnow: ["This uses JavaScript’s regular expression engine. Other languages can behave differently.", "Some patterns can be extremely slow on certain text and may freeze this tab for a while. Test text is limited to 200,000 characters and matches to 1,000.", "In a replacement, $1 is the first group, $& is the whole match, and $$ is a literal dollar sign."],
  },
  {
    slug: "markdown-editor",
    name: "Markdown Editor",
    category: "Text",
    icon: FileText,
    summary: "Write Markdown and see a safe live preview.",
    keywords: ["md", "preview", "editor", "readme", "formatting"],
    seoTitle: "Markdown Editor with Live Preview",
    seoDescription:
      "Write Markdown and see a live preview. Raw HTML is shown as text and images aren’t loaded, so previews are safe. Runs in your browser.",
    about:
      "Markdown is a simple way to write formatted text, such as headings, lists, bold text and links, using plain characters. Type on the left and the preview updates on the right.",
    howTo: ["Type or paste Markdown, or select Load sample.", "Check the preview. It updates as you type.", "Copy the generated HTML or download your Markdown as a .md file."],
    goodToKnow: ["Supported: headings, bold, italic, strikethrough, inline code, code blocks, links, bullet and numbered lists, quotes and horizontal rules. Tables and nested lists aren’t supported.", "Any HTML you type is shown as text, never run. Only http, https and mailto links are made clickable, and images are not loaded.", "Links open in a new tab and are marked nofollow."],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    category: "Text",
    icon: CaseSensitive,
    summary: "Convert text to upper, lower, title, sentence, camel, snake, kebab and more.",
    keywords: ["uppercase", "lowercase", "titlecase", "camelcase", "snake_case", "kebab-case", "pascal"],
    seoTitle: "Case Converter",
    seoDescription:
      "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case and more. Runs in your browser.",
    about:
      "Different situations need different capitalization: headlines, sentences, and the naming styles programmers use for variables and files. Paste your text and choose a style to convert it instantly.",
    howTo: ["Type or paste your text, or select Load sample.", "Choose a case style.", "Copy the result."],
    goodToKnow: ["Programming styles such as camelCase and snake_case are applied to each line separately, so you can convert a whole list at once.", "Existing camelCase and acronyms are split into words first, so userID becomes user_id.", "Title Case capitalizes every word and doesn’t apply publishing rules for small words like “of” or “the”."],
  },
  {
    slug: "word-counter",
    name: "Word & Character Counter",
    category: "Text",
    icon: Type,
    summary: "Count words, characters, sentences, lines and paragraphs as you type.",
    keywords: ["character count", "sentence count", "reading time", "length", "text statistics"],
    seoTitle: "Word & Character Counter",
    seoDescription:
      "Count words, characters with and without spaces, sentences, lines and paragraphs, and get a reading-time estimate. Updates live in your browser.",
    about:
      "Paste or type text to see its length measured several ways. The numbers update as you type, which helps with limits such as meta descriptions, social posts or essay requirements.",
    howTo: ["Type or paste your text into the box, or select Load sample.", "Read the counts, which update immediately.", "Use Copy text or Copy stats to take the result with you."],
    goodToKnow: ["Words are separated by spaces or line breaks. Languages written without spaces, such as Chinese and Japanese, are better measured by character count.", "Characters are counted as you see them, so an emoji counts as one. Sentences are an estimate based on . ! and ? and can be off around abbreviations.", "Reading time is an estimate based on about 238 words per minute. Real reading speed varies."],
  },
  {
    slug: "text-diff",
    name: "Text Diff Checker",
    category: "Text",
    icon: GitCompare,
    summary: "Compare two texts, in a single list or side by side, with changes highlighted.",
    keywords: ["compare", "difference", "changes", "side by side", "merge"],
    seoTitle: "Text Diff Checker",
    seoDescription:
      "Compare two pieces of text line by line, in a unified or side-by-side view, with the changed words highlighted. Runs in your browser.",
    about:
      "A diff shows the differences between two versions of a text. This tool compares the two boxes line by line, then lists every line as added, removed or unchanged, with line numbers from both versions. In side-by-side view, the part of each line that changed is highlighted.",
    howTo: ["Paste the original text on the left and the changed text on the right, or select Load sample.", "Select Compare.", "Read the result in a single list or side by side. Use Swap to compare in the other direction."],
    goodToKnow: ["The comparison works on whole lines. In side-by-side view the changed part of each paired line is also highlighted.", "Line endings (Windows or Unix) and one final newline are ignored.", "Very large texts are refused with a message rather than freezing your browser."],
  },
  {
    slug: "color-converter",
    name: "HEX, RGB & HSL Color Converter",
    category: "Design",
    icon: Palette,
    summary: "Convert colors between HEX, RGB and HSL, with transparency.",
    keywords: ["hex", "rgb", "hsl", "rgba", "colour", "picker"],
    seoTitle: "HEX, RGB and HSL Color Converter",
    seoDescription:
      "Convert colors between HEX, RGB and HSL, including transparency, with a live preview and a color picker. Runs in your browser.",
    about:
      "Designers and developers write the same color in different ways. Enter a color in any of the three formats, or pick one, and see it in all of them, ready to copy into your CSS.",
    howTo: ["Type a color such as #111111, rgb(17, 17, 17) or hsl(0, 0%, 7%), or use the color picker.", "Check the preview swatch.", "Copy the format you need."],
    goodToKnow: ["Short HEX forms like #fff and forms with transparency like #ff000080 are accepted.", "Values outside the allowed range are adjusted to the nearest valid value, as CSS does.", "HSL values are rounded to whole numbers, so converting back and forth can change a value by one."],
  },
  {
    slug: "gradient-generator",
    name: "CSS Gradient Generator",
    category: "Design",
    icon: Layers,
    summary: "Build linear, radial and conic gradients and copy the CSS.",
    keywords: ["linear-gradient", "radial-gradient", "background", "css", "colors"],
    seoTitle: "CSS Gradient Generator",
    seoDescription:
      "Create CSS linear, radial and conic gradients with up to six color stops, a live preview and copy-ready code. Runs in your browser.",
    about:
      "A CSS gradient fades smoothly between colors. Choose the type, angle and colors, and the preview and the CSS code update as you go.",
    howTo: ["Pick a gradient type and, for linear and conic gradients, an angle.", "Choose colors and positions for each stop. Add or remove stops as needed.", "Copy the CSS."],
    goodToKnow: ["Positions are percentages along the gradient line, and stops are written in order of position.", "Gradients are supported by every modern browser. Very old browsers may need a solid-color fallback.", "The output only contains values the tool generated, so it is safe to paste into your stylesheet."],
  },
  {
    slug: "box-shadow-generator",
    name: "CSS Box Shadow Generator",
    category: "Design",
    icon: Box,
    summary: "Design layered box shadows with sliders and copy the CSS.",
    keywords: ["shadow", "drop shadow", "elevation", "inset", "css"],
    seoTitle: "CSS Box Shadow Generator",
    seoDescription:
      "Create CSS box shadows with sliders for offset, blur, spread, color and opacity, with layers and inset shadows. Runs in your browser.",
    about:
      "A box shadow adds depth to an element. Adjust the sliders to change the offset, blur, size and color, stack several layers for a softer effect, and copy the finished CSS.",
    howTo: ["Adjust the sliders for the selected layer.", "Add layers for richer shadows, or tick Inset for an inner shadow.", "Copy the CSS."],
    goodToKnow: ["Subtle shadows with low opacity usually look the most natural.", "Large blur values on big elements can slow rendering on low-end devices.", "A shadow doesn’t change an element’s size or affect the layout around it."],
  },
  {
    slug: "border-radius-generator",
    name: "CSS Border Radius Generator",
    category: "Design",
    icon: Square,
    summary: "Round each corner independently, including elliptical corners, and copy the CSS.",
    keywords: ["rounded corners", "corner", "pill", "circle", "css"],
    seoTitle: "CSS Border Radius Generator",
    seoDescription:
      "Create CSS border-radius values with independent corners, px or percent units and elliptical corners, with a live preview. Runs in your browser.",
    about:
      "The border-radius property rounds the corners of an element. Set each corner on its own, link them together, or use separate vertical radii for elliptical shapes, and copy the shortest valid CSS.",
    howTo: ["Choose px or percent and move the sliders. Tick Link corners to change all four together.", "Tick Separate vertical radii for elliptical corners.", "Copy the CSS."],
    goodToKnow: ["The corners are ordered top-left, top-right, bottom-right, bottom-left, as in CSS.", "50% on a square element makes a circle.", "The tool writes the shortest equivalent form, such as 8px instead of 8px 8px 8px 8px."],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "Generators",
    icon: Lock,
    summary: "Generate strong random passwords with your browser’s secure random generator.",
    keywords: ["random password", "secure", "strong", "passphrase", "credentials"],
    seoTitle: "Password Generator",
    seoDescription:
      "Generate strong random passwords in your browser using the cryptographically secure random number generator. Passwords are never stored or sent.",
    about:
      "A good password is long and unpredictable. This tool builds one from random characters chosen with your browser’s cryptographically secure random number generator, so it can’t be guessed or reproduced by anyone else.",
    howTo: ["Set the length and choose which kinds of characters to include.", "Select Generate. Select it again for a new password.", "Copy the password straight into your password manager."],
    goodToKnow: ["Passwords are created on your device, are not stored, and are not sent anywhere.", "The strength figure is an estimate that assumes every character is picked at random from the pool shown. It is not a guarantee.", "Use a password manager so you don’t have to remember or reuse passwords."],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    category: "Generators",
    icon: Fingerprint,
    summary: "Generate random version 4 or time-ordered version 7 UUIDs in bulk.",
    keywords: ["guid", "unique id", "identifier", "v4", "v7"],
    seoTitle: "UUID Generator",
    seoDescription:
      "Generate UUID version 4 (random) or version 7 (time-ordered) identifiers in bulk, with uppercase and no-hyphen options. Runs in your browser.",
    about:
      "A UUID is a 128-bit identifier that is practically unique without needing a central registry. Version 4 is entirely random. Version 7 starts with a timestamp, so values created later sort after earlier ones, which suits database keys.",
    howTo: ["Choose version 4 or 7 and how many you need (up to 1,000).", "Optionally switch to uppercase or remove the hyphens.", "Select Generate, then copy or download the list."],
    goodToKnow: ["Random bits come from your browser’s secure random generator.", "Version 7 UUIDs created within the same millisecond are not guaranteed to be in order.", "A UUID is an identifier, not a secret. Don’t use it as a password or access token."],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    category: "Generators",
    icon: AlignLeft,
    summary: "Generate placeholder text by paragraphs, sentences or words.",
    keywords: ["placeholder", "dummy text", "filler", "lipsum", "latin"],
    seoTitle: "Lorem Ipsum Generator",
    seoDescription:
      "Generate lorem ipsum placeholder text by paragraphs, sentences or words, optionally starting with the classic opening line. Runs in your browser.",
    about:
      "Lorem ipsum is dummy text designers use to fill a layout before the real writing is ready. Choose how much you need and copy it into your design.",
    howTo: ["Choose paragraphs, sentences or words, and a number.", "Optionally keep the classic “Lorem ipsum dolor sit amet” opening.", "Select Generate, then copy or download."],
    goodToKnow: ["The text is random each time, so every result is different.", "Limits are 100 paragraphs, 500 sentences or 5,000 words per click.", "Placeholder text can hide layout problems that real text would show, so test with real content before launch."],
  },
  {
    slug: "random-number",
    name: "Random Number Generator",
    category: "Generators",
    icon: Shuffle,
    summary: "Generate random integers or decimals between any bounds, with no repeats if you like.",
    keywords: ["dice", "lottery", "random integer", "range", "pick"],
    seoTitle: "Random Number Generator",
    seoDescription:
      "Generate random whole numbers or decimals between your own bounds using the secure random generator, with unique-only and sorting options.",
    about:
      "Pick a minimum and maximum, how many numbers you want, and whether repeats are allowed. Numbers come from your browser’s cryptographically secure random generator and are chosen without bias.",
    howTo: ["Enter the minimum and maximum, and how many numbers you want.", "Choose whole numbers or decimals, and optionally unique values and sorting.", "Select Generate, then copy the list."],
    goodToKnow: ["Both bounds are included. Whole-number bounds can be as large as ±9,007,199,254,740,991.", "With Unique selected, you can’t ask for more numbers than exist in the range.", "This is fine for everyday choices but isn’t certified for gambling or official draws."],
  },
];

export function findTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getTool(slug: string): Tool {
  const tool = findTool(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export const toolPath = (tool: Tool) => `/tools/${tool.slug}`;

export const toolsInCategory = (category: ToolCategory) => tools.filter((t) => t.category === category);
