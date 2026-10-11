"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import TextArea from "../TextArea";
import { formatReadingTime, getTextStats } from "@/lib/counter";
import { samples } from "@/lib/samples";

export default function CounterTool() {
  const [text, setText] = useState("");
  const stats = useMemo(() => getTextStats(text), [text]);

  const rows = [
    { label: "Words", value: stats.words.toLocaleString("en-US") },
    { label: "Characters", value: stats.characters.toLocaleString("en-US") },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString("en-US") },
    { label: "Sentences", value: stats.sentences.toLocaleString("en-US") },
    { label: "Lines", value: stats.lines.toLocaleString("en-US") },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString("en-US") },
    { label: "Reading time (estimate)", value: formatReadingTime(stats.words) },
  ];
  const statsText = rows.map((r) => `${r.label}: ${r.value}`).join("\n");

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-xs text-muted">{row.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted">Reading time is an estimate based on about 238 words per minute. Sentence counts are an estimate.</p>

      <TextArea label="Your text" value={text} onChange={setText} rows={16} placeholder="Type or paste your text here" />

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={text} label="Copy text" />
        <CopyButton text={text === "" ? "" : statsText} label="Copy stats" />
        <Button variant="ghost" onClick={() => setText(samples.counterText)}>Load sample</Button>
        <Button variant="ghost" onClick={() => setText("")} disabled={text === ""}>Clear</Button>
      </div>
    </div>
  );
}
