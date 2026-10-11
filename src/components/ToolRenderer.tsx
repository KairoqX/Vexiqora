"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

function ToolLoading() {
  return (
    <div role="status" className="rounded-lg border border-line bg-surface p-8 text-center text-sm text-muted">
      Loading tool…
    </div>
  );
}

// Each tool is loaded only when its page is opened ("lazy loading"), so visiting one tool
// never downloads the code for the other twenty-two.

const registry: Record<string, ComponentType> = {
  "json-formatter": dynamic(() => import("./tools/JsonTool"), { loading: ToolLoading }),
  "json-minifier": dynamic(() => import("./tools/JsonMinifierTool"), { loading: ToolLoading }),
  "json-tree-viewer": dynamic(() => import("./tools/JsonTreeTool"), { loading: ToolLoading }),
  "json-csv": dynamic(() => import("./tools/JsonCsvTool"), { loading: ToolLoading }),
  "url-encoder": dynamic(() => import("./tools/UrlTool"), { loading: ToolLoading }),
  "html-entities": dynamic(() => import("./tools/HtmlEntitiesTool"), { loading: ToolLoading }),
  base64: dynamic(() => import("./tools/Base64Tool"), { loading: ToolLoading }),
  "timestamp-converter": dynamic(() => import("./tools/TimestampTool"), { loading: ToolLoading }),
  "http-status-codes": dynamic(() => import("./tools/HttpStatusTool"), { loading: ToolLoading }),
  "jwt-decoder": dynamic(() => import("./tools/JwtTool"), { loading: ToolLoading }),
  "regex-tester": dynamic(() => import("./tools/RegexTool"), { loading: ToolLoading }),
  "markdown-editor": dynamic(() => import("./tools/MarkdownTool"), { loading: ToolLoading }),
  "case-converter": dynamic(() => import("./tools/CaseTool"), { loading: ToolLoading }),
  "word-counter": dynamic(() => import("./tools/CounterTool"), { loading: ToolLoading }),
  "text-diff": dynamic(() => import("./tools/DiffTool"), { loading: ToolLoading }),
  "color-converter": dynamic(() => import("./tools/ColorTool"), { loading: ToolLoading }),
  "gradient-generator": dynamic(() => import("./tools/GradientTool"), { loading: ToolLoading }),
  "box-shadow-generator": dynamic(() => import("./tools/BoxShadowTool"), { loading: ToolLoading }),
  "border-radius-generator": dynamic(() => import("./tools/BorderRadiusTool"), { loading: ToolLoading }),
  "password-generator": dynamic(() => import("./tools/PasswordTool"), { loading: ToolLoading }),
  "uuid-generator": dynamic(() => import("./tools/UuidTool"), { loading: ToolLoading }),
  "lorem-ipsum": dynamic(() => import("./tools/LoremTool"), { loading: ToolLoading }),
  "random-number": dynamic(() => import("./tools/RandomNumberTool"), { loading: ToolLoading }),
};

export default function ToolRenderer({ slug }: { slug: string }) {
  const Tool = registry[slug];
  return Tool ? <Tool /> : null;
}
