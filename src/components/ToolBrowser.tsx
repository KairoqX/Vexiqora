"use client";

import { useState } from "react";
import { Search, Star } from "lucide-react";
import Button from "./Button";
import ToolCard from "./ToolCard";
import { matchesTool } from "@/lib/search";
import { FAVORITES_KEY, RECENT_KEY, clearRecent, toggleFavorite } from "@/lib/storage";
import { categoryOrder, tools, type Tool, type ToolCategory } from "@/lib/tools";
import { useList } from "@/lib/useList";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isTool = (tool: Tool | undefined): tool is Tool => tool !== undefined;
const bySlug = (slugs: string[]) => slugs.map((slug) => tools.find((t) => t.slug === slug)).filter(isTool);

function ToolGrid({ list, favorites }: { list: Tool[]; favorites: string[] }) {
  return (
    <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((tool) => {
        const isFavorite = favorites.includes(tool.slug);
        return (
          <li key={tool.slug} className="relative">
            <ToolCard tool={tool} />
            {/* A sibling of the card link (not inside it), so the page has no button nested in a link. */}
            <button
              type="button"
              onClick={() => toggleFavorite(tool.slug)}
              aria-pressed={isFavorite}
              aria-label={`${isFavorite ? "Remove" : "Add"} ${tool.name} ${isFavorite ? "from" : "to"} favorites`}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-ink"
            >
              <Star size={16} className={isFavorite ? "fill-current text-accent-text" : ""} aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// The search box, category filters and tool list live together because the list depends on both.
export default function ToolBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const favorites = useList(FAVORITES_KEY);
  const recent = useList(RECENT_KEY);

  const needle = query.trim();
  const matches = tools.filter((tool) => (category === "all" || tool.category === category) && matchesTool(tool, needle));
  const showPersonal = needle === "" && category === "all";
  const favoriteTools = showPersonal ? bySlug(favorites) : [];
  const recentTools = showPersonal ? bySlug(recent).slice(0, 4) : [];

  return (
    <div id="tools" className="scroll-mt-6">
      <div className="relative max-w-xl">
        <label htmlFor="tool-search" className="sr-only">
          Search tools
        </label>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id="tool-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, for example “json”, “color” or “password”"
          autoComplete="off"
          className="h-12 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-base text-ink placeholder:text-muted"
        />
      </div>

      <div role="group" aria-label="Filter by category" className="mt-4 flex flex-wrap gap-2">
        {(["all", ...categoryOrder] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => setCategory(value)}
            className={`min-h-9 rounded-full border px-3.5 text-sm font-medium ${
              category === value ? "border-accent bg-accent-soft text-accent-text" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {value === "all" ? "All" : value}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-muted" role="status">
        {needle === "" && category === "all" ? `${tools.length} tools` : `${matches.length} of ${tools.length} tools`}
      </p>

      {favoriteTools.length > 0 && (
        <section aria-labelledby="favorites-heading" className="mt-8">
          <h2 id="favorites-heading" className="text-sm font-semibold text-muted">Favorites</h2>
          <ToolGrid list={favoriteTools} favorites={favorites} />
        </section>
      )}

      {recentTools.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-heading" className="text-sm font-semibold text-muted">Recently used</h2>
            <Button variant="ghost" className="min-h-8 px-2 text-xs" onClick={clearRecent}>
              Clear recent
            </Button>
          </div>
          <ToolGrid list={recentTools} favorites={favorites} />
        </section>
      )}

      {matches.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-medium">No tools match{needle ? ` “${needle}”` : " this filter"}.</p>
          <p className="mt-1 text-sm text-muted">Try a shorter word, or clear the search and filter to see every tool.</p>
          <Button
            className="mt-4"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Clear search and filter
          </Button>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {categoryOrder.map((cat) => {
            const inCategory = matches.filter((tool) => tool.category === cat);
            if (inCategory.length === 0) return null;
            return (
              <section key={cat} aria-labelledby={`category-${slugify(cat)}`}>
                <h2 id={`category-${slugify(cat)}`} className="text-sm font-semibold text-muted">
                  {cat}
                </h2>
                <ToolGrid list={inCategory} favorites={favorites} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
