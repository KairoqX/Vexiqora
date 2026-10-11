// CSS box-shadow generator.
import { parseColor, toRgbString } from "./color";

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string; // a hex color
  opacity: number; // 0-100
  inset: boolean;
}

export const MAX_LAYERS = 4;

export const defaultLayer: ShadowLayer = { x: 0, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 20, inset: false };

export type ShadowResult = { ok: true; value: string; css: string } | { ok: false; error: string };

export function boxShadowCss(layers: ShadowLayer[]): ShadowResult {
  if (layers.length === 0) return { ok: true, value: "none", css: "box-shadow: none;" };
  if (layers.length > MAX_LAYERS) return { ok: false, error: `Use at most ${MAX_LAYERS} shadow layers.` };

  const parts: string[] = [];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    if (![l.x, l.y, l.blur, l.spread, l.opacity].every(Number.isFinite)) return { ok: false, error: `Layer ${i + 1}: every value must be a number.` };
    const color = parseColor(l.color);
    if (!color.ok) return { ok: false, error: `Layer ${i + 1}: ${color.error}` };
    const alpha = Math.min(100, Math.max(0, l.opacity)) / 100;
    const rgba = toRgbString({ ...color.color, a: alpha });
    // A blur radius can't be negative in CSS.
    parts.push(`${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${Math.max(0, l.blur)}px ${l.spread}px ${rgba}`);
  }
  const value = parts.join(",\n    ");
  return { ok: true, value, css: `box-shadow: ${value};` };
}
