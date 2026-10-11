"use client";

import { useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import { CheckboxInput, RangeInput, TextInput } from "../Fields";
import { generatePassword, MAX_LENGTH, MIN_LENGTH, strengthLabel, type PasswordOptions, type PasswordResult } from "@/lib/password";

const DEFAULTS: PasswordOptions = { length: 20, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false };

export default function PasswordTool() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULTS);
  const [result, setResult] = useState<PasswordResult | null>(null);
  const set = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => setOptions((o) => ({ ...o, [key]: value }));

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <RangeInput label="Length" value={options.length} onChange={(v) => set("length", v)} min={MIN_LENGTH} max={MAX_LENGTH} unit=" characters" />
          <div className="grid grid-cols-2 gap-x-4">
            <CheckboxInput label="Lowercase (a–z)" checked={options.lower} onChange={(v) => set("lower", v)} />
            <CheckboxInput label="Uppercase (A–Z)" checked={options.upper} onChange={(v) => set("upper", v)} />
            <CheckboxInput label="Numbers (0–9)" checked={options.digits} onChange={(v) => set("digits", v)} />
            <CheckboxInput label="Symbols (!@#…)" checked={options.symbols} onChange={(v) => set("symbols", v)} />
          </div>
          <CheckboxInput label="Avoid look-alike characters (I, l, 1, O, 0, o)" checked={options.excludeAmbiguous} onChange={(v) => set("excludeAmbiguous", v)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setResult(generatePassword(options))}>Generate</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOptions(DEFAULTS);
                setResult(null);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <TextInput label="Generated password" value={result?.ok ? result.password : ""} readOnly mono placeholder="Select Generate to create a password" />
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={result?.ok ? result.password : ""} label="Copy password" />
            <Button variant="ghost" onClick={() => setResult(null)} disabled={result === null}>Clear</Button>
          </div>
          {result?.ok && (
            <p className="text-sm text-muted" role="status">
              Estimated strength: <strong className="text-ink">{strengthLabel(result.entropyBits)}</strong> (about {result.entropyBits} bits, from a pool of {result.poolSize} characters).
            </p>
          )}
          {result && !result.ok && <Notice kind="error">{result.error}</Notice>}
        </div>
      </div>
      <Notice kind="info">
        Passwords are generated on your device with your browser’s secure random number generator. They aren’t stored or sent anywhere, and they disappear when you leave or clear the page. The strength figure is an estimate.
      </Notice>
    </div>
  );
}
