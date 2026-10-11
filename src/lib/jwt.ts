// JWT decoding. This only READS the token. It does not, and cannot, check that the token is
// genuine: verifying needs the secret or public key, which this site never asks for.
import { decodeBase64 } from "./base64";
import { formatRelative } from "./timestamp";

export interface JwtClaim {
  label: string;
  value: string;
}

export type JwtResult =
  | {
      ok: true;
      headerJson: string;
      payloadJson: string;
      signature: string;
      claims: JwtClaim[];
      warnings: string[];
    }
  | { ok: false; error: string };

function decodePart(name: "header" | "payload", part: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (part === "") return { ok: false, error: `The ${name} section is empty.` };
  const decoded = decodeBase64(part);
  if (!decoded.ok) return { ok: false, error: `The ${name} section isn’t valid Base64URL text.` };
  let value: unknown;
  try {
    value = JSON.parse(decoded.output);
  } catch {
    return { ok: false, error: `The ${name} section decoded, but it isn’t valid JSON.` };
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: `The ${name} section must be a JSON object.` };
  }
  return { ok: true, value: value as Record<string, unknown> };
}

function timeClaim(label: string, key: string, payload: Record<string, unknown>, now: Date, verdict: (d: Date) => string, warnings: string[]): JwtClaim | null {
  if (!(key in payload)) return null;
  const raw = payload[key];
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    warnings.push(`The “${key}” claim should be a number of seconds, but it isn’t.`);
    return null;
  }
  const date = new Date(raw * 1000);
  if (Number.isNaN(date.getTime())) {
    warnings.push(`The “${key}” claim is outside the range of valid dates.`);
    return null;
  }
  return { label, value: `${date.toISOString()} (${formatRelative(date, now)}) – ${verdict(date)}` };
}

export function decodeJwt(input: string, now: Date = new Date()): JwtResult {
  const token = input.trim().replace(/^Bearer\s+/i, "").replace(/\s+/g, "");
  if (token === "") return { ok: false, error: "Paste a JWT into the input box first." };

  const parts = token.split(".");
  if (parts.length === 5) return { ok: false, error: "This looks like an encrypted token (JWE) with five parts. This tool only reads standard signed tokens with three." };
  if (parts.length !== 3) return { ok: false, error: `A JWT has three parts separated by dots, but this has ${parts.length}.` };

  const header = decodePart("header", parts[0]);
  if (!header.ok) return header;
  const payload = decodePart("payload", parts[1]);
  if (!payload.ok) return payload;

  const warnings: string[] = [];
  if (typeof header.value.alg === "string" && header.value.alg.toLowerCase() === "none") {
    warnings.push("This token uses the “none” algorithm, which means it has no signature at all. Never trust a token like this for access decisions.");
  } else if (parts[2] === "") {
    warnings.push("The signature part is empty, so this token is unsigned.");
  }

  const claims = [
    timeClaim("Issued at (iat)", "iat", payload.value, now, (d) => (d > now ? "in the future" : "in the past"), warnings),
    timeClaim("Not before (nbf)", "nbf", payload.value, now, (d) => (d > now ? "not valid yet" : "already valid"), warnings),
    timeClaim("Expires (exp)", "exp", payload.value, now, (d) => (d > now ? "not expired yet" : "expired"), warnings),
  ].filter((c): c is JwtClaim => c !== null);

  return {
    ok: true,
    headerJson: JSON.stringify(header.value, null, 2),
    payloadJson: JSON.stringify(payload.value, null, 2),
    signature: parts[2],
    claims,
    warnings,
  };
}
