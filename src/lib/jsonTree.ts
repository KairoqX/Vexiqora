// Helpers for the JSON Tree Viewer.

export type NodeKind = "object" | "array" | "string" | "number" | "boolean" | "null";

/** Very large objects and arrays show only this many children, to keep the page responsive. */
export const MAX_CHILDREN = 500;

export function kindOf(value: unknown): NodeKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    default:
      return "object";
  }
}

export function preview(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} ${value.length === 1 ? "item" : "items"}]`;
  if (value !== null && typeof value === "object") {
    const count = Object.keys(value).length;
    return `{${count} ${count === 1 ? "key" : "keys"}}`;
  }
  return formatPrimitive(value);
}

export function formatPrimitive(value: unknown): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

export interface TreeChild {
  key: string;
  value: unknown;
}

export function childrenOf(value: unknown): { children: TreeChild[]; hidden: number } {
  let entries: TreeChild[];
  if (Array.isArray(value)) entries = value.map((v, i) => ({ key: String(i), value: v }));
  else if (value !== null && typeof value === "object") entries = Object.entries(value).map(([key, v]) => ({ key, value: v }));
  else entries = [];
  return { children: entries.slice(0, MAX_CHILDREN), hidden: Math.max(0, entries.length - MAX_CHILDREN) };
}
