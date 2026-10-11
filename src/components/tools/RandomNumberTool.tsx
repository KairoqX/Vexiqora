"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, SelectInput, TextInput } from "../Fields";
import { generateRandomNumbers, MAX_COUNT, type RandomNumberOptions } from "@/lib/randomNumbers";

// An empty box means "no number", rather than silently becoming 0.
const toNumber = (text: string) => (text.trim() === "" ? NaN : Number(text));

export default function RandomNumberTool() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [kind, setKind] = useState<RandomNumberOptions["kind"]>("integer");
  const [decimals, setDecimals] = useState("2");
  const [unique, setUnique] = useState(false);
  const [sort, setSort] = useState<RandomNumberOptions["sort"]>("none");
  const [separator, setSeparator] = useState<"newline" | "comma" | "space">("newline");
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    const result = generateRandomNumbers({
      min: toNumber(min),
      max: toNumber(max),
      count: toNumber(count),
      kind,
      decimals: toNumber(decimals),
      unique,
      sort,
    });
    if (result.ok) {
      setValues(result.values);
      setError(null);
    } else {
      setValues([]);
      setError(result.error);
    }
  }

  const joiner = separator === "newline" ? "\n" : separator === "comma" ? ", " : " ";
  const output = values.join(joiner);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <TextInput label="Minimum" value={min} onChange={setMin} type="number" inputMode="decimal" className="w-36" />
        <TextInput label="Maximum" value={max} onChange={setMax} type="number" inputMode="decimal" className="w-36" />
        <TextInput label={`How many (1–${MAX_COUNT})`} value={count} onChange={setCount} type="number" inputMode="numeric" className="w-36" />
        <SelectInput label="Type" value={kind} onChange={setKind} options={[{ value: "integer", label: "Whole numbers" }, { value: "decimal", label: "Decimals" }]} />
        {kind === "decimal" && <TextInput label="Decimal places" value={decimals} onChange={setDecimals} type="number" inputMode="numeric" className="w-32" />}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <CheckboxInput label="Unique (no repeats)" checked={unique} onChange={setUnique} />
        <SelectInput label="Sort" value={sort} onChange={setSort} options={[{ value: "none", label: "As generated" }, { value: "asc", label: "Smallest first" }, { value: "desc", label: "Largest first" }]} />
        <SelectInput label="Separator" value={separator} onChange={setSeparator} options={[{ value: "newline", label: "New line" }, { value: "comma", label: "Comma" }, { value: "space", label: "Space" }]} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={generate}>Generate</Button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy" />
          <DownloadButton filename="random-numbers.txt" content={output} />
          <Button variant="ghost" onClick={() => { setValues([]); setError(null); }} disabled={values.length === 0 && error === null}>Clear</Button>
        </div>
      </div>

      {error && <Notice kind="error">{error}</Notice>}

      <TextArea label="Results" value={output} readOnly rows={Math.min(Math.max(values.length + 1, 6), 18)} placeholder="Select Generate to create numbers." />
    </div>
  );
}
