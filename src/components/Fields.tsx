"use client";

import { useId } from "react";

// Small labelled form controls shared by the tools. Every control has a real <label>.

const inputClass =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted";

interface TextInputProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "number" | "search";
  mono?: boolean;
  readOnly?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
  className?: string;
}

export function TextInput({ label, value, onChange, placeholder, hint, type = "text", mono = false, readOnly = false, inputMode, className = "" }: TextInputProps) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        spellCheck={false}
        autoComplete="off"
        className={`${inputClass} ${mono ? "font-mono" : ""} ${readOnly ? "bg-canvas" : ""}`}
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

interface SelectInputProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

export function SelectInput<T extends string>({ label, value, onChange, options, className = "" }: SelectInputProps<T>) {
  const id = useId();
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent" />
      {label}
    </label>
  );
}

interface RangeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function RangeInput({ label, value, onChange, min, max, step = 1, unit = "" }: RangeInputProps) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <span className="font-mono text-xs text-muted" aria-hidden>{value}{unit}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value}${unit}`}
        className="h-6 w-full accent-accent"
      />
    </div>
  );
}

interface SegmentedProps<T extends string> {
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

/** A row of mutually exclusive choices, built on native radio buttons so arrow keys work. */
export function Segmented<T extends string>({ legend, value, onChange, options }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="inline-flex rounded-md border border-line bg-canvas p-1">
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className="cursor-pointer whitespace-nowrap rounded px-3.5 py-1.5 text-sm font-medium text-muted has-[:checked]:bg-surface has-[:checked]:text-ink has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
        >
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} className="sr-only" />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
