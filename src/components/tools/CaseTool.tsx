"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import TextArea from "../TextArea";
import { caseStyles, convertCase, type CaseStyle } from "@/lib/caseConvert";
import { samples } from "@/lib/samples";

export default function CaseTool() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState<CaseStyle>("title");
  const output = convertCase(input, style);

  return (
    <div className="space-y-4">
      <TextArea label="Your text" value={input} onChange={setInput} rows={8} placeholder="Type or paste text, a title, or a variable name" />

      <div role="group" aria-label="Case style" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {caseStyles.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={style === option.value}
            onClick={() => setStyle(option.value)}
            title={`Example: ${option.example}`}
            className={`min-h-10 rounded-md border px-3 text-sm font-medium ${
              style === option.value ? "border-accent bg-accent-soft text-accent-text" : "border-line bg-surface text-ink hover:bg-canvas"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <TextArea label="Result" value={output} readOnly rows={8} placeholder="The converted text appears here." />

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={output} label="Copy result" />
        <Button variant="ghost" onClick={() => setInput(samples.caseText)}>Load sample</Button>
        <Button variant="ghost" onClick={() => setInput("")} disabled={input === ""}>Clear</Button>
      </div>
    </div>
  );
}
