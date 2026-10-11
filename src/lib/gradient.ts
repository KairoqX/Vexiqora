// CSS gradient generator. Colors are parsed and re-written by our own code, so the output
// can only ever contain valid color values, never text from the user's input.
import { parseColor, toHex } from "./color";

export type GradientType = "linear" | "radial" | "conic";
export interface GradientStop {
  color: string;
  position: number; // percent
}
export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

export const MIN_STOPS = 2;
export const MAX_STOPS = 6;

export type GradientResult = { ok: true; value: string; css: string } | { ok: false; error: string };

export function gradientCss({ type, angle, stops }: GradientConfig): GradientResult {
  if (stops.length < MIN_STOPS) return { ok: false, error: `A gradient needs at least ${MIN_STOPS} color stops.` };
  if (stops.length > MAX_STOPS) return { ok: false, error: `Use at most ${MAX_STOPS} color stops.` };
  if (!Number.isFinite(angle)) return { ok: false, error: "The angle must be a number." };

  const parts: { hex: string; position: number }[] = [];
  for (let i = 0; i < stops.length; i++) {
    const parsed = parseColor(stops[i].color);
    if (!parsed.ok) return { ok: false, error: `Stop ${i + 1}: ${parsed.error}` };
    if (!Number.isFinite(stops[i].position)) return { ok: false, error: `Stop ${i + 1}: the position must be a number.` };
    parts.push({ hex: toHex(parsed.color), position: Math.round(Math.min(100, Math.max(0, stops[i].position))) });
  }
  parts.sort((a, b) => a.position - b.position); // stable, so equal positions keep their order

  const list = parts.map((p) => `${p.hex} ${p.position}%`).join(", ");
  const deg = ((Math.round(angle) % 360) + 360) % 360;
  const value =
    type === "linear" ? `linear-gradient(${deg}deg, ${list})`
    : type === "radial" ? `radial-gradient(circle, ${list})`
    : `conic-gradient(from ${deg}deg, ${list})`;
  return { ok: true, value, css: `background: ${value};` };
}
