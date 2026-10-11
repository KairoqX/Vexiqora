"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, SelectInput, Segmented } from "../Fields";
import { csvToJson, jsonToCsv, type Delimiter } from "@/lib/csv";
import { samples } from "@/lib/samples";

type Mode = "json-to-csv" | "csv-to-json";

export default function JsonCsvTool() {
  const [mode, setMode] = useState<Mode>("json-to-csv");
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [header, setHeader] = useState(true);
  const [inferTypes, setInferTypes] = useState(true);

  const result = useMemo(() => {
    if (input.trim() === "") return null;
    return mode === "json-to-csv" ? jsonToCsv(input, delimiter) : csvToJson(input, { delimiter, header, inferTypes });
  }, [mode, input, delimiter, header, inferTypes]);

  const output = result?.ok ? result.output : "";

  function changeMode(next: Mode) {
    setMode(next);
    setInput(""); // the old input is in the other format, so start fresh
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Segmented legend="Direction" value={mode} onChange={changeMode} options={[{ value: "json-to-csv", label: "JSON → CSV" }, { value: "csv-to-json", label: "CSV → JSON" }]} />
        <SelectInput
          label="Delimiter"
          value={delimiter}
          onChange={setDelimiter}
          options={[{ value: ",", label: "Comma ( , )" }, { value: ";", label: "Semicolon ( ; )" }, { value: "\t", label: "Tab" }, { value: "|", label: "Pipe ( | )" }]}
        />
        {mode === "csv-to-json" && (
          <>
            <CheckboxInput label="First row is the header" checked={header} onChange={setHeader} />
            <CheckboxInput label="Detect numbers and true/false" checked={inferTypes} onChange={setInferTypes} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setInput(mode === "json-to-csv" ? samples.jsonRecords : samples.csv)}>Load sample</Button>
        <Button
          onClick={() => {
            setMode(mode === "json-to-csv" ? "csv-to-json" : "json-to-csv");
            setInput(output);
          }}
          disabled={output === ""}
        >
          <ArrowLeftRight size={16} aria-hidden /> Use output as input
        </Button>
        <div className="flex items-center gap-2 sm:ml-auto">
          <CopyButton text={output} label="Copy output" />
          <DownloadButton
            filename={mode === "json-to-csv" ? "data.csv" : "data.json"}
            content={output}
            mimeType={mode === "json-to-csv" ? "text/csv" : "application/json"}
          />
          <Button variant="ghost" onClick={() => setInput("")} disabled={input === ""}>Clear</Button>
        </div>
      </div>

      {result && !result.ok && <Notice kind="error">{result.error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea
          label={mode === "json-to-csv" ? "JSON input" : "CSV input"}
          value={input}
          onChange={setInput}
          rows={16}
          placeholder={mode === "json-to-csv" ? '[{"name": "Ada", "city": "London"}]' : "name,city\nAda,London"}
        />
        <TextArea label={mode === "json-to-csv" ? "CSV output" : "JSON output"} value={output} readOnly rows={16} placeholder="The converted result appears here." />
      </div>
    </div>
  );
}
