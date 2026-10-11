import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

interface NoticeProps {
  kind: "error" | "success" | "info";
  children: ReactNode;
}

const styles = {
  error: "border-danger/30 bg-danger-soft text-danger",
  success: "border-accent/30 bg-accent-soft text-accent-text",
  info: "border-line bg-canvas text-ink",
};

// Errors use role="alert" so screen readers announce them straight away.
export default function Notice({ kind, children }: NoticeProps) {
  const Icon = kind === "error" ? CircleAlert : kind === "success" ? CircleCheck : Info;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm ${styles[kind]}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
