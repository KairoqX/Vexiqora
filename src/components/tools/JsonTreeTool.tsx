"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import Notice from "../Notice";
import TextArea from "../TextArea";
import { childrenOf, formatPrimitive, kindOf, preview } from "@/lib/jsonTree";
import { parseJson } from "@/lib/json";
import { samples } from "@/lib/samples";

const MAX_DEPTH = 40; // stops absurdly deep documents from overflowing the page's call stack

const valueClass = {
  string: "text-accent-text",
  number: "text-ink",
  boolean: "font-semibold text-ink",
  null: "italic text-muted",
};

interface NodeProps {
  name: string | null;
  value: unknown;
  depth: number;
  /** true = open everything, false = close everything, undefined = open the first two levels. */
  expandAll: boolean | undefined;
}

// Objects and arrays use the browser's built-in <details> element, so they are keyboard accessible
// and screen readers announce them as expandable. Every value is drawn as plain text.
function TreeNode({ name, value, depth, expandAll }: NodeProps) {
  const kind = kindOf(value);
  const label = name === null ? null : (
    <span className="text-ink">
      {name}
      <span className="text-muted">: </span>
    </span>
  );

  if (kind !== "object" && kind !== "array") {
    return (
      <div className="break-words py-0.5 pl-5 font-mono text-sm">
        {label}
        <span className={valueClass[kind]}>{formatPrimitive(value)}</span>
      </div>
    );
  }

  if (depth >= MAX_DEPTH) {
    return <div className="py-0.5 pl-5 font-mono text-sm text-muted">{label}… nested too deeply to display</div>;
  }

  const { children, hidden } = childrenOf(value);
  return (
    <details open={expandAll ?? depth < 2} className="font-mono text-sm">
      <summary className="cursor-pointer rounded py-0.5 hover:bg-canvas">
        {label}
        <span className="text-muted">{preview(value)}</span>
      </summary>
      <div className="ml-2 border-l border-line pl-3">
        {children.map((child) => (
          <TreeNode key={child.key} name={child.key} value={child.value} depth={depth + 1} expandAll={expandAll} />
        ))}
        {hidden > 0 && <p className="py-0.5 pl-5 text-muted">… and {hidden.toLocaleString("en-US")} more not shown</p>}
      </div>
    </details>
  );
}

export default function JsonTreeTool() {
  const [input, setInput] = useState("");
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [version, setVersion] = useState(0); // changing the key rebuilds the tree with the new open/closed setting

  const parsed = useMemo(() => (input.trim() === "" ? null : parseJson(input)), [input]);

  function setAll(open: boolean) {
    setExpandAll(open);
    setVersion((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setAll(true)} disabled={!parsed?.ok}>Expand all</Button>
        <Button onClick={() => setAll(false)} disabled={!parsed?.ok}>Collapse all</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setInput(samples.json);
            setExpandAll(undefined);
            setVersion((n) => n + 1);
          }}
        >
          Load sample
        </Button>
        <Button variant="ghost" onClick={() => setInput("")} disabled={input === ""}>Clear</Button>
      </div>

      {parsed && !parsed.ok && <Notice kind="error">{parsed.error}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label="JSON input" value={input} onChange={setInput} rows={20} placeholder='{"name": "Vexiqora", "tools": [1, 2, 3]}' />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="text-sm font-medium" id="tree-heading">Tree</h2>
          <div aria-labelledby="tree-heading" role="region" tabIndex={0} className="min-h-[18rem] overflow-auto rounded-md border border-line bg-surface p-3 lg:max-h-[34rem]">
            {parsed?.ok ? (
              <TreeNode key={version} name={null} value={parsed.value} depth={0} expandAll={expandAll} />
            ) : (
              <p className="text-sm text-muted">{parsed ? "Fix the error above to see the tree." : "Paste JSON on the left and the tree appears here."}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
