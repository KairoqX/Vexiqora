"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { CheckboxInput, RangeInput } from "../Fields";
import { boxShadowCss, defaultLayer, MAX_LAYERS, type ShadowLayer } from "@/lib/boxShadow";

export default function BoxShadowTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([defaultLayer]);
  const [selected, setSelected] = useState(0);

  const result = boxShadowCss(layers);
  const layer = layers[selected] ?? layers[0];
  const change = (patch: Partial<ShadowLayer>) => setLayers((list) => list.map((l, i) => (i === selected ? { ...l, ...patch } : l)));

  function addLayer() {
    if (layers.length >= MAX_LAYERS) return;
    setLayers((list) => [...list, { ...defaultLayer, y: 1, blur: 3, opacity: 12 }]);
    setSelected(layers.length);
  }

  function removeLayer() {
    if (layers.length <= 1) return;
    setLayers((list) => list.filter((_, i) => i !== selected));
    setSelected(Math.max(0, selected - 1));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div role="group" aria-label="Shadow layers" className="flex flex-wrap items-center gap-2">
          {layers.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`min-h-9 rounded-full border px-3.5 text-sm font-medium ${selected === index ? "border-accent bg-accent-soft text-accent-text" : "border-line bg-surface text-muted hover:text-ink"}`}
            >
              Layer {index + 1}
            </button>
          ))}
          <Button onClick={addLayer} disabled={layers.length >= MAX_LAYERS}><Plus size={16} aria-hidden /> Add layer</Button>
          <Button variant="ghost" onClick={removeLayer} disabled={layers.length <= 1}><Trash2 size={16} aria-hidden /> Remove layer</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <RangeInput label="Offset X" value={layer.x} onChange={(x) => change({ x })} min={-50} max={50} unit="px" />
          <RangeInput label="Offset Y" value={layer.y} onChange={(y) => change({ y })} min={-50} max={50} unit="px" />
          <RangeInput label="Blur" value={layer.blur} onChange={(blur) => change({ blur })} min={0} max={100} unit="px" />
          <RangeInput label="Spread" value={layer.spread} onChange={(spread) => change({ spread })} min={-50} max={50} unit="px" />
          <RangeInput label="Opacity" value={layer.opacity} onChange={(opacity) => change({ opacity })} min={0} max={100} unit="%" />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="shadow-color" className="text-sm font-medium">Color</label>
            <input id="shadow-color" type="color" value={layer.color} onChange={(e) => change({ color: e.target.value })} className="h-10 w-20 cursor-pointer rounded-md border border-line bg-surface p-1" />
          </div>
        </div>
        <CheckboxInput label="Inset (shadow inside the box)" checked={layer.inset} onChange={(inset) => change({ inset })} />
        <Button variant="ghost" onClick={() => { setLayers([defaultLayer]); setSelected(0); }}>Reset</Button>
      </div>

      <div className="space-y-4">
        {/* The preview area stays light in both themes, because shadows are usually designed for light backgrounds. */}
        <div className="flex h-56 items-center justify-center rounded-lg border border-line bg-[#f3f4f6]" role="img" aria-label="Box shadow preview on a light background">
          <div className="h-28 w-28 rounded-lg bg-white" style={result.ok ? { boxShadow: result.value } : undefined} />
        </div>
        {result.ok ? (
          <div className="space-y-2">
            <TextArea label="CSS" value={result.css} readOnly rows={Math.min(8, layers.length + 2)} />
            <CopyButton text={result.css} label="Copy CSS" />
          </div>
        ) : (
          <Notice kind="error">{result.error}</Notice>
        )}
      </div>
    </div>
  );
}
