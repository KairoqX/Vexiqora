"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import TextArea from "../TextArea";
import { CheckboxInput, Segmented } from "../Fields";
import { decodeHtmlEntities, encodeHtmlEntities } from "@/lib/textCodec";
import { samples } from "@/lib/samples";

type Mode = "encode" | "decode";

// Everything here is plain text in and plain text out. The input is never inserted into the page as HTML.
export default function HtmlEntitiesTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [nonAscii, setNonAscii] = useState(false);

  const output = useMemo(() => {
    if (input === "") return "";
    return mode === "encode" ? encodeHtmlEntities(input, nonAscii) : decodeHtmlEntities(input);
  }, [mode, input, nonAscii]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Segmented legend="Mode" value={mode} onChange={setMode} options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
        {mode === "encode" && <CheckboxInput label="Also convert non-ASCII characters" checked={nonAscii} onChange={setNonAscii} />}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setInput(mode === "encode" ? samples.html : encodeHtmlEntities(samples.html))}>Load sample</Button>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label={mode === "encode" ? "Text or HTML to encode" : "Entities to decode"} value={input} onChange={setInput} rows={10} placeholder={mode === "encode" ? '<p class="note">Fish & chips</p>' : "&lt;p&gt;Fish &amp; chips&lt;/p&gt;"} />
        <TextArea label={mode === "encode" ? "Encoded" : "Decoded"} value={output} readOnly rows={10} placeholder="The result appears here." />
      </div>
    </div>
  );
}
