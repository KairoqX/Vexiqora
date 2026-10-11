// Cryptographically secure random numbers. These use the browser's crypto.getRandomValues,
// never Math.random, and avoid "modulo bias" by rejecting values that would favour small results.

function randomUint32(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0];
}

/** A random integer from 0 up to (but not including) maxExclusive. maxExclusive must be 1 to 2^32. */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 2 ** 32) {
    throw new RangeError("maxExclusive must be an integer from 1 to 4294967296.");
  }
  if (maxExclusive === 1) return 0;
  // Throw away the few values at the top that would make some results more likely than others.
  const limit = 2 ** 32 - (2 ** 32 % maxExclusive);
  let value = randomUint32();
  while (value >= limit) value = randomUint32();
  return value % maxExclusive;
}

/** A random 53-bit number as a fraction from 0 (included) to 1 (excluded). */
export function secureRandomFloat(): number {
  const high = randomUint32() >>> 11; // 21 bits
  const low = randomUint32(); // 32 bits
  return (high * 2 ** 32 + low) / 2 ** 53;
}

/** A random whole number from min to max, both included. The range may be up to 2^53 wide. */
export function secureRandomRange(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new RangeError("Minimum and maximum must be whole numbers within ±9,007,199,254,740,991.");
  }
  if (min > max) throw new RangeError("The minimum can’t be larger than the maximum.");
  const range = max - min + 1;
  if (range > 2 ** 53) throw new RangeError("The range between minimum and maximum is too large.");
  if (range <= 2 ** 32) return min + secureRandomInt(range);

  const limit = Math.floor(2 ** 53 / range) * range;
  let value = (randomUint32() >>> 11) * 2 ** 32 + randomUint32();
  while (value >= limit) value = (randomUint32() >>> 11) * 2 ** 32 + randomUint32();
  return min + (value % range);
}

/** Shuffles a list in place using the Fisher–Yates method with secure randomness. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
