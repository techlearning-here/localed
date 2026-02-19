import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSiteHeader } from "@/components/public-site-header";
import { SinglePageSiteView } from "@/components/single-page-site-view";
import { buildPublicSiteMetadata } from "@/lib/build-public-meta";
import { getPublishedSiteUrl } from "@/lib/published-storage";
import { getRecommendedImageDimension } from "@/lib/image-dimensions";
import { parseSiteContentForDisplay } from "@/lib/parse-site-content";
import { getPublishedSiteBySlug } from "@/lib/sites";
import { getLayoutIdForTemplate } from "@/lib/template-catalog";

const PUBLIC_SITE_BASE =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "")
    : "";

/**
 * PUBLIC-02: Path-based published site at /[siteSlug]
 * PUBLIC-03: Meta and Open Graph for shared links.
 * When published to CDN (published_artifact_path), metadata uses published_meta.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) return { title: "Site" };
  if (site.published_artifact_path && site.published_meta) {
    const m = site.published_meta;
    return {
      title: m.title ?? site.slug,
      description: m.description ?? undefined,
      openGraph: {
        title: m.title ?? site.slug,
        description: m.description ?? undefined,
        url: PUBLIC_SITE_BASE ? `${PUBLIC_SITE_BASE}/${siteSlug}` : undefined,
        ...(m.ogImage && { images: [{ url: m.ogImage }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: m.title ?? site.slug,
        description: m.description ?? undefined,
        ...(m.ogImage && { images: [m.ogImage] }),
      },
      ...(m.ogImage && { icons: [{ url: m.ogImage, rel: "icon" }] }),
    };
  }
  if (!site.published_content) return { title: "Site" };
  const locale = site.languages?.[0] ?? "en";
  const content = (site.published_content[locale] ?? site.published_content.en ?? {}) as Record<string, unknown>;
  const businessName = String(content.businessName || "") || site.slug || "Site";
  const tagline = typeof content.tagline === "string" ? content.tagline : "";
  const favicon = typeof content.favicon === "string" ? content.favicon : typeof content.logo === "string" ? content.logo : undefined;

  const meta = buildPublicSiteMetadata(content, siteSlug, PUBLIC_SITE_BASE);
  return {
    ...meta,
    title: tagline ? `${businessName} — ${tagline}` : meta.title,
    icons: favicon ? [{ url: favicon, rel: "icon" }] : undefined,
  };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);
  if (!site) notFound();
  const cdnUrl = site.published_artifact_path
    ? getPublishedSiteUrl(site.published_artifact_path)
    : "";
  if (cdnUrl) {
    const proxyUrl = `/api/sites/${siteSlug}/published`;
    return (
      <div className="published-site-frame">
        <iframe
          src={proxyUrl}
          title={site.published_meta?.title ?? site.slug}
          className="published-site-iframe"
        />
      </div>
    );
  }
  if (!site.published_content) notFound();

  const locale = site.languages?.[0] ?? "en";
  const content = site.published_content[locale] ?? site.published_content.en ?? {};
  const contentRecord = content as Record<string, unknown>;
  const parsed = parseSiteContentForDisplay(contentRecord, {
    slug: site.slug ?? siteSlug,
    business_type: site.business_type ?? undefined,
    country: site.country ?? undefined,
  }, { siteBaseUrl: PUBLIC_SITE_BASE });
  const siteLayout = contentRecord.siteLayout === "multi_page" ? "multi_page" : "single_page";

  if (siteLayout === "multi_page") {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded bg-gray-900 px-3 py-2 text-white text-sm">
          Skip to content
        </a>
        {parsed.announcementBar ? (
          <div className="bg-gray-900 text-white text-center py-2 px-4 text-sm">{parsed.announcementBar}</div>
        ) : null}
        <PublicSiteHeader
          siteSlug={siteSlug}
          businessName={parsed.businessName}
          logo={parsed.logo || undefined}
          tagline={parsed.tagline || undefined}
          businessTypeLabel={parsed.businessTypeLabel || undefined}
          siteLayout="multi_page"
          currentPage="home"
        />
        {parsed.heroImage ? (
          <div className="w-full overflow-hidden aspect-[21/9] min-h-[12rem] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={parsed.heroImage} alt="" className="h-full w-full object-cover" width={getRecommendedImageDimension("hero").width} height={getRecommendedImageDimension("hero").height} />
          </div>
        ) : null}
        <div id="main-content" className="p-6">
          {parsed.shortDesc ? <p className="text-gray-600">{parsed.shortDesc}</p> : null}
          {parsed.hasCta ? (
            <p className="mt-4">
              <a href={parsed.ctaUrl} className="inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800" target="_blank" rel="noopener noreferrer">
                {parsed.ctaLabel}
              </a>
            </p>
          ) : null}
          {parsed.hasCta2 ? (
            <p className="mt-2">
              <a href={parsed.cta2Url} className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" target="_blank" rel="noopener noreferrer">
                {parsed.cta2Label}
              </a>
            </p>
          ) : null}
          {parsed.hasCta3 ? (
            <p className="mt-2">
              <a href={parsed.cta3Url} className="inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50" target="_blank" rel="noopener noreferrer">
                {parsed.cta3Label}
              </a>
            </p>
          ) : null}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Link href={`/${siteSlug}/about`} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h2 className="font-medium text-gray-900">About</h2>
              <p className="mt-1 text-sm text-gray-600">Learn about us</p>
            </Link>
            <Link href={`/${siteSlug}/services`} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h2 className="font-medium text-gray-900">Services</h2>
              <p className="mt-1 text-sm text-gray-600">What we offer</p>
            </Link>
            <Link href={`/${siteSlug}/contact`} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h2 className="font-medium text-gray-900">Contact</h2>
              <p className="mt-1 text-sm text-gray-600">Get in touch</p>
            </Link>
          </div>
          {parsed.showBackToTop ? (
            <p className="mt-6 text-center">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Back to top</a>
            </p>
          ) : null}
          {(parsed.footerText || parsed.customDomainDisplay || parsed.legalName) ? (
            <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
              {parsed.footerText ? <p>{parsed.footerText}</p> : null}
              {parsed.customDomainDisplay ? <p>{parsed.customDomainDisplay}</p> : null}
              {parsed.legalName ? <p>Legal name: {parsed.legalName}</p> : null}
            </footer>
          ) : null}
        </div>
      </main>
    );
  }

  const layoutId = getLayoutIdForTemplate(site.template_id ?? "");
  return <SinglePageSiteView parsed={parsed} siteSlug={siteSlug} layoutId={layoutId} />;

}
