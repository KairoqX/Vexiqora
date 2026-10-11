"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { decodeJwt } from "@/lib/jwt";
import { samples } from "@/lib/samples";

export default function JwtTool() {
  const [token, setToken] = useState("");
  const result = useMemo(() => (token.trim() === "" ? null : decodeJwt(token)), [token]);

  return (
    <div className="space-y-4">
      <Notice kind="info">
        <strong>Decoding only.</strong> This tool reads a token but does <strong>not</strong> verify its signature, so it can’t tell you whether the token is genuine or has been tampered with. Don’t rely on what a token says unless a server has verified it.
      </Notice>

      <TextArea label="JSON Web Token" value={token} onChange={setToken} rows={6} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" hint="Pasted tokens stay in your browser. Treat real tokens like passwords: prefer expired or test tokens." />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setToken(samples.jwt)}>Load sample</Button>
        <Button variant="ghost" onClick={() => setToken("")} disabled={token === ""}>Clear</Button>
      </div>

      {result && !result.ok && <Notice kind="error">{result.error}</Notice>}

      {result?.ok && (
        <div className="space-y-4">
          {result.warnings.map((warning) => (
            <Notice key={warning} kind="error">{warning}</Notice>
          ))}

          {result.claims.length > 0 && (
            <section aria-labelledby="claims-heading">
              <h2 id="claims-heading" className="text-lg font-semibold">Time claims</h2>
              <dl className="mt-2 divide-y divide-line rounded-md border border-line bg-surface">
                {result.claims.map((claim) => (
                  <div key={claim.label} className="px-3 py-2">
                    <dt className="text-xs text-muted">{claim.label}</dt>
                    <dd className="break-words font-mono text-sm">{claim.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-1 text-xs text-muted">Times are compared with your device’s clock.</p>
            </section>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <TextArea label="Header" value={result.headerJson} readOnly rows={8} />
              <CopyButton text={result.headerJson} label="Copy header" />
            </div>
            <div className="space-y-2">
              <TextArea label="Payload" value={result.payloadJson} readOnly rows={8} />
              <CopyButton text={result.payloadJson} label="Copy payload" />
            </div>
          </div>
          <TextArea label="Signature (not verified)" value={result.signature || "(empty)"} readOnly rows={2} />
        </div>
      )}
    </div>
  );
}
