"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import { SelectInput, TextInput } from "../Fields";
import { describeDate, parseDateString, parseTimestamp, type DateResult, type TimestampUnit } from "@/lib/timestamp";

function Results({ result, timeZone }: { result: DateResult | null; timeZone: string }) {
  if (!result) return <p className="text-sm text-muted">The result appears here.</p>;
  if (!result.ok) return <Notice kind="error">{result.error}</Notice>;
  const rows = describeDate(result.date, new Date(), timeZone);
  return (
    <dl className="divide-y divide-line rounded-md border border-line bg-surface">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <dt className="text-xs text-muted">{row.label}</dt>
            <dd className="break-words font-mono text-sm">{row.value}</dd>
          </div>
          <CopyButton text={row.value} ariaLabel={`Copy ${row.label}`} />
        </div>
      ))}
    </dl>
  );
}

export default function TimestampTool() {
  const [timestamp, setTimestamp] = useState("");
  const [unit, setUnit] = useState<TimestampUnit>("auto");
  const [dateText, setDateText] = useState("");
  const [assume, setAssume] = useState<"utc" | "local">("utc");

  // The time zone is only read in the browser, after the page has loaded.
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const fromTimestamp = timestamp.trim() === "" ? null : parseTimestamp(timestamp, unit);
  const fromDate = dateText.trim() === "" ? null : parseDateString(dateText, assume);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="ts-heading" className="space-y-4">
        <h2 id="ts-heading" className="text-lg font-semibold">Timestamp to date</h2>
        <div className="flex flex-wrap items-end gap-3">
          <TextInput label="Unix timestamp" value={timestamp} onChange={setTimestamp} placeholder="1700000000" mono inputMode="numeric" className="min-w-[10rem] flex-1" />
          <SelectInput
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={[{ value: "auto", label: "Auto-detect" }, { value: "seconds", label: "Seconds" }, { value: "milliseconds", label: "Milliseconds" }]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setTimestamp(String(Math.floor(Date.now() / 1000)));
              setUnit("seconds");
            }}
          >
            Use current time
          </Button>
          <Button variant="ghost" onClick={() => setTimestamp("")} disabled={timestamp === ""}>Clear</Button>
        </div>
        {fromTimestamp?.ok && <p className="text-xs text-muted">Read as {fromTimestamp.unit}.</p>}
        <Results result={fromTimestamp} timeZone={timeZone} />
      </section>

      <section aria-labelledby="date-heading" className="space-y-4">
        <h2 id="date-heading" className="text-lg font-semibold">Date to timestamp</h2>
        <div className="flex flex-wrap items-end gap-3">
          <TextInput label="Date and time" value={dateText} onChange={setDateText} placeholder="2023-11-14 22:13:20" mono className="min-w-[10rem] flex-1" hint="Format: YYYY-MM-DD, optionally with HH:MM:SS and Z or +05:30." />
          <SelectInput label="If no time zone is given" value={assume} onChange={setAssume} options={[{ value: "utc", label: "Assume UTC" }, { value: "local", label: "Assume my local time" }]} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setDateText("2023-11-14 22:13:20")}>Load sample</Button>
          <Button variant="ghost" onClick={() => setDateText("")} disabled={dateText === ""}>Clear</Button>
        </div>
        <Results result={fromDate} timeZone={timeZone} />
      </section>
    </div>
  );
}
