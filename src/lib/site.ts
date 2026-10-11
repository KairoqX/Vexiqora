// The one place that holds site-wide settings.
// The production domain is set here. To use a different domain later, set the
// NEXT_PUBLIC_SITE_URL environment variable (see .env.example); it overrides this default.

const DEFAULT_URL = "https://vexiqora.vercel.app";

/**
 * Turns the NEXT_PUBLIC_SITE_URL setting into a clean address like "https://example.com".
 * A missing "https://" is added. If the value is unusable (for example a typo such as
 * "https//:example.com"), a warning is printed and the default is used, so one typo
 * can't break the whole build.
 */
export function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_URL;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    // A real address has a dot in its host name (or is localhost). This rejects typos like "https//:x.com".
    if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") throw new Error("bad host");
    return parsed.origin; // drops any trailing slash or path
  } catch {
    console.warn(`NEXT_PUBLIC_SITE_URL is not a valid address ("${value}"). Using ${DEFAULT_URL} instead.`);
    return DEFAULT_URL;
  }
}

export const siteConfig = {
  name: "Vexiqora",
  tagline: "Free Online Developer Tools",
  // Title of the homepage. Other pages use "<Page title> — Vexiqora".
  homeTitle: "Vexiqora — Free Online Developer Tools",
  titleSeparator: " — ",
  description:
    "Free online developer tools for working with JSON, text, encodings, colors and more. Everything runs in your browser, and your input isn’t uploaded.",

  // Production URL, without a trailing slash. Everything else is built from this.
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),

  // Only fill these in with real values. Nothing is shown or output while they are empty.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  socialProfiles: [] as string[], // for example: ["https://github.com/your-name/vexiqora"]
  twitterHandle: "", // for example: "@yourhandle"
  // Optional: the verification code Google Search Console gives you for the "HTML tag" method.
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "",

  // The social-sharing image lives in /public.
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Vexiqora: free online developer tools that run in your browser",
  },
};

/** Builds a full URL from a path such as "/tools/base64". */
export function absoluteUrl(path = "/"): string {
  // The homepage keeps its trailing slash so it matches the canonical URL Next.js generates.
  return `${siteConfig.url}${path}`;
}

/**
 * Whether search engines should be allowed to index this deployment.
 * Vercel "Preview" deployments (test copies of your site) are kept out of search results,
 * so they never compete with the real site.
 */
export const isIndexable = process.env.VERCEL_ENV !== "preview";
