// Tool search, shared by the homepage and the Ctrl+K command palette.

export interface Searchable {
  slug: string;
  name: string;
  summary: string;
  category: string;
  keywords?: string[];
}

export function matchesTool(tool: Searchable, query: string): boolean {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = `${tool.name} ${tool.summary} ${tool.category} ${(tool.keywords ?? []).join(" ")}`.toLowerCase();
  return words.every((w) => haystack.includes(w)); // every typed word must appear somewhere
}

/** Filters, then orders: name matches first, then favorites, then recently used tools. */
export function rankTools<T extends Searchable>(tools: T[], query: string, favorites: string[] = [], recent: string[] = []): T[] {
  const q = query.trim().toLowerCase();
  const score = (tool: T) => {
    let s = 0;
    const name = tool.name.toLowerCase();
    if (q !== "") s += name.startsWith(q) ? 30 : name.includes(q) ? 20 : 0;
    if (favorites.includes(tool.slug)) s += 10;
    const recentIndex = recent.indexOf(tool.slug);
    if (recentIndex >= 0) s += Math.max(1, 6 - recentIndex);
    return s;
  };
  return tools
    .map((tool, index) => ({ tool, index, score: score(tool) }))
    .filter(({ tool }) => matchesTool(tool, query))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ tool }) => tool);
}
