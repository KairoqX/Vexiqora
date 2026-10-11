import type { ReactNode } from "react";
import Link from "next/link";
import { examples } from "@/lib/examples";
import { absoluteUrl } from "@/lib/site";
import ToolActions from "./ToolActions";
import { toolPath, toolsInCategory, type Tool } from "@/lib/tools";

// Shared page frame for every tool: heading, the tool itself, then helpful written content.
export default function ToolLayout({ tool, children }: { tool: Tool; children: ReactNode }) {
  // Related tools: the others in the same category (the full list is on the homepage and in the footer).
  const others = toolsInCategory(tool.category).filter((t) => t.slug !== tool.slug);
  const example = examples[tool.slug];

  // Structured data helps search engines understand the page. It contains no ratings or reviews.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.seoDescription,
    url: absoluteUrl(toolPath(tool)),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-ink">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/#tools" className="hover:text-ink">Tools</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">{tool.name}</li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{tool.name}</h1>
        <ToolActions slug={tool.slug} name={tool.name} />
      </div>
      <p className="mt-2 max-w-2xl text-muted">{tool.summary} Everything runs in your browser, so your input isn’t uploaded.</p>

      <div className="mt-8">{children}</div>

      <div className="mt-16 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="how-to">
          <h2 id="how-to" className="text-xl font-semibold">How to use the {tool.name}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink marker:text-muted">
            {tool.howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {example && (
            <section aria-labelledby="example" className="mt-8">
              <h2 id="example" className="text-xl font-semibold">Example</h2>
              <p className="mt-3 max-w-prose text-ink">{example.description}</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: example.inputLabel, text: example.input },
                  { label: example.outputLabel, text: example.output },
                ].map((block) => (
                  <figure key={block.label}>
                    <figcaption className="mb-1.5 text-sm font-medium text-muted">{block.label}</figcaption>
                    {/* tabIndex lets keyboard users scroll long lines. */}
                    <pre
                      tabIndex={0}
                      aria-label={block.label}
                      className="overflow-x-auto rounded-md border border-line bg-surface p-3 font-mono text-sm leading-relaxed"
                    >
                      {block.text}
                    </pre>
                  </figure>
                ))}
              </div>
            </section>
          )}
          <h2 className="mt-8 text-xl font-semibold">About this tool</h2>
          <p className="mt-3 max-w-prose text-ink">{tool.about}</p>
        </section>

        <div>
          <section aria-labelledby="good-to-know">
            <h2 id="good-to-know" className="text-xl font-semibold">Good to know</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-muted">
              {tool.goodToKnow.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="more-tools" className="mt-8">
            <h2 id="more-tools" className="text-xl font-semibold">Related tools</h2>
            <ul className="mt-4 space-y-2">
              {others.length === 0 && <li className="text-muted">There are no other tools in this category yet.</li>}
              {others.map((t) => (
                <li key={t.slug}>
                  <Link href={toolPath(t)} className="font-medium text-accent-text underline underline-offset-4 hover:text-ink">
                    {t.name}
                  </Link>
                  <span className="text-muted"> – {t.summary}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link href="/#tools" className="font-medium text-accent-text underline underline-offset-4 hover:text-ink">
                Browse all tools
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
