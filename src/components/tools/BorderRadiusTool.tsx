"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, RangeInput, SelectInput } from "../Fields";
import { borderRadiusCss, type Corners, type RadiusUnit } from "@/lib/borderRadius";

const CORNERS = ["Top left", "Top right", "Bottom right", "Bottom left"] as const;
const START: Corners = [16, 16, 16, 16];

export default function BorderRadiusTool() {
  const [unit, setUnit] = useState<RadiusUnit>("px");
  const [horizontal, setHorizontal] = useState<Corners>(START);
  const [vertical, setVertical] = useState<Corners>(START);
  const [link, setLink] = useState(true);
  const [separate, setSeparate] = useState(false);

  const max = unit === "%" ? 100 : 200;
  const result = borderRadiusCss({ unit, horizontal, vertical: separate ? vertical : null });

  const setCorner = (current: Corners, set: (c: Corners) => void) => (index: number, value: number) => {
    const next = (link ? current.map(() => value) : current.map((v, i) => (i === index ? value : v))) as Corners;
    set(next);
  };
  const setH = setCorner(horizontal, setHorizontal);
  const setV = setCorner(vertical, setVertical);

  function changeUnit(next: RadiusUnit) {
    setUnit(next);
    if (next === "%") {
      // Percentages can't go above 100, so bring larger pixel values back into range.
      setHorizontal((h) => h.map((n) => Math.min(n, 100)) as Corners);
      setVertical((v) => v.map((n) => Math.min(n, 100)) as Corners);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <SelectInput label="Unit" value={unit} onChange={changeUnit} options={[{ value: "px", label: "Pixels (px)" }, { value: "%", label: "Percent (%)" }]} />
          <CheckboxInput label="Link corners" checked={link} onChange={setLink} />
          <CheckboxInput label="Separate vertical radii" checked={separate} onChange={setSeparate} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CORNERS.map((name, i) => (
            <RangeInput key={`h-${name}`} label={separate ? `${name} (horizontal)` : name} value={horizontal[i]} onChange={(v) => setH(i, v)} min={0} max={max} unit={unit} />
          ))}
          {separate &&
            CORNERS.map((name, i) => (
              <RangeInput key={`v-${name}`} label={`${name} (vertical)`} value={vertical[i]} onChange={(v) => setV(i, v)} min={0} max={max} unit={unit} />
            ))}
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setHorizontal(START);
            setVertical(START);
            setUnit("px");
            setLink(true);
            setSeparate(false);
          }}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex h-56 items-center justify-center rounded-lg border border-line bg-canvas" role="img" aria-label="Border radius preview">
          <div className="h-36 w-52 bg-accent" style={result.ok ? { borderRadius: result.value } : undefined} />
        </div>
        {result.ok ? (
          <div className="space-y-2">
            <TextArea label="CSS" value={result.css} readOnly rows={2} />
            <CopyButton text={result.css} label="Copy CSS" />
          </div>
        ) : (
          <Notice kind="error">{result.error}</Notice>
        )}
      </div>
    </div>
  );
}
