import Link from "next/link";
import ToolBrowser from "@/components/ToolBrowser";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: siteConfig.homeTitle,
  description: siteConfig.description,
  path: "/",
});

const principles = [
  { title: "Runs in your browser", text: "The tools process what you paste on your own device. Vexiqora doesn’t upload it." },
  { title: "No account", text: "Open a tool and use it. There is nothing to sign up for." },
  { title: "Free to use", text: "The tools are free. There are no ads or tracking scripts in this version." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Developer tools that run in your browser
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Format JSON, decode a JWT, test a regex, convert colors, generate passwords and more. Your input stays on your device.
          </p>
          <div className="mt-8">
            <ToolBrowser />
          </div>
        </div>
      </section>

      <section aria-labelledby="principles" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 id="principles" className="text-xl font-semibold">How Vexiqora works</h2>
        <dl className="mt-6 grid gap-8 md:grid-cols-3">
          {principles.map((item) => (
            <div key={item.title} className="border-t border-line pt-4">
              <dt className="font-semibold">{item.title}</dt>
              <dd className="mt-2 text-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-muted">
          Read the full details on the{" "}
          <Link href="/privacy" className="font-medium text-accent-text underline underline-offset-4">
            privacy page
          </Link>
          .
        </p>
      </section>
    </>
  );
}
