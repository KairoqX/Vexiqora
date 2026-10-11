"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import Button from "./Button";
import { FAVORITES_KEY, recordVisit, toggleFavorite } from "@/lib/storage";
import { useList } from "@/lib/useList";

// Shown on every tool page: remembers the visit (for "Recently used") and offers a favorite toggle.
// Only the tool's name is saved in this browser, never anything you type.
export default function ToolActions({ slug, name }: { slug: string; name: string }) {
  const favorites = useList(FAVORITES_KEY);
  const isFavorite = favorites.includes(slug);

  useEffect(() => {
    recordVisit(slug);
  }, [slug]);

  return (
    <Button onClick={() => toggleFavorite(slug)} aria-pressed={isFavorite} aria-label={`${isFavorite ? "Remove" : "Add"} ${name} ${isFavorite ? "from" : "to"} favorites`}>
      <Star size={16} className={isFavorite ? "fill-current" : ""} aria-hidden />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
}
