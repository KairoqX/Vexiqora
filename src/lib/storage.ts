// Favorites and "recently used" tools, kept in this browser's local storage.
// Only tool names (slugs) are stored here, never anything you type into a tool.

export const FAVORITES_KEY = "vexiqora:favorites";
export const RECENT_KEY = "vexiqora:recent";
export const MAX_RECENT = 6;

// ---------- pure list helpers (easy to test) ----------
export function toggleInList(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Puts item first, removes duplicates, and keeps at most `max` entries. */
export function pushRecent(list: string[], item: string, max = MAX_RECENT): string[] {
  return [item, ...list.filter((x) => x !== item)].slice(0, max);
}

// ---------- a tiny shared store, so every component sees the same lists ----------
const state = new Map<string, string[]>();
const listeners = new Set<() => void>();

function load(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return []; // storage blocked or corrupted: start with an empty list
  }
}

export function getList(key: string): string[] {
  let list = state.get(key);
  if (!list) {
    list = load(key);
    state.set(key, list);
  }
  return list;
}

export function setList(key: string, list: string[]): void {
  state.set(key, list);
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Storage can be blocked (for example in private browsing). The list still works until reload.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    // Another tab changed a list: reload it.
    if (event.key && state.has(event.key)) {
      state.set(event.key, load(event.key));
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

export const toggleFavorite = (slug: string) => setList(FAVORITES_KEY, toggleInList(getList(FAVORITES_KEY), slug));
export const recordVisit = (slug: string) => setList(RECENT_KEY, pushRecent(getList(RECENT_KEY), slug));
export const clearRecent = () => setList(RECENT_KEY, []);
