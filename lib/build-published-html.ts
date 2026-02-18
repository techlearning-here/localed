import ejs from "ejs";
import { getCountryLabel } from "@/lib/countries";
import { PUBLISHED_SITE_TEMPLATE } from "@/lib/published-site-template";
import type { PublishedMeta, SiteContent } from "@/lib/types/site";

const DEFAULT_DESCRIPTION_MAX_LENGTH = 160;

/** Site row shape sufficient to recreate published HTML from table data. */
export type SiteRowForRecreate = {
  slug: string;
  languages?: string[] | null;
  published_content?: SiteContent | null;
  draft_content: SiteContent;
};

export type BuildPublishedHtmlOptions = {
  /** Content for the primary locale (e.g. en) */
  content: Record<string, unknown>;
  siteSlug: string;
  /** Base URL of the main app (e.g. https://localed.info) for form action and canonical */
  siteBaseUrl: string;
};

/**
 * Builds full static HTML from a site row. Table stores just enough to recreate: draft_content (and path + meta).
 * Uses published_content when set (fallback mode), otherwise draft_content.
 */
export function buildPublishedPageHtmlFromSite(
  site: SiteRowForRecreate,
  siteBaseUrl: string
): { html: string; meta: PublishedMeta } {
  const locale = (site.languages?.[0] ?? "en") as string;
  const contentSource = site.published_content ?? site.draft_content;
  const content = (contentSource?.[locale] ?? contentSource?.en ?? {}) as Record<string, unknown>;
  return buildPublishedPageHtml({
    content,
    siteSlug: site.slug,
    siteBaseUrl,
  });
}

/**
 * View data passed to the EJS published-site template. All values are safe for HTML (EJS escapes <%= %>).
 */
function buildTemplateView(
  content: Record<string, unknown>,
  siteSlug: string,
  siteBaseUrl: string
): { view: Record<string, unknown>; meta: PublishedMeta } {
  const base = siteBaseUrl.replace(/\/$/, "");
  const businessName =
    String(content.businessName || "").trim() || siteSlug || "Site";
  const tagline = typeof content.tagline === "string" ? content.tagline.trim() : "";
  const shortDescription =
    typeof content.shortDescription === "string"
      ? content.shortDescription.trim().slice(0, DEFAULT_DESCRIPTION_MAX_LENGTH)
      : "";
  const heroImage = typeof content.heroImage === "string" ? content.heroImage.trim() : "";
  const logo = typeof content.logo === "string" ? content.logo.trim() : "";
  const ogImage = heroImage || logo || undefined;
  const favicon = typeof content.favicon === "string" ? content.favicon.trim() : logo || "";
  const canonicalUrl = `${base}/${siteSlug}`;
  const contactFormAction = `${base}/api/sites/${siteSlug}/contact`;

  const meta: PublishedMeta = {
    title: tagline ? `${businessName} — ${tagline}` : businessName,
    description: shortDescription || undefined,
    ogImage: ogImage ?? undefined,
  };

  const about = typeof content.about === "string" ? content.about : "";
  const yearEstablished =
    typeof content.yearEstablished === "string" ? content.yearEstablished : "";
  const address = typeof content.address === "string" ? content.address : "";
  const countryCode = typeof content.country === "string" ? content.country : "";
  const country = countryCode ? getCountryLabel(countryCode) : "";
  const areaServed = typeof content.areaServed === "string" ? content.areaServed : "";
  const phone = typeof content.phone === "string" ? content.phone : "";
  const email = typeof content.email === "string" ? content.email : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const whatsAppHref = whatsApp
    ? whatsApp.startsWith("http")
      ? whatsApp
      : `https://wa.me/${whatsApp.replace(/\D/g, "")}`
    : "";
  const businessHours =
    typeof content.businessHours === "string" ? content.businessHours : "";
  const specialHours =
    typeof content.specialHours === "string" ? content.specialHours : "";
  const timezone = typeof content.timezone === "string" ? content.timezone : "";
  const timezoneLabel = timezone ? timezone.replace(/_/g, " ") : "";
  const galleryUrls = Array.isArray(content.galleryUrls)
    ? content.galleryUrls.filter((u): u is string => typeof u === "string")
    : [];
  const youtubeUrls = Array.isArray(content.youtubeUrls)
    ? content.youtubeUrls.filter((u): u is string => typeof u === "string")
    : [];
  const youtubeEmbeds = youtubeUrls
    .map((url) => {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
      return id ? { src: `https://www.youtube.com/embed/${id}` } : null;
    })
    .filter((e): e is { src: string } => e !== null);

  const hasContact = !!(address || country || areaServed || phone || email || whatsAppHref);
  const hasHours = !!(businessHours || specialHours || timezone);

  const view: Record<string, unknown> = {
    meta,
    canonicalUrl,
    favicon: favicon || undefined,
    logo: logo || undefined,
    businessName,
    heroImage: heroImage || undefined,
    shortDescription: shortDescription || undefined,
    about: about || undefined,
    yearEstablished: yearEstablished || undefined,
    hasContact,
    address: address || undefined,
    country: country || undefined,
    areaServed: areaServed || undefined,
    phone: phone || undefined,
    email: email || undefined,
    whatsAppHref: whatsAppHref || undefined,
    hasHours,
    timezone: timezone || undefined,
    timezoneLabel,
    businessHours: businessHours || undefined,
    specialHours: specialHours || undefined,
    galleryUrls,
    youtubeEmbeds,
    contactFormAction,
  };
  return { view, meta };
}

/**
 * Builds full static HTML for a published site and minimal meta for DB/redirect page.
 * Uses EJS template; all user content is escaped by EJS.
 */
export function buildPublishedPageHtml(
  options: BuildPublishedHtmlOptions
): { html: string; meta: PublishedMeta } {
  const { content, siteSlug, siteBaseUrl } = options;
  const { view, meta } = buildTemplateView(content, siteSlug, siteBaseUrl);
  const html = ejs.render(PUBLISHED_SITE_TEMPLATE, view);
  return { html, meta };
}
