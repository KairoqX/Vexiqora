"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { minifyJson, sizeInBytes } from "@/lib/json";
import { samples } from "@/lib/samples";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function JsonMinifierTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function run(text = input) {
    const result = minifyJson(text);
    if (!result.ok || result.output === null) {
      setOutput("");
      setStatus({ kind: "error", text: result.ok ? "Nothing to minify." : result.error });
      return;
    }
    const before = sizeInBytes(text);
    const after = sizeInBytes(result.output);
    const saved = before - after;
    setOutput(result.output);
    setStatus({
      kind: "success",
      text:
        saved > 0
          ? `Minified: ${fmt(before)} bytes → ${fmt(after)} bytes. You save ${fmt(saved)} bytes (${Math.round((saved / before) * 100)}% smaller).`
          : `This JSON was already minified (${fmt(after)} bytes).`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => run()}>Minify</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setInput(samples.json);
            run(samples.json);
          }}
        >
          Load sample
        </Button>
        <div className="flex items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy output" />
          <DownloadButton filename="data.min.json" content={output} mimeType="application/json" />
          <Button
            variant="ghost"
            onClick={() => {
              setInput("");
              setOutput("");
              setStatus(null);
            }}
            disabled={input === "" && output === ""}
          >
            Clear
          </Button>
        </div>
      </div>

      {status && <Notice kind={status.kind}>{status.text}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={(v) => { setInput(v); }} placeholder="Paste formatted JSON here" rows={16} />
        <TextArea label="Minified output" value={output} readOnly rows={16} placeholder="The minified JSON appears here." />
      </div>
    </div>
  );
}
