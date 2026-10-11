import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import ToolRenderer from "@/components/ToolRenderer";
import { buildMetadata } from "@/lib/metadata";
import { findTool, toolPath, tools } from "@/lib/tools";

// Every tool gets its own URL, /tools/<slug>, built ahead of time from the list in src/lib/tools.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) return {};
  return buildMetadata({ title: tool.seoTitle, description: tool.seoDescription, path: toolPath(tool) });
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = findTool(slug);
  if (!tool) notFound();
  return (
    <ToolLayout tool={tool}>
      <ToolRenderer slug={tool.slug} />
    </ToolLayout>
  );
}
