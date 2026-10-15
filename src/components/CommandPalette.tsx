"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { rankTools } from "@/lib/search";
import { FAVORITES_KEY, RECENT_KEY } from "@/lib/storage";
import { toolPath, tools, type Tool } from "@/lib/tools";
import { useList } from "@/lib/useList";

// The Ctrl+K / Cmd+K search window. It uses the browser's built-in <dialog> element, which
// handles focus trapping, the Escape key and the dimmed backdrop for us.
export default function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const favorites = useList(FAVORITES_KEY);
  const recent = useList(RECENT_KEY);

  const results = useMemo(() => rankTools(tools, query, favorites, recent), [query, favorites, recent]);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  // Ctrl+K or Cmd+K opens (or closes) the palette from anywhere on the site.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (dialog.open) {
          dialog.close();
        } else {
          setQuery("");
          setActive(0);
          dialog.showModal();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Keep the highlighted result visible while arrowing through a long list.
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  function open() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    dialog.showModal();
  }

  function go(tool: Tool) {
    router.push(toolPath(tool));
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search tools"
        aria-keyshortcuts="Control+K Meta+K"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm text-muted hover:bg-canvas hover:text-ink"
      >
        <Search size={16} aria-hidden />
        <span className="hidden sm:inline">Search tools</span>
        <kbd className="hidden rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-xs md:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search tools"
        onClick={(event) => {
          // Clicking the dimmed area outside the window closes it.
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed left-1/2 top-[10vh] m-0 w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-black/50"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={18} className="shrink-0 text-muted" aria-hidden />
          <input
            type="text"
            role="combobox"
            aria-label="Search tools"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                if (results.length === 0) return;
                setActive((i) => (e.key === "ArrowDown" ? (i + 1) % results.length : (i - 1 + results.length) % results.length));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const tool = results[active];
                if (tool) go(tool);
              }
            }}
            placeholder="Search tools…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-base text-ink placeholder:text-muted"
          />
        </div>

        {results.length === 0 ? (
          <p role="status" className="p-6 text-center text-sm text-muted">
            No tools match “{query.trim()}”.
          </p>
        ) : (
          <ul id={listId} role="listbox" aria-label="Tools" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <li
                  key={tool.slug}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => go(tool)}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 ${index === active ? "bg-accent-soft" : ""}`}
                >
                  <Icon size={18} className="shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{tool.name}</span>
                    <span className="block truncate text-xs text-muted">{tool.category}</span>
                  </span>
                  {favorites.includes(tool.slug) && <Star size={14} className="shrink-0 fill-current text-accent-text" aria-label="Favorite" />}
                </li>
              );
            })}
          </ul>
        )}

        <p className="border-t border-line px-3 py-2 text-xs text-muted">↑ ↓ to move · Enter to open · Esc to close</p>
      </dialog>
    </>
  );
}
