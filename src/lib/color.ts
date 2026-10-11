// Colour parsing and conversion between HEX, RGB and HSL.

export interface Rgba {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-1
}
export type ColorResult = { ok: true; color: Rgba } | { ok: false; error: string };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round2 = (n: number) => Number(n.toFixed(2));

function parseNumberOrPercent(text: string, scale: number): number | null {
  const m = text.match(/^([+-]?\d*\.?\d+)(%?)$/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "%" ? (n / 100) * scale : n;
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return { h: ((h * 60) % 360 + 360) % 360, s: s * 100, l: l * 100 };
}

export function parseColor(input: string): ColorResult {
  const text = input.trim().toLowerCase();
  if (text === "") return { ok: false, error: "Enter a color, such as #1d6b57, rgb(29, 107, 87) or hsl(165, 57%, 27%)." };

  const hex = text.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = h.split("").map((c) => c + c).join("");
    return {
      ok: true,
      color: {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? round2(parseInt(h.slice(6, 8), 16) / 255) : 1,
      },
    };
  }

  const fn = text.match(/^(rgb|hsl)a?\(\s*([^)]*)\)$/);
  if (fn) {
    const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
    if (parts.length !== 3 && parts.length !== 4) return { ok: false, error: `${fn[1].toUpperCase()}() needs three values, and an optional fourth for transparency.` };
    const alpha = parts.length === 4 ? parseNumberOrPercent(parts[3], 1) : 1;
    if (alpha === null) return { ok: false, error: "The transparency value isn’t a number." };

    if (fn[1] === "rgb") {
      const [r, g, b] = parts.slice(0, 3).map((p) => parseNumberOrPercent(p, 255));
      if (r === null || g === null || b === null) return { ok: false, error: "RGB values must be numbers (0–255) or percentages." };
      return { ok: true, color: { r: Math.round(clamp(r, 0, 255)), g: Math.round(clamp(g, 0, 255)), b: Math.round(clamp(b, 0, 255)), a: round2(clamp(alpha, 0, 1)) } };
    }
    const hue = parseFloat(parts[0].replace(/deg$/, ""));
    const s = parseNumberOrPercent(parts[1], 100);
    const l = parseNumberOrPercent(parts[2], 100);
    if (Number.isNaN(hue) || !/^[+-]?\d*\.?\d+(deg)?$/.test(parts[0]) || s === null || l === null) {
      return { ok: false, error: "HSL needs a hue in degrees, then saturation and lightness as percentages." };
    }
    return { ok: true, color: { ...hslToRgb(hue, s, l), a: round2(clamp(alpha, 0, 1)) } };
  }

  return { ok: false, error: "Unrecognised color. Use a HEX value (#1d6b57), rgb(…) or hsl(…)." };
}

const hex2 = (n: number) => n.toString(16).padStart(2, "0");

/** "#rrggbb", or "#rrggbbaa" when the color is not fully opaque. */
export function toHex({ r, g, b, a }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(Math.round(a * 255)) : ""}`;
}

/** Always "#rrggbb" (needed by the browser's color picker, which has no transparency). */
export function toOpaqueHex({ r, g, b }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

export function toRgbString({ r, g, b, a }: Rgba): string {
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${round2(a)})` : `rgb(${r}, ${g}, ${b})`;
}

export function toHslString(color: Rgba): string {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
  const text = `${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%`;
  return color.a < 1 ? `hsla(${text}, ${round2(color.a)})` : `hsl(${text})`;
}
