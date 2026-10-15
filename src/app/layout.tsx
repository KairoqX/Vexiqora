import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { isIndexable, siteConfig } from "@/lib/site";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from your own site,
// so visitors’ browsers don’t contact Google.
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono", display: "swap" });

// Runs before the page is drawn: use the saved theme, or else the device's light/dark setting.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

// Colours the browser's address bar on phones to match the page.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  // All relative URLs in metadata (canonical links, Open Graph) are built from this.
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.homeTitle, template: `%s${siteConfig.titleSeparator}${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Search engines may index the site only once a real domain is configured (see lib/site.ts).
  robots: isIndexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false },
  ...(siteConfig.googleSiteVerification ? { verification: { google: siteConfig.googleSiteVerification } } : {}),
  // Icons come from the files in src/app: favicon.ico, icon.svg and apple-icon.png.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
