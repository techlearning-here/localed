import { getCountryLabel } from "@/lib/countries";
import type { PublishedMeta, SiteContent } from "@/lib/types/site";

/** Escape for HTML text/attribute context (Workers-safe; no eval). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

/** View shape for the published template (Workers-safe render, no eval). */
type PublishedView = ReturnType<typeof buildTemplateView>["view"];

/**
 * Renders the published site HTML from the view. No eval/code gen (Cloudflare Workers safe).
 */
function renderPublishedTemplate(view: PublishedView): string {
  const m = (view.meta ?? {}) as PublishedMeta;
  const title = escapeHtml(String(m.title ?? ""));
  const desc = m.description ? escapeHtml(m.description) : "";
  const canonical = (view.canonicalUrl as string) ?? "";
  const ogImage = m.ogImage ? escapeHtml(m.ogImage) : "";
  const favicon = (view.favicon as string) ?? "";
  const logo = (view.logo as string) ?? "";
  const businessName = escapeHtml(String(view.businessName ?? ""));
  const heroImage = (view.heroImage as string) ?? "";
  const shortDesc = (view.shortDescription as string) ?? "";
  const about = (view.about as string) ?? "";
  const yearEst = (view.yearEstablished as string) ?? "";
  const hasContact = Boolean(view.hasContact);
  const address = (view.address as string) ?? "";
  const country = (view.country as string) ?? "";
  const areaServed = (view.areaServed as string) ?? "";
  const phone = (view.phone as string) ?? "";
  const email = (view.email as string) ?? "";
  const whatsAppHref = (view.whatsAppHref as string) ?? "";
  const hasHours = Boolean(view.hasHours);
  const timezone = (view.timezone as string) ?? "";
  const timezoneLabel = (view.timezoneLabel as string) ?? "";
  const businessHours = (view.businessHours as string) ?? "";
  const specialHours = (view.specialHours as string) ?? "";
  const galleryUrls = (view.galleryUrls as string[]) ?? [];
  const youtubeEmbeds = (view.youtubeEmbeds as { src: string }[]) ?? [];
  const contactFormAction = escapeHtml(String(view.contactFormAction ?? ""));

  const parts: string[] = [];
  parts.push("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>", title, "</title>\n");
  if (desc) parts.push("  <meta name=\"description\" content=\"", desc, "\">\n");
  if (canonical) parts.push("  <link rel=\"canonical\" href=\"", escapeHtml(canonical), "\">\n");
  if (ogImage) parts.push("  <meta property=\"og:image\" content=\"", ogImage, "\">\n");
  parts.push("  <meta property=\"og:title\" content=\"", title, "\">\n");
  if (desc) parts.push("  <meta property=\"og:description\" content=\"", desc, "\">\n");
  if (canonical) parts.push("  <meta property=\"og:url\" content=\"", escapeHtml(canonical), "\">\n");
  parts.push("  <meta name=\"twitter:card\" content=\"summary_large_image\">\n");
  if (favicon) parts.push("  <link rel=\"icon\" href=\"", escapeHtml(favicon), "\">\n");
  parts.push("  <link href=\"https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css\" rel=\"stylesheet\" />\n</head>\n<body class=\"min-h-screen bg-white text-gray-900\">\n  <header class=\"border-b p-4 flex items-center gap-3\">\n");
  if (logo) parts.push("    <img src=\"", escapeHtml(logo), "\" alt=\"\" class=\"h-10 w-auto object-contain\" />\n");
  parts.push("    <h1 class=\"text-xl font-semibold\">", businessName, "</h1>\n  </header>\n");
  if (heroImage) parts.push("  <div class=\"w-full\"><img src=\"", escapeHtml(heroImage), "\" alt=\"\" class=\"h-48 w-full object-cover md:h-64\" /></div>\n");
  parts.push("  <div class=\"p-6\">\n");
  if (shortDesc) parts.push("    <p class=\"text-gray-600\">", escapeHtml(shortDesc), "</p>\n");
  if (about || yearEst) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">About</h2>\n");
    if (yearEst) parts.push("      <p class=\"mt-2 text-sm text-gray-600\">", escapeHtml(yearEst), "</p>\n");
    if (about) parts.push("      <p class=\"mt-2 text-gray-700\">", escapeHtml(about), "</p>\n");
    parts.push("    </section>\n");
  }
  if (hasContact) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Contact</h2>\n      <ul class=\"mt-2 space-y-1 text-gray-700\">\n");
    if (address) parts.push("        <li>", escapeHtml(address), "</li>\n");
    if (country) parts.push("        <li>", escapeHtml(country), "</li>\n");
    if (areaServed) parts.push("        <li class=\"text-gray-600\">", escapeHtml(areaServed), "</li>\n");
    if (phone) parts.push("        <li>Phone: ", escapeHtml(phone), "</li>\n");
    if (email) parts.push("        <li>Email: ", escapeHtml(email), "</li>\n");
    if (whatsAppHref) parts.push("        <li><a href=\"", escapeHtml(whatsAppHref), "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">Chat on WhatsApp</a></li>\n");
    parts.push("      </ul>\n    </section>\n");
  }
  if (hasHours) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Hours</h2>\n");
    if (timezone) parts.push("      <p class=\"mt-1 text-sm text-gray-500\">All times in ", escapeHtml(timezoneLabel), "</p>\n");
    parts.push("      <ul class=\"mt-2 space-y-1 text-gray-700\">\n");
    if (businessHours) parts.push("        <li>", escapeHtml(businessHours), "</li>\n");
    if (specialHours) parts.push("        <li class=\"text-gray-600\">", escapeHtml(specialHours), "</li>\n");
    parts.push("      </ul>\n    </section>\n");
  }
  if (galleryUrls.length > 0) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Gallery</h2>\n      <div class=\"mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3\">\n");
    for (const url of galleryUrls) {
      parts.push("        <img src=\"", escapeHtml(url), "\" alt=\"\" class=\"aspect-square w-full rounded-lg object-cover\" />\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (youtubeEmbeds.length > 0) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Videos</h2>\n      <div class=\"mt-2 space-y-4\">\n");
    for (const embed of youtubeEmbeds) {
      const src = escapeHtml(embed.src ?? "");
      parts.push("        <div class=\"aspect-video w-full max-w-2xl overflow-hidden rounded-lg\"><iframe src=\"", src, "\" title=\"YouTube video\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen class=\"h-full w-full\"></iframe></div>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Contact us</h2>\n      <form method=\"post\" action=\"", contactFormAction, "\" class=\"mt-2 flex flex-col gap-3 max-w-md\">\n        <input type=\"text\" name=\"name\" required placeholder=\"Name\" class=\"border rounded px-3 py-2\" />\n        <input type=\"email\" name=\"email\" required placeholder=\"Email\" class=\"border rounded px-3 py-2\" />\n        <textarea name=\"message\" required placeholder=\"Message\" rows=\"4\" class=\"border rounded px-3 py-2\"></textarea>\n        <button type=\"submit\" class=\"bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800\">Send</button>\n      </form>\n    </section>\n  </div>\n</body>\n</html>\n");
  return parts.join("");
}

/**
 * Builds full static HTML for a published site and minimal meta for DB/redirect page.
 * Workers-safe: no eval or code generation (Cloudflare compatible).
 */
export function buildPublishedPageHtml(
  options: BuildPublishedHtmlOptions
): { html: string; meta: PublishedMeta } {
  const { content, siteSlug, siteBaseUrl } = options;
  const { view, meta } = buildTemplateView(content, siteSlug, siteBaseUrl);
  const html = renderPublishedTemplate(view);
  return { html, meta };
}
