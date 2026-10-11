// UUID generation using the browser's secure random number generator.

export type UuidVersion = "v4" | "v7";
export const MAX_UUIDS = 1000;

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function format(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Version 4: 122 random bits. */
export function uuidV4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  return format(b);
}

/** Version 7: a millisecond timestamp followed by random bits, so values sort by creation time. */
export function uuidV7(now: number = Date.now()): string {
  const b = randomBytes(16);
  b[0] = Math.floor(now / 0x10000000000) & 0xff;
  b[1] = Math.floor(now / 0x100000000) & 0xff;
  b[2] = Math.floor(now / 0x1000000) & 0xff;
  b[3] = Math.floor(now / 0x10000) & 0xff;
  b[4] = Math.floor(now / 0x100) & 0xff;
  b[5] = now & 0xff;
  b[6] = (b[6] & 0x0f) | 0x70; // version 7
  b[8] = (b[8] & 0x3f) | 0x80;
  return format(b);
}

export interface UuidOptions {
  version: UuidVersion;
  count: number;
  uppercase: boolean;
  hyphens: boolean;
}

export function generateUuids({ version, count, uppercase, hyphens }: UuidOptions): string[] {
  const n = Math.min(Math.max(1, Math.floor(count)), MAX_UUIDS);
  return Array.from({ length: n }, () => {
    let id = version === "v7" ? uuidV7() : uuidV4();
    if (!hyphens) id = id.replace(/-/g, "");
    return uppercase ? id.toUpperCase() : id;
  });
}
