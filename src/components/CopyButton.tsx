"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import Button from "./Button";

interface CopyButtonProps {
  text: string;
  label?: string;
  /** A more specific name for screen readers when a page has several Copy buttons. */
  ariaLabel?: string;
}

// "use client" means this component runs in the browser, which it needs
// because copying uses the browser's clipboard.
export default function CopyButton({ text, label = "Copy", ariaLabel }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the pending timer if the component disappears.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <>
      <Button onClick={handleCopy} disabled={text === ""} aria-label={ariaLabel}>
        {status === "copied" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {status === "copied" ? "Copied" : label}
      </Button>
      <span className="sr-only" role="status">
        {status === "copied" && "Copied to clipboard."}
        {status === "failed" && "Copy failed. Select the text and copy it manually."}
      </span>
      {status === "failed" && (
        <span className="text-sm text-danger" aria-hidden>
          Copy blocked by the browser
        </span>
      )}
    </>
  );
}
