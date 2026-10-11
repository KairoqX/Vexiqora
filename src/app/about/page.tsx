import Link from "next/link";
import PageShell from "@/components/PageShell";
import { buildMetadata } from "@/lib/metadata";
import { categoryOrder, toolPath, tools, toolsInCategory } from "@/lib/tools";

export const metadata = buildMetadata({
  title: "About",
  description: "Vexiqora is a free set of developer tools that run in your browser. Learn what it offers and how it is built.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell title="About Vexiqora" intro="A free toolbox for everyday developer tasks.">
      <p>
        Vexiqora collects the small tools people often need while coding or writing: formatting and converting JSON, decoding tokens, testing regular expressions, converting colors, generating passwords and more. Each tool has its own page, so you can bookmark the ones you use, mark favorites, and jump to any tool with Ctrl+K (or Cmd+K on a Mac).
      </p>
      <h2>How it’s built</h2>
      <p>
        Vexiqora is a Next.js website. The tools run as JavaScript in your browser, which is why they are fast and why your input isn’t sent to a server. Each tool’s code is loaded only when you open that tool, to keep pages light.
      </p>
      <h2>What’s included today ({tools.length} tools)</h2>
      {categoryOrder.map((category) => (
        <div key={category}>
          <h3 className="font-medium">{category}</h3>
          <ul className="mt-2">
            {toolsInCategory(category).map((tool) => (
              <li key={tool.slug}>
                <Link href={toolPath(tool)}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p>
        Questions or ideas? See the <Link href="/contact">contact page</Link>. To understand how your data is handled, read the <Link href="/privacy">privacy page</Link>.
      </p>
    </PageShell>
  );
}
