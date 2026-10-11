"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { decodeBase64, encodeBase64 } from "@/lib/base64";
import { samples } from "@/lib/samples";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);

  // useMemo recalculates only when the input, mode or URL-safe option changes.
  // The result updates as you type, so there's no separate "Convert" button.
  const result = useMemo(() => {
    if (input === "") return { output: "", error: null as string | null };
    if (mode === "encode") return { output: encodeBase64(input, urlSafe), error: null };
    const decoded = decodeBase64(input);
    return decoded.ok ? { output: decoded.output, error: null } : { output: "", error: decoded.error };
  }, [input, mode, urlSafe]);

  function swapDirection() {
    setInput(result.output);
    setMode(mode === "encode" ? "decode" : "encode");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <fieldset className="inline-flex rounded-md border border-line bg-canvas p-1">
          <legend className="sr-only">Mode</legend>
          {(["encode", "decode"] as const).map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded px-4 py-1.5 text-sm font-medium text-muted has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
            >
              <input
                type="radio"
                name="base64-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="sr-only"
              />
              {value === "encode" ? "Encode" : "Decode"}
            </label>
          ))}
        </fieldset>

        {mode === "encode" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="h-4 w-4 accent-accent" />
            URL-safe output
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Button onClick={swapDirection} disabled={result.output === ""}>
            <ArrowLeftRight size={16} aria-hidden /> Use output as input
          </Button>
          <Button variant="ghost" onClick={() => setInput(mode === "encode" ? samples.base64Text : encodeBase64(samples.base64Text))}>
            Load sample
          </Button>
          <CopyButton text={result.output} label="Copy output" />
          <Button variant="ghost" onClick={() => setInput("")} disabled={input === ""}>Clear</Button>
        </div>
      </div>

      {result.error && <Notice kind="error">{result.error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea
          label={mode === "encode" ? "Text to encode" : "Base64 to decode"}
          value={input}
          onChange={setInput}
          rows={14}
          placeholder={mode === "encode" ? "Type or paste any text, including emoji" : "Paste Base64 here"}
        />
        <TextArea
          label={mode === "encode" ? "Base64 output" : "Decoded text"}
          value={result.output}
          readOnly
          rows={14}
          placeholder="The result appears here."
        />
      </div>
    </div>
  );
}
