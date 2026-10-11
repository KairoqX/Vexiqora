"use client";

import { useId, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import { TextInput } from "../Fields";
import { parseColor, toHex, toHslString, toOpaqueHex, toRgbString } from "@/lib/color";

export default function ColorTool() {
  const [text, setText] = useState("#1d6b57");
  const pickerId = useId();
  const parsed = parseColor(text);

  const rows = parsed.ok
    ? [
        { label: "HEX", value: toHex(parsed.color) },
        { label: "RGB", value: toRgbString(parsed.color) },
        { label: "HSL", value: toHslString(parsed.color) },
      ]
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <TextInput label="Color" value={text} onChange={setText} placeholder="#1d6b57, rgb(29, 107, 87) or hsl(165, 57%, 27%)" mono hint="HEX (3, 4, 6 or 8 digits), rgb() / rgba(), or hsl() / hsla()." />

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={pickerId} className="text-sm font-medium">Pick a color</label>
            <input
              id={pickerId}
              type="color"
              value={parsed.ok ? toOpaqueHex(parsed.color) : "#000000"}
              onChange={(e) => setText(e.target.value)}
              className="h-10 w-20 cursor-pointer rounded-md border border-line bg-surface p-1"
            />
          </div>
          <Button variant="ghost" onClick={() => setText("#1d6b57")}>Reset</Button>
          <Button variant="ghost" onClick={() => setText("")} disabled={text === ""}>Clear</Button>
        </div>

        {!parsed.ok && <Notice kind="error">{parsed.error}</Notice>}
      </div>

      <div className="space-y-4">
        <div
          role="img"
          aria-label={parsed.ok ? `Preview of ${toHex(parsed.color)}` : "No color to preview"}
          className="h-32 rounded-lg border border-line bg-surface"
          style={parsed.ok ? { backgroundColor: toRgbString(parsed.color) } : undefined}
        />
        {parsed.ok ? (
          <dl className="divide-y divide-line rounded-md border border-line bg-surface">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <dt className="text-xs text-muted">{row.label}</dt>
                  <dd className="break-all font-mono text-sm">{row.value}</dd>
                </div>
                <CopyButton text={row.value} ariaLabel={`Copy ${row.label} value`} />
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted">Enter a valid color to see it in every format.</p>
        )}
      </div>
    </div>
  );
}
