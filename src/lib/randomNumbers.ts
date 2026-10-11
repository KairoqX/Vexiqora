// Random number generation for the Random Number Generator tool, built on secure randomness.
import { secureRandomFloat, secureRandomInt, secureRandomRange } from "./random";

export interface RandomNumberOptions {
  min: number;
  max: number;
  count: number;
  kind: "integer" | "decimal";
  /** Decimal places, for decimal numbers. */
  decimals: number;
  unique: boolean;
  sort: "none" | "asc" | "desc";
}

export const MAX_COUNT = 1000;
/** Below this many possible values, unique numbers are drawn by shuffling the whole range. */
const SHUFFLE_LIMIT = 100_000;

export type RandomNumbersResult = { ok: true; values: string[] } | { ok: false; error: string };

export function generateRandomNumbers(o: RandomNumberOptions): RandomNumbersResult {
  if (!Number.isFinite(o.min) || !Number.isFinite(o.max)) return { ok: false, error: "Enter a number for both the minimum and the maximum." };
  if (o.min > o.max) return { ok: false, error: "The minimum can’t be larger than the maximum." };
  if (!Number.isInteger(o.count) || o.count < 1 || o.count > MAX_COUNT) return { ok: false, error: `Ask for a whole number of results from 1 to ${MAX_COUNT}.` };

  let numbers: number[] = [];
  let formatted: string[];

  if (o.kind === "integer") {
    if (!Number.isSafeInteger(o.min) || !Number.isSafeInteger(o.max)) {
      return { ok: false, error: "For whole numbers, both bounds must be whole numbers within ±9,007,199,254,740,991." };
    }
    const range = o.max - o.min + 1;
    if (range > 2 ** 53) return { ok: false, error: "The range between the minimum and maximum is too large." };
    if (o.unique && o.count > range) {
      return { ok: false, error: `You asked for ${o.count} unique numbers, but only ${range.toLocaleString("en-US")} exist between ${o.min} and ${o.max}.` };
    }

    if (!o.unique) {
      numbers = Array.from({ length: o.count }, () => secureRandomRange(o.min, o.max));
    } else if (range <= SHUFFLE_LIMIT) {
      // Pick from the whole range without repeats (a partial Fisher–Yates shuffle).
      const pool = Array.from({ length: range }, (_, i) => o.min + i);
      for (let i = 0; i < o.count; i++) {
        const j = i + secureRandomInt(range - i);
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      numbers = pool.slice(0, o.count);
    } else {
      const seen = new Set<number>(); // the range is huge, so repeats are rare and simply redrawn
      while (seen.size < o.count) seen.add(secureRandomRange(o.min, o.max));
      numbers = [...seen];
    }
    formatted = numbers.map(String);
  } else {
    if (!Number.isInteger(o.decimals) || o.decimals < 0 || o.decimals > 10) return { ok: false, error: "Decimal places must be a whole number from 0 to 10." };
    const space = Math.floor((o.max - o.min) * 10 ** o.decimals) + 1;
    if (o.unique && o.count > space) return { ok: false, error: `Only about ${space.toLocaleString("en-US")} different values exist at ${o.decimals} decimal places in that range.` };

    const draw = () => Number((o.min + secureRandomFloat() * (o.max - o.min)).toFixed(o.decimals));
    if (o.unique) {
      const seen = new Set<number>();
      let attempts = 0;
      while (seen.size < o.count && attempts++ < o.count * 200) seen.add(draw());
      if (seen.size < o.count) return { ok: false, error: "Couldn’t find enough unique values. Widen the range or add decimal places." };
      numbers = [...seen];
    } else {
      numbers = Array.from({ length: o.count }, draw);
    }
    formatted = numbers.map((n) => n.toFixed(o.decimals));
  }

  if (o.sort !== "none") {
    const order = numbers.map((n, i) => ({ n, text: formatted[i] }));
    order.sort((a, b) => (o.sort === "asc" ? a.n - b.n : b.n - a.n));
    formatted = order.map((x) => x.text);
  }
  return { ok: true, values: formatted };
}
