"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, SelectInput, TextInput } from "../Fields";
import { generateLorem, LIMITS, type LoremUnit } from "@/lib/lorem";

export default function LoremTool() {
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState("3");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function generate() {
    const n = count.trim() === "" ? NaN : Number(count);
    if (!Number.isInteger(n) || n < 1 || n > LIMITS[unit]) {
      setError(`Enter a whole number of ${unit} from 1 to ${LIMITS[unit].toLocaleString("en-US")}.`);
      return;
    }
    setError(null);
    setOutput(generateLorem({ unit, count: n, startWithLorem }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <SelectInput label="Generate" value={unit} onChange={setUnit} options={[{ value: "paragraphs", label: "Paragraphs" }, { value: "sentences", label: "Sentences" }, { value: "words", label: "Words" }]} />
        <TextInput label={`How many (up to ${LIMITS[unit].toLocaleString("en-US")})`} value={count} onChange={setCount} type="number" inputMode="numeric" className="w-44" />
        <CheckboxInput label="Start with “Lorem ipsum dolor sit amet”" checked={startWithLorem} onChange={setStartWithLorem} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={generate}>Generate</Button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy text" />
          <DownloadButton filename="lorem-ipsum.txt" content={output} />
          <Button variant="ghost" onClick={() => { setOutput(""); setError(null); }} disabled={output === "" && error === null}>Clear</Button>
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <TextArea label="Placeholder text" value={output} readOnly rows={14} placeholder="Select Generate to create placeholder text." />
    </div>
  );
}
