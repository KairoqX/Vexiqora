"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, TextInput } from "../Fields";
import { applyReplacement, buildSegments, runRegex } from "@/lib/regex";
import { samples } from "@/lib/samples";

const FLAGS = [
  { flag: "g", label: "g: all matches" },
  { flag: "i", label: "i: ignore case" },
  { flag: "m", label: "m: multiline" },
  { flag: "s", label: "s: dot matches newline" },
  { flag: "u", label: "u: unicode" },
] as const;

const MAX_LISTED = 100; // the list below the highlighted text shows this many matches at most

export default function RegexTool() {
  const [pattern, setPattern] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ g: true });
  const [text, setText] = useState("");
  const [replacement, setReplacement] = useState("");

  const flags = FLAGS.filter((f) => enabled[f.flag]).map((f) => f.flag).join("");
  const result = useMemo(() => (pattern === "" ? null : runRegex(pattern, flags, text)), [pattern, flags, text]);
  const segments = useMemo(() => (result?.ok ? buildSegments(text, result.matches) : []), [result, text]);
  const replaced = useMemo(() => (pattern !== "" && replacement !== "" ? applyReplacement(pattern, flags, text, replacement) : null), [pattern, flags, text, replacement]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <TextInput label="Pattern" value={pattern} onChange={setPattern} placeholder="(\w+)@(\w+)\.com" mono className="min-w-[14rem] flex-1" hint="Written without the surrounding slashes." />
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Flags</legend>
          <div className="flex flex-wrap gap-x-4">
            {FLAGS.map((f) => (
              <CheckboxInput key={f.flag} label={f.label} checked={Boolean(enabled[f.flag])} onChange={(checked) => setEnabled((prev) => ({ ...prev, [f.flag]: checked }))} />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setPattern(samples.regexPattern);
            setText(samples.regexText);
            setEnabled({ g: true });
          }}
        >
          Load sample
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setPattern("");
            setText("");
            setReplacement("");
            setEnabled({ g: true });
          }}
          disabled={pattern === "" && text === "" && replacement === ""}
        >
          Reset
        </Button>
      </div>

      {result && !result.ok && <Notice kind="error">{result.error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label="Test text" value={text} onChange={setText} rows={12} placeholder="Type or paste the text to search" />

        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-sm font-medium" id="highlight-heading">Matches highlighted</h2>
          <div aria-labelledby="highlight-heading" role="region" tabIndex={0} className="min-h-[16rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-line bg-surface p-3 font-mono text-sm leading-relaxed">
            {pattern === "" ? (
              <span className="text-muted">Enter a pattern to see matches.</span>
            ) : !result?.ok ? (
              <span className="text-muted">Fix the pattern to see matches.</span>
            ) : text === "" ? (
              <span className="text-muted">Type some test text.</span>
            ) : (
              segments.map((segment, index) =>
                segment.matched ? (
                  <mark key={index} className="rounded-sm bg-accent/30 px-0.5 text-ink ring-1 ring-accent/60">{segment.text}</mark>
                ) : (
                  <span key={index}>{segment.text}</span>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {result?.ok && (
        <section aria-labelledby="match-list-heading" className="space-y-2">
          <h2 id="match-list-heading" className="text-lg font-semibold">
            <span role="status">
              {result.matches.length === 0 ? "No matches" : `${result.matches.length}${result.truncated ? "+" : ""} ${result.matches.length === 1 ? "match" : "matches"}`}
            </span>
          </h2>
          {result.truncated && <Notice kind="info">Showing the first 1,000 matches only.</Notice>}
          {result.matches.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-line bg-surface">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Matches with their positions and capture groups</caption>
                <thead>
                  <tr className="border-b border-line text-xs text-muted">
                    <th scope="col" className="px-3 py-2 font-medium">#</th>
                    <th scope="col" className="px-3 py-2 font-medium">Position</th>
                    <th scope="col" className="px-3 py-2 font-medium">Match</th>
                    <th scope="col" className="px-3 py-2 font-medium">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matches.slice(0, MAX_LISTED).map((m, i) => {
                    const named = Object.entries(m.named);
                    return (
                      <tr key={i} className="border-b border-line last:border-0 align-top">
                        <td className="px-3 py-2 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2 tabular-nums">{m.index}</td>
                        <td className="break-all px-3 py-2 font-mono">{m.text === "" ? <span className="text-muted">(empty)</span> : m.text}</td>
                        <td className="break-all px-3 py-2 font-mono">
                          {m.groups.length === 0 && named.length === 0 && <span className="text-muted">none</span>}
                          {m.groups.map((g, gi) => (
                            <div key={gi}>${gi + 1}: {g === undefined ? <span className="text-muted">(not matched)</span> : g}</div>
                          ))}
                          {named.map(([name, value]) => (
                            <div key={name}>{name}: {value === undefined ? <span className="text-muted">(not matched)</span> : value}</div>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {result.matches.length > MAX_LISTED && <p className="text-xs text-muted">The table shows the first {MAX_LISTED} matches; all of them are highlighted above.</p>}
        </section>
      )}

      <section aria-labelledby="replace-heading" className="space-y-3">
        <h2 id="replace-heading" className="text-lg font-semibold">Replace (optional)</h2>
        <TextInput label="Replacement" value={replacement} onChange={setReplacement} placeholder="$2 at $1" mono hint="$1 is the first group, $& the whole match, $$ a dollar sign." />
        {replaced && !replaced.ok && <Notice kind="error">{replaced.error}</Notice>}
        {replaced?.ok && (
          <div className="space-y-2">
            <TextArea label="Result" value={replaced.output} readOnly rows={6} />
            <CopyButton text={replaced.output} label="Copy result" />
          </div>
        )}
      </section>
    </div>
  );
}
