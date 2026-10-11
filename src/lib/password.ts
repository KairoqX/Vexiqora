// Password generator using the browser's cryptographically secure random number generator.
import { secureRandomInt, shuffleInPlace } from "./random";

export const LOWER = "abcdefghijklmnopqrstuvwxyz";
export const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const DIGITS = "0123456789";
export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";
const AMBIGUOUS = /[Il1O0o]/g; // characters that are easy to confuse when read aloud or by eye

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export type PasswordResult =
  | { ok: true; password: string; poolSize: number; entropyBits: number }
  | { ok: false; error: string };

export function generatePassword(options: PasswordOptions): PasswordResult {
  const { length, excludeAmbiguous } = options;
  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    return { ok: false, error: `Choose a length from ${MIN_LENGTH} to ${MAX_LENGTH}.` };
  }

  const sets = [
    options.lower && LOWER,
    options.upper && UPPER,
    options.digits && DIGITS,
    options.symbols && SYMBOLS,
  ]
    .filter((set): set is string => typeof set === "string")
    .map((set) => (excludeAmbiguous ? set.replace(AMBIGUOUS, "") : set));

  if (sets.length === 0) return { ok: false, error: "Select at least one type of character." };

  const pool = sets.join("");
  // Guarantee at least one character from each selected type, then fill the rest from the whole pool.
  const chars = sets.map((set) => set[secureRandomInt(set.length)]);
  while (chars.length < length) chars.push(pool[secureRandomInt(pool.length)]);
  shuffleInPlace(chars);

  return { ok: true, password: chars.join(""), poolSize: pool.length, entropyBits: Math.round(length * Math.log2(pool.length)) };
}

/** A rough label for an entropy estimate. The numbers assume every character is chosen at random. */
export function strengthLabel(bits: number): string {
  if (bits < 40) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 80) return "Strong";
  return "Very strong";
}
