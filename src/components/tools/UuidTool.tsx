"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, SelectInput, TextInput } from "../Fields";
import { generateUuids, MAX_UUIDS, type UuidVersion } from "@/lib/uuid";

export default function UuidTool() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState("5");
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function generate() {
    const n = count.trim() === "" ? NaN : Number(count);
    if (!Number.isInteger(n) || n < 1 || n > MAX_UUIDS) {
      setError(`Enter a whole number of UUIDs from 1 to ${MAX_UUIDS}.`);
      return;
    }
    setError(null);
    setOutput(generateUuids({ version, count: n, uppercase, hyphens }).join("\n"));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <SelectInput label="Version" value={version} onChange={setVersion} options={[{ value: "v4", label: "Version 4 (random)" }, { value: "v7", label: "Version 7 (time-ordered)" }]} />
        <TextInput label={`How many (1–${MAX_UUIDS})`} value={count} onChange={setCount} type="number" inputMode="numeric" className="w-36" />
        <CheckboxInput label="Uppercase" checked={uppercase} onChange={setUppercase} />
        <CheckboxInput label="Hyphens" checked={hyphens} onChange={setHyphens} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={generate}>Generate</Button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy all" />
          <DownloadButton filename="uuids.txt" content={output} />
          <Button variant="ghost" onClick={() => { setOutput(""); setError(null); }} disabled={output === "" && error === null}>Clear</Button>
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <TextArea label="Generated UUIDs" value={output} readOnly rows={Math.min(Math.max(output.split("\n").length, 6), 20)} placeholder="Select Generate to create UUIDs." />
    </div>
  );
}
