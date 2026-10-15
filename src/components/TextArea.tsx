"use client";

import { useId } from "react";

interface TextAreaProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

// A labelled multi-line box. Using a real <label> lets screen readers announce it
// and lets people click the label to focus the box.
export default function TextArea({ label, value, onChange, readOnly = false, placeholder, rows = 14, hint }: TextAreaProps) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`w-full resize-y rounded-md border border-line-strong px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-muted ${
          readOnly ? "bg-canvas" : "bg-surface"
        }`}
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
