// Unix timestamp <-> date conversion.

export type TimestampUnit = "auto" | "seconds" | "milliseconds";
export interface Row {
  label: string;
  value: string;
}
export type DateResult = { ok: true; date: Date; unit: "seconds" | "milliseconds" } | { ok: false; error: string };

/**
 * "Auto" treats numbers of 11 or more digits (>= 100,000,000,000) as milliseconds.
 * As seconds that would be the year 5138; as milliseconds it is March 1973.
 */
export const AUTO_MILLISECOND_THRESHOLD = 1e11;

export function parseTimestamp(input: string, unit: TimestampUnit): DateResult {
  const text = input.trim();
  if (text === "") return { ok: false, error: "Enter a Unix timestamp, such as 1700000000." };
  if (!/^-?\d+(\.\d+)?$/.test(text)) return { ok: false, error: "A timestamp contains only digits (and an optional minus sign or decimal point)." };

  const value = Number(text);
  const resolved = unit === "auto" ? (Math.abs(value) >= AUTO_MILLISECOND_THRESHOLD ? "milliseconds" : "seconds") : unit;
  const date = new Date(resolved === "seconds" ? Math.round(value * 1000) : Math.round(value));
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That number is outside the range of dates JavaScript can represent." };
  return { ok: true, date, unit: resolved };
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i;

/** Parses ISO-style dates such as 2023-11-14, 2023-11-14 22:13:20 or 2023-11-14T22:13:20+05:30. */
export function parseDateString(input: string, assume: "utc" | "local"): DateResult {
  const text = input.trim();
  if (text === "") return { ok: false, error: "Enter a date, such as 2023-11-14 22:13:20." };
  const m = text.match(DATE_PATTERN);
  if (!m) return { ok: false, error: "Use the format YYYY-MM-DD, optionally followed by HH:MM:SS and a time zone (Z or +05:30)." };

  const [, y, mo, d, hh = "00", mm = "00", ss = "00", frac = "0", zone] = m;
  const ms = Number(frac.padEnd(3, "0"));

  // Check each part ourselves: some browsers quietly turn "February 31" into March 3.
  const monthStart = new Date(0);
  monthStart.setUTCFullYear(Number(y), Number(mo), 0); // day 0 of the next month = last day of this month
  const daysInMonth = monthStart.getUTCDate();
  if (Number(mo) < 1 || Number(mo) > 12 || Number(d) < 1 || Number(d) > daysInMonth || Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) {
    return { ok: false, error: "That isn’t a real date or time. Check the month, day, hour and minute values." };
  }

  let date: Date;

  if (zone || assume === "utc") {
    const offset = zone ? (zone.toUpperCase() === "Z" ? "Z" : zone.includes(":") ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`) : "Z";
    date = new Date(`${y}-${mo}-${d}T${hh}:${mm}:${ss}.${String(ms).padStart(3, "0")}${offset}`);
  } else {
    date = new Date(2000, 0, 1);
    date.setFullYear(Number(y), Number(mo) - 1, Number(d));
    date.setHours(Number(hh), Number(mm), Number(ss), ms);
    // Dates like February 31 would silently roll over; reject them instead.
    if (date.getFullYear() !== Number(y) || date.getMonth() !== Number(mo) - 1 || date.getDate() !== Number(d)) date = new Date(NaN);
  }
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That isn’t a real date or time. Check the month, day, hour and minute values." };
  return { ok: true, date, unit: "milliseconds" };
}

export function formatRelative(date: Date, now: Date): string {
  const diffSeconds = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diffSeconds);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 1], ["minute", 60], ["hour", 3600], ["day", 86400], ["month", 2592000], ["year", 31536000],
  ];
  let unit = steps[0];
  for (const step of steps) if (abs >= step[1]) unit = step;
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(diffSeconds / unit[1]), unit[0]);
}

export function describeDate(date: Date, now: Date, timeZone?: string): Row[] {
  const local = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long", timeZone }).format(date);
  return [
    { label: "ISO 8601 (UTC)", value: date.toISOString() },
    { label: "UTC", value: date.toUTCString() },
    { label: "Your time zone", value: local },
    { label: "Unix seconds", value: String(Math.floor(date.getTime() / 1000)) },
    { label: "Unix milliseconds", value: String(date.getTime()) },
    { label: "Relative to now", value: formatRelative(date, now) },
  ];
}
