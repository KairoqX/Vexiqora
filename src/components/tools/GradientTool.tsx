"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { RangeInput, SelectInput } from "../Fields";
import { gradientCss, MAX_STOPS, MIN_STOPS, type GradientType } from "@/lib/gradient";

interface StopState {
  id: number;
  color: string;
  position: number;
}

const INITIAL: StopState[] = [
  { id: 1, color: "#1d6b57", position: 0 },
  { id: 2, color: "#5fd0ae", position: 100 },
];

export default function GradientTool() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<StopState[]>(INITIAL);
  const [nextId, setNextId] = useState(3);

  const result = gradientCss({ type, angle, stops: stops.map(({ color, position }) => ({ color, position })) });

  const update = (id: number, change: Partial<StopState>) => setStops((list) => list.map((s) => (s.id === id ? { ...s, ...change } : s)));

  function addStop() {
    if (stops.length >= MAX_STOPS) return;
    setStops((list) => [...list, { id: nextId, color: "#ffffff", position: 50 }]);
    setNextId((n) => n + 1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput label="Type" value={type} onChange={setType} options={[{ value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }, { value: "conic", label: "Conic" }]} />
          {type !== "radial" && <RangeInput label="Angle" value={angle} onChange={setAngle} min={0} max={360} unit="°" />}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Color stops</legend>
          {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`stop-color-${stop.id}`} className="text-xs text-muted">Color {index + 1}</label>
                <input id={`stop-color-${stop.id}`} type="color" value={stop.color} onChange={(e) => update(stop.id, { color: e.target.value })} className="h-10 w-16 cursor-pointer rounded-md border border-line bg-surface p-1" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <label htmlFor={`stop-pos-${stop.id}`} className="text-xs text-muted">Position {index + 1} ({stop.position}%)</label>
                <input id={`stop-pos-${stop.id}`} type="range" min={0} max={100} value={stop.position} onChange={(e) => update(stop.id, { position: Number(e.target.value) })} className="h-10 w-full accent-accent" />
              </div>
              <Button variant="ghost" aria-label={`Remove color ${index + 1}`} onClick={() => setStops((list) => list.filter((s) => s.id !== stop.id))} disabled={stops.length <= MIN_STOPS} className="px-2">
                <X size={16} aria-hidden />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button onClick={addStop} disabled={stops.length >= MAX_STOPS}>
              <Plus size={16} aria-hidden /> Add color
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setType("linear");
                setAngle(90);
                setStops(INITIAL);
              }}
            >
              Reset
            </Button>
          </div>
        </fieldset>
      </div>

      <div className="space-y-4">
        <div
          role="img"
          aria-label="Gradient preview"
          className="h-56 rounded-lg border border-line"
          style={result.ok ? { background: result.value } : undefined}
        />
        {result.ok ? (
          <div className="space-y-2">
            <TextArea label="CSS" value={result.css} readOnly rows={3} />
            <CopyButton text={result.css} label="Copy CSS" />
          </div>
        ) : (
          <Notice kind="error">{result.error}</Notice>
        )}
      </div>
    </div>
  );
}
