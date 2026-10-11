// A small, safe Markdown renderer.
//
// Safety design: every piece of the user's text is HTML-escaped BEFORE any formatting is applied,
// and the only tags this file ever produces are the fixed ones listed below. Raw HTML typed by the
// user is therefore shown as text, never run. Links are limited to http, https, mailto, "#" and "/"
// addresses, and images are not loaded at all (they could track the reader or leak their address).
//
// Supported: headings, paragraphs, **bold**, *italic*, ~~strikethrough~~, `code`, fenced code blocks,
// links, bullet and numbered lists, blockquotes and horizontal rules.

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const unescapeBasic = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** Returns the URL if it is safe to link to, otherwise null. */
export function safeUrl(url: string): string | null {
  const u = url.trim();
  if (u === "" || /[\s\u0000-\u001f\u007f]/.test(u)) return null;
  if (/^(https?:\/\/|mailto:)/i.test(u) || u.startsWith("#") || /^\/(?!\/)/.test(u)) return u;
  return null;
}

function emphasis(s: string): string {
  return s
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_\n]+?)__/g, "<strong>$1</strong>")
    .replace(/~~([^~\n]+?)~~/g, "<del>$1</del>")
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w_])_([^_\n]+?)_(?![\w_])/g, "$1<em>$2</em>");
}

function renderInline(raw: string): string {
  const codes: string[] = [];
  const links: string[] = [];

  // 1. Code spans first, so nothing inside them is formatted.
  let s = raw.replace(/`([^`\n]+)`/g, (_m, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // 2. Escape everything else.
  s = escapeHtml(s);

  // 3. Images are replaced by their description in brackets; nothing is ever fetched.
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string) => `[image: ${alt}]`);

  // 4. Links. The address is checked, then escaped again for use inside the attribute.
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, text: string, url: string) => {
    const safe = safeUrl(unescapeBasic(url));
    if (!safe) return match; // unsafe links stay as plain text
    links.push(`<a href="${escapeHtml(safe)}" rel="noopener noreferrer nofollow" target="_blank">${emphasis(text)}</a>`);
    return `\u0001${links.length - 1}\u0001`;
  });

  // 5. Bold, italic and strikethrough on what remains.
  s = emphasis(s);

  // 6. Put links and code back (links first, because their text can contain code).
  s = s.replace(/\u0001(\d+)\u0001/g, (_m, i: string) => links[Number(i)]);
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codes[Number(i)]);
}

const FENCE = /^```\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;

const startsBlock = (line: string) =>
  FENCE.test(line) || HEADING.test(line) || RULE.test(line) || BULLET.test(line) || NUMBERED.test(line) || QUOTE.test(line);

export function renderMarkdown(source: string, depth = 0): string {
  const lines = source.replace(/[\u0000\u0001]/g, "").replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // skip the closing fence (or the end of the text)
      const language = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : "";
      out.push(`<pre><code${language}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      out.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`);
      i++;
      continue;
    }

    if (RULE.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) inner.push((lines[i++].match(QUOTE) as RegExpMatchArray)[1]);
      // Nesting is capped so deeply nested quotes can't cause trouble.
      out.push(`<blockquote>${depth < 5 ? renderMarkdown(inner.join("\n"), depth + 1) : escapeHtml(inner.join("\n"))}</blockquote>`);
      continue;
    }

    const listPattern = BULLET.test(line) ? BULLET : NUMBERED.test(line) ? NUMBERED : null;
    if (listPattern) {
      const tag = listPattern === BULLET ? "ul" : "ol";
      const items: string[] = [];
      while (i < lines.length && listPattern.test(lines[i])) {
        items.push(`<li>${renderInline((lines[i++].match(listPattern) as RegExpMatchArray)[1])}</li>`);
      }
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // Paragraph: keep going until a blank line or the start of another block.
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && (paragraph.length === 0 || !startsBlock(lines[i]))) {
      paragraph.push(lines[i++]);
    }
    const html = paragraph
      .map((l, index) => renderInline(l.replace(/\s+$/, "")) + (/ {2,}$/.test(l) && index < paragraph.length - 1 ? "<br>" : ""))
      .join("\n");
    out.push(`<p>${html}</p>`);
  }
  return out.join("\n");
}
