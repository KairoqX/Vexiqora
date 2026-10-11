"use client";

import { useSyncExternalStore } from "react";
import { getList, subscribe } from "./storage";

const EMPTY: string[] = [];

/** Reads a saved list (favorites or recents) and re-renders when it changes. */
export function useList(key: string): string[] {
  // The server has no local storage, so it (and the first browser render) sees an empty list.
  return useSyncExternalStore(subscribe, () => getList(key), () => EMPTY);
}
