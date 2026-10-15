"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// A black-and-white switch for the light and dark theme. The theme is just a "dark" class on the
// <html> element; the colours for each theme are defined in globals.css.
// The first visit follows your device setting; after you click, your choice is remembered in this
// browser (see the Privacy page).
export default function ThemeToggle() {
  // null until the page has loaded in the browser, because the server can't know the theme.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage can be blocked (for example in private browsing). The theme still changes.
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark === true}
      aria-label="Dark theme"
      title="Toggle dark theme"
      onClick={toggle}
      className="inline-flex h-8 w-[3.75rem] shrink-0 items-center rounded-full border-2 border-ink bg-ink p-0.5"
    >
      {/* The knob slides right in dark mode. Both icons are in the page and CSS shows the right
          one, so there is no flash on load. */}
      <span className="pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-canvas text-ink transition-transform duration-200 dark:translate-x-7">
        <Sun size={14} aria-hidden className="dark:hidden" />
        <Moon size={14} aria-hidden className="hidden dark:block" />
      </span>
    </button>
  );
}
