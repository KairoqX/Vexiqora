"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeftRight } from "lucide-react";
import Button from "../Button";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { Segmented } from "../Fields";
import { diffLines, inlineDiff, toSideBySide, type DiffLine, type DiffLineType, type DiffResult } from "@/lib/diff";
import { samples } from "@/lib/samples";

const rowStyle: Record<DiffLineType, string> = {
  added: "bg-added-bg",
  removed: "bg-removed-bg",
  unchanged: "",
};
// The symbol and the hidden label mean colour is never the only signal.
const marker: Record<DiffLineType, { symbol: string; label: string }> = {
  added: { symbol: "+", label: "Added" },
  removed: { symbol: "−", label: "Removed" },
  unchanged: { symbol: "\u00a0", label: "Unchanged" },
};

type View = "unified" | "split";

/** One cell of the side-by-side view. `highlight` marks the part of the line that changed. */
function SideCell({ line, side, partner }: { line: DiffLine | null; side: "left" | "right"; partner: DiffLine | null }) {
  if (!line) return <td className="bg-canvas" aria-hidden />;
  let content: ReactNode = line.text === "" ? "\u00a0" : line.text;
  if (line.type !== "unchanged" && partner && partner.type !== "unchanged") {
    const parts = side === "left" ? inlineDiff(line.text, partner.text) : inlineDiff(partner.text, line.text);
    const middle = side === "left" ? parts.oldMiddle : parts.newMiddle;
    content = (
      <>
        {parts.prefix}
        {middle !== "" && <mark className={`rounded-sm px-0.5 text-ink ${side === "left" ? "bg-danger/25" : "bg-accent/30"}`}>{middle}</mark>}
        {parts.suffix}
      </>
    );
  }
  return (
    <td className={`whitespace-pre-wrap break-words px-2 py-0.5 align-top ${rowStyle[line.type]}`}>
      {line.type !== "unchanged" && <span className="sr-only">{marker[line.type].label}: </span>}
      {content}
    </td>
  );
}

export default function DiffTool() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [result, setResult] = useState<DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [view, setView] = useState<View>("unified");

  // Editing either box makes an old result out of date, so we hide it.
  function edit(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setResult(null);
      setError(null);
    };
  }

  function compare(a = original, b = changed) {
    setError(null);
    if (a === "" && b === "") {
      setResult(null);
      setError("Enter text in at least one box to compare.");
      return;
    }
    try {
      setResult(diffLines(a, b));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while comparing.");
    }
  }

  function clearAll() {
    setOriginal("");
    setChanged("");
    setResult(null);
    setError(null);
  }

  const visibleLines = result ? result.lines.filter((l) => showUnchanged || l.type !== "unchanged") : [];
  const rows = toSideBySide(visibleLines);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <TextArea label="Original text" value={original} onChange={edit(setOriginal)} rows={12} placeholder="Paste the original text" />
        <TextArea label="Changed text" value={changed} onChange={edit(setChanged)} rows={12} placeholder="Paste the changed text" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => compare()}>Compare</Button>
        <Button
          onClick={() => {
            setOriginal(changed);
            setChanged(original);
            setResult(null);
            setError(null);
          }}
        >
          <ArrowLeftRight size={16} aria-hidden /> Swap
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOriginal(samples.diffOriginal);
            setChanged(samples.diffChanged);
            compare(samples.diffOriginal, samples.diffChanged);
          }}
        >
          Load sample
        </Button>
        <Button variant="ghost" onClick={clearAll} disabled={original === "" && changed === "" && !result && !error}>Clear</Button>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      {result && (
        <section aria-labelledby="diff-heading" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="diff-heading" className="text-lg font-semibold">Result</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Segmented legend="View" value={view} onChange={setView} options={[{ value: "unified", label: "Single list" }, { value: "split", label: "Side by side" }]} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showUnchanged} onChange={(e) => setShowUnchanged(e.target.checked)} className="h-4 w-4 accent-accent" />
                Show unchanged lines
              </label>
            </div>
          </div>

          {result.identical ? (
            <Notice kind="success">The two texts are identical.</Notice>
          ) : (
            <p className="text-sm text-muted" role="status">
              {result.added} added, {result.removed} removed, {result.unchanged} unchanged
            </p>
          )}

          {visibleLines.length > 0 && view === "unified" && (
            <div className="overflow-x-auto rounded-md border border-line bg-surface">
              <table className="w-full border-collapse font-mono text-sm">
                <caption className="sr-only">Line-by-line comparison</caption>
                <thead className="sr-only">
                  <tr><th>Original line</th><th>Changed line</th><th>Change</th><th>Text</th></tr>
                </thead>
                <tbody>
                  {visibleLines.map((line, index) => (
                    <tr key={index} className={rowStyle[line.type]}>
                      <td className="w-12 select-none px-2 py-0.5 text-right align-top text-xs text-muted">{line.oldNumber ?? ""}</td>
                      <td className="w-12 select-none px-2 py-0.5 text-right align-top text-xs text-muted">{line.newNumber ?? ""}</td>
                      <td className="w-8 select-none px-2 py-0.5 text-center align-top font-semibold">
                        <span aria-hidden>{marker[line.type].symbol}</span>
                        <span className="sr-only">{marker[line.type].label}</span>
                      </td>
                      <td className="whitespace-pre px-2 py-0.5 align-top">{line.text === "" ? "\u00a0" : line.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visibleLines.length > 0 && view === "split" && (
            <div className="overflow-x-auto rounded-md border border-line bg-surface">
              <table className="w-full min-w-[36rem] table-fixed border-collapse font-mono text-sm">
                <caption className="sr-only">Side-by-side comparison</caption>
                <colgroup><col className="w-10" /><col /><col className="w-10" /><col /></colgroup>
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th scope="col" className="px-2 py-1.5 text-right font-normal">#</th>
                    <th scope="col" className="px-2 py-1.5 font-medium">Original</th>
                    <th scope="col" className="px-2 py-1.5 text-right font-normal">#</th>
                    <th scope="col" className="px-2 py-1.5 font-medium">Changed</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="select-none px-2 py-0.5 text-right align-top text-xs text-muted">{row.left?.oldNumber ?? ""}</td>
                      <SideCell line={row.left} side="left" partner={row.right} />
                      <td className="select-none border-l border-line px-2 py-0.5 text-right align-top text-xs text-muted">{row.right?.newNumber ?? ""}</td>
                      <SideCell line={row.right} side="right" partner={row.left} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
