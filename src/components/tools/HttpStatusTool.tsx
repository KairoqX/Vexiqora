"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Button from "../Button";
import { classOf, filterStatuses, httpStatuses, statusClasses, statusClassNames, type StatusClass } from "@/lib/httpStatus";

export default function HttpStatusTool() {
  const [query, setQuery] = useState("");
  const [statusClass, setStatusClass] = useState<StatusClass | "all">("all");
  const list = filterStatuses(httpStatuses, query, statusClass);

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <label htmlFor="status-search" className="sr-only">Search status codes</label>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id="status-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, name or meaning, for example 404 or redirect"
          autoComplete="off"
          className="h-11 w-full rounded-md border border-line-strong bg-surface pl-10 pr-3 text-base placeholder:text-muted"
        />
      </div>

      <div role="group" aria-label="Filter by class" className="flex flex-wrap gap-2">
        {(["all", ...statusClasses] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={statusClass === value}
            onClick={() => setStatusClass(value)}
            title={value === "all" ? "All codes" : statusClassNames[value]}
            className={`min-h-9 rounded-full border px-3.5 text-sm font-medium ${
              statusClass === value ? "border-accent bg-accent-soft text-accent-text" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {value === "all" ? "All" : `${value} ${statusClassNames[value]}`}
          </button>
        ))}
      </div>

      <p role="status" className="text-sm text-muted">
        {list.length} of {httpStatuses.length} codes
      </p>

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-medium">No status codes match.</p>
          <p className="mt-1 text-sm text-muted">Try a different word, or clear the search and filter.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setQuery("");
              setStatusClass("all");
            }}
          >
            Clear search and filter
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {list.map((status) => (
            <li key={status.code} className="flex gap-4 px-4 py-3">
              <span className="w-14 shrink-0 font-mono text-lg font-semibold tabular-nums">{status.code}</span>
              <span className="min-w-0">
                <span className="block font-medium">
                  {status.name} <span className="ml-1 text-xs font-normal text-muted">{statusClassNames[classOf(status.code)]}</span>
                </span>
                <span className="mt-0.5 block text-sm text-muted">{status.description}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
