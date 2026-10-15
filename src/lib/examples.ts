// One worked example per tool, shown on each tool's page.
// tests/lib.test.ts runs the real tool logic on every example, so these can't drift from reality.

import { samples } from "./samples";

export interface ToolExample {
  description: string;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
}

export const examples: Record<string, ToolExample> = {
  "json-formatter": {
    description:
      "Paste compact JSON, choose Format with 2 spaces of indent, and it becomes easy to read. A common mistake is a trailing comma, as in {\"a\": 1,}. Validate points to where the parser stopped.",
    inputLabel: "Input",
    input: '{"name":"Vexiqora","free":true,"tools":["json","diff","base64"]}',
    outputLabel: "Formatted output",
    output: '{\n  "name": "Vexiqora",\n  "free": true,\n  "tools": [\n    "json",\n    "diff",\n    "base64"\n  ]\n}',
  },
  "text-diff": {
    description:
      "Compare a short list before and after an edit. “banana” was replaced, and “date” was added at the end. Lines marked − were removed, and lines marked + were added.",
    inputLabel: "Input",
    input: "Original:\napple\nbanana\ncherry\n\nChanged:\napple\nblueberry\ncherry\ndate",
    outputLabel: "Result",
    output: "  apple\n− banana\n+ blueberry\n  cherry\n+ date",
  },
  base64: {
    description:
      "Encoding turns text, including emoji, into Base64. Switch to Decode and paste the output back in to get the original text.",
    inputLabel: "Text to encode",
    input: "Hello, Vexiqora! 👋",
    outputLabel: "Base64 output",
    output: "SGVsbG8sIFZleGlxb3JhISDwn5GL",
  },
  "word-counter": {
    description: "Paste or type two short sentences and the counts appear straight away.",
    inputLabel: "Your text",
    input: "Vexiqora runs in your browser.\nNothing you paste is uploaded.",
    outputLabel: "Counts",
    output:
      "Words: 10\nCharacters: 61\nCharacters (no spaces): 52\nSentences: 2\nLines: 2\nParagraphs: 1\nReading time (estimate): About 3 sec",
  },

  "json-minifier": {
    description: "Formatted JSON becomes one compact line. The values are identical; only spacing outside the values is removed.",
    inputLabel: "Input",
    input: "{\n  \"name\": \"Vexiqora\",\n  \"tags\": [\"json\", \"tools\"],\n  \"free\": true\n}",
    outputLabel: "Minified output",
    output: "{\"name\":\"Vexiqora\",\"tags\":[\"json\",\"tools\"],\"free\":true}",
  },
  "json-csv": {
    description: "An array of JSON objects becomes a CSV table. The value that contains a comma is wrapped in quotes automatically.",
    inputLabel: "JSON",
    input: "[{\"name\":\"Ada\",\"city\":\"London\"},{\"name\":\"Grace, Hopper\",\"city\":\"New York\"}]",
    outputLabel: "CSV",
    output: "name,city\nAda,London\n\"Grace, Hopper\",New York",
  },
  "url-encoder": {
    description: "Encoding a value for a query string turns spaces, & and ? into percent codes, and non-English text into its UTF-8 bytes.",
    inputLabel: "Text (Component mode)",
    input: "cats & dogs? 日本語",
    outputLabel: "Encoded",
    output: "cats%20%26%20dogs%3F%20%E6%97%A5%E6%9C%AC%E8%AA%9E",
  },
  "html-entities": {
    description: "Encoding makes markup safe to show as text: the angle brackets, ampersand and quotes are replaced by entities.",
    inputLabel: "Input",
    input: "<a href=\"x\">Tom & Jerry</a>",
    outputLabel: "Encoded",
    output: "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;",
  },
  "timestamp-converter": {
    description: "The timestamp 1700000000 is a count of seconds. Auto-detect reads it as seconds and shows the moment it refers to. (Your own time zone and the relative time are shown on the page too.)",
    inputLabel: "Timestamp",
    input: "1700000000",
    outputLabel: "Result",
    output: "ISO 8601 (UTC): 2023-11-14T22:13:20.000Z\nUTC: Tue, 14 Nov 2023 22:13:20 GMT\nUnix seconds: 1700000000\nUnix milliseconds: 1700000000000",
  },
  "jwt-decoder": {
    description: "A token made up for this example. Its two readable parts decode to JSON. The signature is a placeholder, and this tool never checks it.",
    inputLabel: "Token",
    input: samples.jwt,
    outputLabel: "Header, then payload",
    output: "{\n  \"alg\": \"HS256\",\n  \"typ\": \"JWT\"\n}\n\n{\n  \"sub\": \"1234567890\",\n  \"name\": \"Jane Doe\",\n  \"iat\": 1700000000,\n  \"exp\": 1700003600\n}",
  },
  "regex-tester": {
    description: "The pattern finds an address and captures the part before and after the @ sign. With the g flag, every match is listed with its position and groups.",
    inputLabel: "Pattern and text",
    input: "Pattern: (\\w+)@(\\w+)\\.com\nText: mail ada@site.com or bob@corp.com",
    outputLabel: "Matches",
    output: "Match 1 at 5: ada@site.com (groups: ada, site)\nMatch 2 at 21: bob@corp.com (groups: bob, corp)",
  },
  "markdown-editor": {
    description: "Markdown becomes HTML. This is the HTML the preview shows, and the Copy HTML button copies it.",
    inputLabel: "Markdown",
    input: "# Title\n\nSome **bold** text.",
    outputLabel: "HTML",
    output: "<h1>Title</h1>\n<p>Some <strong>bold</strong> text.</p>",
  },
  "case-converter": {
    description: "One line of text in three programming and writing styles.",
    inputLabel: "Input",
    input: "the quick brown fox",
    outputLabel: "Results",
    output: "camelCase: theQuickBrownFox\nsnake_case: the_quick_brown_fox\nTitle Case: The Quick Brown Fox",
  },
  "color-converter": {
    description: "The near-black used for text on this site, shown in the other two formats.",
    inputLabel: "Input",
    input: "#111111",
    outputLabel: "Results",
    output: "rgb(17, 17, 17)\nhsl(0, 0%, 7%)",
  },
  "gradient-generator": {
    description: "A left-to-right (90°) linear gradient from near-black to light grey, written as ready-to-paste CSS.",
    inputLabel: "Settings",
    input: "Type: linear\nAngle: 90\nStop 1: #111111 at 0%\nStop 2: #e5e5e5 at 100%",
    outputLabel: "CSS",
    output: "background: linear-gradient(90deg, #111111 0%, #e5e5e5 100%);",
  },
  "box-shadow-generator": {
    description: "A soft, low-opacity shadow, which is a good starting point for cards.",
    inputLabel: "Settings",
    input: "Offset X: 0\nOffset Y: 4\nBlur: 12\nSpread: 0\nColor: black at 20% opacity",
    outputLabel: "CSS",
    output: "box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);",
  },
  "border-radius-generator": {
    description: "Opposite corners share a value, so the tool writes the shortest form: two values instead of four.",
    inputLabel: "Settings (px)",
    input: "Top left: 8\nTop right: 16\nBottom right: 8\nBottom left: 16",
    outputLabel: "CSS",
    output: "border-radius: 8px 16px;",
  },
};
