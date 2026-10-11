// CSS border-radius generator. Corner order everywhere is: top-left, top-right, bottom-right, bottom-left.

export type Corners = [number, number, number, number];
export type RadiusUnit = "px" | "%";

export interface RadiusConfig {
  unit: RadiusUnit;
  horizontal: Corners;
  /** Separate vertical radii for elliptical corners, or null for round corners. */
  vertical: Corners | null;
}

/** Writes four values using the shortest valid CSS form (1, 2, 3 or 4 values). */
export function shorthand([a, b, c, d]: Corners, unit: RadiusUnit): string {
  const u = (n: number) => `${n}${unit}`;
  if (b === d) {
    if (a === c) return a === b ? u(a) : `${u(a)} ${u(b)}`;
    return `${u(a)} ${u(b)} ${u(c)}`;
  }
  return `${u(a)} ${u(b)} ${u(c)} ${u(d)}`;
}

export type RadiusResult = { ok: true; value: string; css: string } | { ok: false; error: string };

export function borderRadiusCss({ unit, horizontal, vertical }: RadiusConfig): RadiusResult {
  const all = [...horizontal, ...(vertical ?? [])];
  if (!all.every((n) => Number.isFinite(n) && n >= 0)) return { ok: false, error: "Every radius must be a number that is zero or more." };
  if (unit === "%" && all.some((n) => n > 100)) return { ok: false, error: "Percentage radii can’t be more than 100%." };

  const h = shorthand(horizontal, unit);
  const v = vertical ? shorthand(vertical, unit) : null;
  const value = v && v !== h ? `${h} / ${v}` : h;
  return { ok: true, value, css: `border-radius: ${value};` };
}
