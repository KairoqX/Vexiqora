import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { categoryOrder, toolPath, toolsInCategory } from "@/lib/tools";

const linkClass = "text-sm text-muted hover:text-ink";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold">{siteConfig.name}</p>
            <p className="mt-2 max-w-xs text-sm text-muted">Free developer tools that run in your browser. No account needed.</p>
          </div>
          <nav aria-label="About Vexiqora">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link href="/about" className={linkClass}>About</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
            </ul>
          </nav>
        </div>

        <nav aria-label="All tools" className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {categoryOrder.map((category) => (
            <div key={category}>
              <p className="text-sm font-medium">{category}</p>
              <ul className="mt-3 space-y-2">
                {toolsInCategory(category).map((tool) => (
                  <li key={tool.slug}>
                    <Link href={toolPath(tool)} className={linkClass}>
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
