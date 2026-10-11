import Link from "next/link";
import CommandPalette from "./CommandPalette";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const linkClass = "hidden rounded-md px-2.5 py-2 text-sm text-muted hover:text-ink sm:block";

export default function Navbar() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Logo />
        </div>
        <nav aria-label="Main" className="flex items-center gap-1">
          <CommandPalette />
          <Link href="/#tools" className={linkClass}>
            All tools
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
