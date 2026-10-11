"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { samples } from "@/lib/samples";
import { formatJson, minifyJson, validateJson, type IndentOption, type JsonResult } from "@/lib/json";

type Status = { kind: "success" | "error"; text: string } | null;

export default function JsonTool() {
  // Each useState holds one value the screen depends on. When it changes, React redraws.
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<IndentOption>("2");
  const [status, setStatus] = useState<Status>(null);

  function run(result: JsonResult) {
    if (result.ok) {
      if (result.output !== null) setOutput(result.output);
      setStatus({ kind: "success", text: result.message });
    } else {
      setOutput("");
      setStatus({ kind: "error", text: result.error });
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setStatus(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => run(formatJson(input, indent))}>Format</Button>
        <Button onClick={() => run(minifyJson(input))}>Minify</Button>
        <Button onClick={() => run(validateJson(input))}>Validate</Button>
        <div className="flex items-center gap-2 sm:ml-2">
          <label htmlFor="json-indent" className="text-sm text-muted">Indent</label>
          <select
            id="json-indent"
            value={indent}
            onChange={(e) => setIndent(e.target.value as IndentOption)}
            className="h-10 rounded-md border border-line bg-surface px-2 text-sm"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            variant="ghost"
            onClick={() => {
              setInput(samples.json);
              setOutput("");
              setStatus(null);
            }}
          >
            Load sample
          </Button>
          <CopyButton text={output} label="Copy output" />
          <DownloadButton filename="formatted.json" content={output} mimeType="application/json" />
          <Button variant="ghost" onClick={clearAll} disabled={input === "" && output === "" && !status}>Clear</Button>
        </div>
      </div>

      {status && <Notice kind={status.kind}>{status.text}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={setInput} placeholder='{"name": "Vexiqora", "free": true}' rows={18} />
        <TextArea label="Output" value={output} readOnly rows={18} placeholder="Formatted or minified JSON appears here." />
      </div>
    </div>
  );
}
