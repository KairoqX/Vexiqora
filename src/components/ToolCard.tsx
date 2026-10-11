import Link from "next/link";
import { toolPath, type Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={toolPath(tool)}
      className="group flex h-full gap-4 rounded-lg border border-line bg-surface p-4 shadow-sm hover:border-accent"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-canvas text-ink group-hover:bg-accent-soft group-hover:text-accent-text">
        <Icon size={20} aria-hidden />
      </span>
      {/* The right padding leaves room for the favorite star that sits on top of the card. */}
      <span className="min-w-0 pr-8">
        <h3 className="font-semibold text-ink">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted">{tool.summary}</p>
      </span>
    </Link>
  );
}
