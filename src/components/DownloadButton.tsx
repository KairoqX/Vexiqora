"use client";

import { Download } from "lucide-react";
import Button from "./Button";

interface DownloadButtonProps {
  filename: string;
  content: string;
  mimeType?: string;
  label?: string;
}

// Creates the file in your browser and saves it. Nothing is uploaded.
export default function DownloadButton({ filename, content, mimeType = "text/plain", label = "Download" }: DownloadButtonProps) {
  function download() {
    const url = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <Button onClick={download} disabled={content === ""}>
      <Download size={16} aria-hidden /> {label}
    </Button>
  );
}
