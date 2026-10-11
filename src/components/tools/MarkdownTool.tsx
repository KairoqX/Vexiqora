"use client";

import { useMemo, useState } from "react";
import Button from "../Button";
import CopyButton from "../CopyButton";
import DownloadButton from "../DownloadButton";
import TextArea from "../TextArea";
import { renderMarkdown } from "@/lib/markdown";
import { samples } from "@/lib/samples";

export default function MarkdownTool() {
  const [markdown, setMarkdown] = useState("");
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => setMarkdown(samples.markdown)}>Load sample</Button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <CopyButton text={html} label="Copy HTML" />
          <DownloadButton filename="document.md" content={markdown} mimeType="text/markdown" label="Download .md" />
          <Button variant="ghost" onClick={() => setMarkdown("")} disabled={markdown === ""}>Clear</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TextArea label="Markdown" value={markdown} onChange={setMarkdown} rows={20} placeholder={"# A heading\n\nSome **bold** text and a [link](https://example.com)."} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 id="preview-heading" className="text-sm font-medium">Preview</h2>
          <div aria-labelledby="preview-heading" role="region" tabIndex={0} className="min-h-[18rem] overflow-auto rounded-md border border-line bg-surface p-4 lg:max-h-[32rem]">
            {markdown.trim() === "" ? (
              <p className="text-sm text-muted">The preview appears here as you type.</p>
            ) : (
              // Safe: src/lib/markdown.ts escapes all text and only ever produces a fixed set of tags.
              <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
