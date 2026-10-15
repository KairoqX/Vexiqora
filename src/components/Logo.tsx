import Link from "next/link";
import { LOGO_MARK } from "@/lib/logoMark";
import { siteConfig } from "@/lib/site";

const HEIGHT = 28; // the mark's height in pixels; the width follows its proportions

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-md text-ink" aria-label={`${siteConfig.name} home`}>
      {/* currentColor makes the mark black on the light theme and white on the dark theme. */}
      <svg
        viewBox={`0 0 ${LOGO_MARK.width} ${LOGO_MARK.height}`}
        width={Math.round((HEIGHT * LOGO_MARK.width) / LOGO_MARK.height)}
        height={HEIGHT}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={LOGO_MARK.d} />
      </svg>
      <span className="text-xl font-bold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
