import Link from "next/link";
import { getRecommendedImageDimension } from "@/lib/image-dimensions";

export type PublicSiteHeaderProps = {
  siteSlug: string;
  businessName: string;
  logo?: string;
  tagline?: string;
  businessTypeLabel?: string;
  /** When "multi_page", show nav links to Home, About, Services, Contact */
  siteLayout?: "single_page" | "multi_page";
  /** For multi-page subpages: current page so we can highlight it in nav */
  currentPage?: "home" | "about" | "services" | "contact";
};

export function PublicSiteHeader({
  siteSlug,
  businessName,
  logo,
  tagline,
  businessTypeLabel,
  siteLayout,
  currentPage = "home",
}: PublicSiteHeaderProps) {
  const isMultiPage = siteLayout === "multi_page";
  const base = `/${siteSlug}`;
  const linkClass = (page: "home" | "about" | "services" | "contact") =>
    `text-sm font-medium ${currentPage === page ? "text-gray-900 underline" : "text-gray-600 hover:text-gray-900"}`;

  return (
    <header className="border-b p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user URL
          <img src={logo} alt="" className="h-10 max-h-10 w-auto object-contain" width={getRecommendedImageDimension("logo").width} height={getRecommendedImageDimension("logo").height} />
        ) : null}
        <div className="flex items-center gap-2 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{businessName}</h1>
            {tagline ? <p className="text-sm text-gray-600">{tagline}</p> : null}
          </div>
          {businessTypeLabel ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              {businessTypeLabel}
            </span>
          ) : null}
        </div>
      </div>
      {isMultiPage ? (
        <nav className="flex flex-wrap gap-4 border-t border-gray-100 pt-3" aria-label="Main">
          <Link href={base} className={linkClass("home")}>
            Home
          </Link>
          <Link href={`${base}/about`} className={linkClass("about")}>
            About
          </Link>
          <Link href={`${base}/services`} className={linkClass("services")}>
            Services
          </Link>
          <Link href={`${base}/contact`} className={linkClass("contact")}>
            Contact
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
