// URL and HTML-entity encoding. Both work on plain text only: nothing here ever builds HTML
// or touches the page, so pasted markup can't run.

export type CodecResult = { ok: true; output: string } | { ok: false; error: string };

// ---------- URL encoding ----------
export type UrlEncodeMode = "component" | "full";

export function encodeUrl(text: string, mode: UrlEncodeMode): CodecResult {
  try {
    return { ok: true, output: mode === "component" ? encodeURIComponent(text) : encodeURI(text) };
  } catch {
    return { ok: false, error: "The text contains a broken emoji or character pair that can’t be encoded." };
  }
}

export function decodeUrl(text: string, plusAsSpace: boolean): CodecResult {
  try {
    return { ok: true, output: decodeURIComponent(plusAsSpace ? text.replace(/\+/g, " ") : text) };
  } catch {
    return {
      ok: false,
      error: "This isn’t valid percent-encoding. Each % must be followed by two hex digits, and the bytes must form valid UTF-8 text.",
    };
  }
}

// ---------- HTML entities ----------
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0",
  copy: "©", reg: "®", trade: "™", hellip: "…", mdash: "—", ndash: "–",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", laquo: "«", raquo: "»",
  bull: "•", middot: "·", euro: "€", pound: "£", yen: "¥", cent: "¢",
  sect: "§", deg: "°", plusmn: "±", times: "×", divide: "÷", micro: "µ",
  para: "¶", larr: "←", rarr: "→", uarr: "↑", darr: "↓", hearts: "♥",
  frac12: "½", frac14: "¼", frac34: "¾", infin: "∞", ne: "≠", le: "≤", ge: "≥",
};

export function encodeHtmlEntities(text: string, nonAscii = false): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  if (!nonAscii) return escaped;
  return escaped.replace(/[^\x00-\x7F]/gu, (char) => `&#${char.codePointAt(0)};`);
}

function fromCodePoint(code: number): string {
  // Zero, surrogates and values beyond Unicode become the replacement character, as browsers do.
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) return "\uFFFD";
  return String.fromCodePoint(code);
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const hex = body[1] === "x" || body[1] === "X";
      return fromCodePoint(parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return NAMED_ENTITIES[body] ?? match; // unknown names are left exactly as typed
  });
}
