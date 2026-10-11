"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, Segmented, SelectInput } from "../Fields";
import { decodeUrl, encodeUrl, type UrlEncodeMode } from "@/lib/textCodec";
import { samples } from "@/lib/samples";

type Mode = "encode" | "decode";

export default function UrlTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [encodeMode, setEncodeMode] = useState<UrlEncodeMode>("component");
  const [plusAsSpace, setPlusAsSpace] = useState(false);

  const result = useMemo(() => {
    if (input === "") return null;
    return mode === "encode" ? encodeUrl(input, encodeMode) : decodeUrl(input, plusAsSpace);
  }, [mode, input, encodeMode, plusAsSpace]);
  const output = result?.ok ? result.output : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Segmented legend="Mode" value={mode} onChange={setMode} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
        {mode === "encode" ? (
          <SelectInput
            label="Encode as"
            value={encodeMode}
            onChange={setEncodeMode}
            options={[{ value: "component", label: "Component (a single value)" }, { value: "full", label: "Full URL (keep / ? & =)" }]}
          />
        ) : (
          <CheckboxInput label="Treat + as a space" checked={plusAsSpace} onChange={setPlusAsSpace} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setInput(mode === "encode" ? samples.url : encodeURIComponent(samples.url))}>Load sample</Button>
        <Button
          onClick={() => {
            setMode(mode === "encode" ? "decode" : "encode");
            setInput(output);
          }}
          disabled={output === ""}
        >
          <ArrowLeftRight size={16} aria-hidden /> Use output as input
        </Button>
        <div className="flex items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy output" />
          <Button variant="ghost" onClick={() => setInput("")} disabled={input === ""}>Clear</Button>
        </div>
      </div>

      {result && !result.ok && <Notice kind="error">{result.error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label={mode === "encode" ? "Text to encode" : "Text to decode"} value={input} onChange={setInput} rows={10} placeholder={mode === "encode" ? "Type or paste text, a value or a URL" : "Paste percent-encoded text, such as hello%20world"} />
        <TextArea label={mode === "encode" ? "Encoded" : "Decoded"} value={output} readOnly rows={10} placeholder="The result appears here." />
      </div>
    </div>
  );
}
