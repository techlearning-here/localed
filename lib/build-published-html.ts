import { getCountryLabel } from "@/lib/countries";
import { buildLocalBusinessJsonLdScript } from "@/lib/build-local-business-schema";
import { getRecommendedImageDimension } from "@/lib/image-dimensions";
import type { PublishedMeta, SiteContent } from "@/lib/types/site";

/** Escape for HTML text/attribute context (Workers-safe; no eval). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** SVG path(s) for 24x24 social icon. Returns inner HTML for <svg viewBox="0 0 24 24">. */
function socialIconSvgInnerHtml(
  kind: "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "tiktok" | "other"
): string {
  switch (kind) {
    case "facebook":
      return '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>';
    case "instagram":
      return '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>';
    case "youtube":
      return '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>';
    case "x":
      return '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>';
    case "linkedin":
      return '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>';
    case "tiktok":
      return '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>';
    default:
      return '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>';
  }
}

const DEFAULT_DESCRIPTION_MAX_LENGTH = 160;

/** Shown when no hero image and no gallery images (DATA_WE_COLLECT §11 fallback). */
const PLACEHOLDER_HERO_URL =
  "https://placehold.co/1200x400/e2e8f0/64748b?text=No+image";

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
  const metaTitleRaw = typeof content.metaTitle === "string" ? content.metaTitle.trim() : "";
  const metaDescriptionRaw =
    typeof content.metaDescription === "string"
      ? content.metaDescription.trim().slice(0, DEFAULT_DESCRIPTION_MAX_LENGTH)
      : "";
  const defaultTitle = tagline ? `${businessName} — ${tagline}` : businessName;
  const defaultDescription = shortDescription || undefined;
  const heroImageRaw = typeof content.heroImage === "string" ? content.heroImage.trim() : "";
  const logo = typeof content.logo === "string" ? content.logo.trim() : "";
  const favicon = typeof content.favicon === "string" ? content.favicon.trim() : logo || "";
  const canonicalUrl = `${base}/${siteSlug}`;
  const contactFormAction = `${base}/api/sites/${siteSlug}/contact`;

  const legalName = typeof content.legalName === "string" ? content.legalName.trim() : "";
  const keywords = typeof content.keywords === "string" ? content.keywords.trim() : "";
  const about = typeof content.about === "string" ? content.about : "";
  const yearEstablished =
    typeof content.yearEstablished === "string" ? content.yearEstablished : "";
  const address = typeof content.address === "string" ? content.address : "";
  const addressLocality = typeof content.addressLocality === "string" ? content.addressLocality.trim() : "";
  const addressRegion = typeof content.addressRegion === "string" ? content.addressRegion.trim() : "";
  const postalCode = typeof content.postalCode === "string" ? content.postalCode.trim() : "";
  const countryCode = typeof content.country === "string" ? content.country : "";
  const country = countryCode ? getCountryLabel(countryCode) : "";
  const areaServed = typeof content.areaServed === "string" ? content.areaServed : "";
  const phone = typeof content.phone === "string" ? content.phone : "";
  const phone2 = typeof content.phone2 === "string" ? content.phone2.trim() : "";
  const email = typeof content.email === "string" ? content.email : "";
  const email2 = typeof content.email2 === "string" ? content.email2.trim() : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const contactFormSubject =
    typeof content.contactFormSubject === "string" ? content.contactFormSubject.trim() : "";
  const contactPreference =
    typeof content.contactPreference === "string" ? content.contactPreference.trim() : "";
  const contactFormSuccessMessage =
    typeof content.contactFormSuccessMessage === "string" ? content.contactFormSuccessMessage.trim() : "";
  const priceRange = typeof content.priceRange === "string" ? content.priceRange.trim() : "";
  const mapEmbedUrl = typeof content.mapEmbedUrl === "string" ? content.mapEmbedUrl.trim() : "";
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
  const heroImage =
    heroImageRaw || (galleryUrls.length > 0 ? "" : PLACEHOLDER_HERO_URL);
  const ogImage = heroImageRaw || logo || (heroImage === PLACEHOLDER_HERO_URL ? undefined : heroImage) || undefined;

  const meta: PublishedMeta = {
    title: metaTitleRaw || defaultTitle,
    description: metaDescriptionRaw || defaultDescription,
    ogImage: ogImage ?? undefined,
  };

  const youtubeUrls = Array.isArray(content.youtubeUrls)
    ? content.youtubeUrls.filter((u): u is string => typeof u === "string")
    : [];
  const youtubeEmbeds = youtubeUrls
    .map((url) => {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
      return id ? { src: `https://www.youtube.com/embed/${id}` } : null;
    })
    .filter((e): e is { src: string } => e !== null);

  const paymentMethods = typeof content.paymentMethods === "string" ? content.paymentMethods.trim() : "";
  const hasContact = !!(address || addressLocality || addressRegion || postalCode || country || areaServed || phone || phone2 || email || email2 || whatsAppHref || paymentMethods);
  const hasHours = !!(businessHours || specialHours || timezone);

  const galleryCaptionsRaw = content.galleryCaptions;
  const galleryCaptions: string[] = Array.isArray(galleryCaptionsRaw)
    ? galleryUrls.map((_, i) => {
        const c = galleryCaptionsRaw[i];
        return typeof c === "string" ? c.trim() : "";
      })
    : [];
  const otherVideoUrls = Array.isArray(content.otherVideoUrls)
    ? (content.otherVideoUrls as unknown[]).filter((u): u is string => typeof u === "string")
    : [];
  /** Vimeo: embed URL; others: link only. */
  const otherVideoEmbeds: { embedSrc?: string; url: string }[] = otherVideoUrls.map((url) => {
    const vimeoId = url.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/)?.[1];
    return vimeoId
      ? { embedSrc: `https://player.vimeo.com/video/${vimeoId}`, url }
      : { url };
  });
  const servicesIntro = typeof content.servicesIntro === "string" ? content.servicesIntro.trim() : "";
  const bookingEnabled = Boolean(content.bookingEnabled);
  const bookingSlotDuration = typeof content.bookingSlotDuration === "string" ? content.bookingSlotDuration.trim() : "";
  const bookingLeadTime = typeof content.bookingLeadTime === "string" ? content.bookingLeadTime.trim() : "";
  const bookingServiceIds = Array.isArray(content.bookingServiceIds)
    ? (content.bookingServiceIds as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  const mapQuery = [address, addressLocality, addressRegion, postalCode, country].filter(Boolean).join(", ") || "";
  const showMapLink = content.showMapLink !== false && content.showMapLink !== "false";
  const directionsLabel = typeof content.directionsLabel === "string" ? (content.directionsLabel.trim() || "View on map") : "View on map";
  const bookingUrl = typeof content.bookingUrl === "string" ? content.bookingUrl.trim() : "";
  const announcementBar = typeof content.announcementBar === "string" ? content.announcementBar.trim() : "";
  const footerText = typeof content.footerText === "string" ? content.footerText.trim() : "";
  const themeColor = typeof content.themeColor === "string" ? content.themeColor.trim() : "";
  const robotsMeta = typeof content.robotsMeta === "string" ? content.robotsMeta.trim() : "";
  const customCssUrl = typeof content.customCssUrl === "string" ? content.customCssUrl.trim() : "";
  const showBackToTop = Boolean(content.showBackToTop);
  const cta2Label = typeof content.cta2Label === "string" ? content.cta2Label.trim() : "";
  const cta2Url = typeof content.cta2Url === "string" ? content.cta2Url.trim() : "";
  const hasCta2 = !!(cta2Label && cta2Url);
  const cta3Label = typeof content.cta3Label === "string" ? content.cta3Label.trim() : "";
  const cta3Url = typeof content.cta3Url === "string" ? content.cta3Url.trim() : "";
  const hasCta3 = !!(cta3Label && cta3Url);
  const newsletterLabel = typeof content.newsletterLabel === "string" ? content.newsletterLabel.trim() : "";
  const newsletterUrl = typeof content.newsletterUrl === "string" ? content.newsletterUrl.trim() : "";
  const hasNewsletter = (content.hasNewsletter === true || content.hasNewsletter === "true") && !!(newsletterLabel || newsletterUrl);
  const shareSectionTitle = typeof content.shareSectionTitle === "string" ? content.shareSectionTitle.trim() : "";
  const customDomainDisplay = typeof content.customDomainDisplay === "string" ? content.customDomainDisplay.trim() : "";
  const faqAsAccordion = Boolean(content.faqAsAccordion);
  const servicesSectionTitle = typeof content.servicesSectionTitle === "string" ? (content.servicesSectionTitle.trim() || "What we offer") : "What we offer";
  const aboutSectionTitle = typeof content.aboutSectionTitle === "string" ? (content.aboutSectionTitle.trim() || "About") : "About";
  const contactSectionTitle = typeof content.contactSectionTitle === "string" ? (content.contactSectionTitle.trim() || "Contact") : "Contact";
  const hoursSectionTitle = typeof content.hoursSectionTitle === "string" ? (content.hoursSectionTitle.trim() || "Hours") : "Hours";
  const gallerySectionTitle = typeof content.gallerySectionTitle === "string" ? (content.gallerySectionTitle.trim() || "Gallery") : "Gallery";
  const videosSectionTitle = typeof content.videosSectionTitle === "string" ? (content.videosSectionTitle.trim() || "Videos") : "Videos";
  const otherVideosSectionTitle = typeof content.otherVideosSectionTitle === "string" ? (content.otherVideosSectionTitle.trim() || "Other videos") : "Other videos";
  const faqSectionTitle = typeof content.faqSectionTitle === "string" ? (content.faqSectionTitle.trim() || "FAQ") : "FAQ";
  const testimonialsSectionTitle = typeof content.testimonialsSectionTitle === "string" ? (content.testimonialsSectionTitle.trim() || "Testimonials") : "Testimonials";
  const teamSectionTitle = typeof content.teamSectionTitle === "string" ? (content.teamSectionTitle.trim() || "Meet the team") : "Meet the team";
  const certificationsSectionTitle = typeof content.certificationsSectionTitle === "string" ? (content.certificationsSectionTitle.trim() || "Certifications & awards") : "Certifications & awards";
  const contactFormSectionTitle = typeof content.contactFormSectionTitle === "string" ? (content.contactFormSectionTitle.trim() || "Contact us") : "Contact us";
  const socialSectionTitle = typeof content.socialSectionTitle === "string" ? (content.socialSectionTitle.trim() || "Follow us") : "Follow us";

  const facebookUrl = typeof content.facebookUrl === "string" ? content.facebookUrl.trim() : "";
  const instagramUrl = typeof content.instagramUrl === "string" ? content.instagramUrl.trim() : "";
  const youtubeChannelUrl = typeof content.youtubeChannelUrl === "string" ? content.youtubeChannelUrl.trim() : "";
  const twitterUrl = typeof content.twitterUrl === "string" ? content.twitterUrl.trim() : "";
  const linkedinUrl = typeof content.linkedinUrl === "string" ? content.linkedinUrl.trim() : "";
  const tiktokUrl = typeof content.tiktokUrl === "string" ? content.tiktokUrl.trim() : "";
  const otherLinkLabel = typeof content.otherLinkLabel === "string" ? content.otherLinkLabel.trim() : "";
  const otherLinkUrl = typeof content.otherLinkUrl === "string" ? content.otherLinkUrl.trim() : "";

  type SocialKind = "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "tiktok" | "other";
  const socialLinks: { kind: SocialKind; label: string; url: string }[] = [];
  if (facebookUrl) socialLinks.push({ kind: "facebook", label: "Facebook", url: facebookUrl });
  if (instagramUrl) socialLinks.push({ kind: "instagram", label: "Instagram", url: instagramUrl });
  if (youtubeChannelUrl) socialLinks.push({ kind: "youtube", label: "YouTube", url: youtubeChannelUrl });
  if (twitterUrl) socialLinks.push({ kind: "x", label: "X", url: twitterUrl });
  if (linkedinUrl) socialLinks.push({ kind: "linkedin", label: "LinkedIn", url: linkedinUrl });
  if (tiktokUrl) socialLinks.push({ kind: "tiktok", label: "TikTok", url: tiktokUrl });
  if (otherLinkUrl) socialLinks.push({ kind: "other", label: otherLinkLabel || "Link", url: otherLinkUrl });

  const sameAs = [
    facebookUrl,
    instagramUrl,
    youtubeChannelUrl,
    twitterUrl,
    linkedinUrl,
    tiktokUrl,
    otherLinkUrl,
  ].filter(Boolean);
  const hasSocialLinks = socialLinks.length > 0;

  const rawServices = content.services;
  const servicesList: { name: string; description?: string; image?: string; duration?: string; price?: string; category?: string }[] = Array.isArray(rawServices)
    ? rawServices
        .filter((s): s is Record<string, unknown> => s != null && typeof s === "object")
        .map((s) => ({
          name: typeof s.name === "string" ? s.name : "",
          description: typeof s.description === "string" ? s.description : undefined,
          image: typeof s.image === "string" ? s.image : undefined,
          duration: typeof s.duration === "string" ? s.duration : undefined,
          price: typeof s.price === "string" ? s.price : undefined,
          category: typeof s.category === "string" ? s.category.trim() || undefined : undefined,
        }))
        .filter((s) => s.name.trim() !== "")
    : [];
  const hasServices = servicesList.length > 0;

  const rawFaq = content.faq;
  const faqList: { question: string; answer: string }[] = Array.isArray(rawFaq)
    ? rawFaq
        .filter((f): f is Record<string, unknown> => f != null && typeof f === "object")
        .map((f) => ({
          question: typeof f.question === "string" ? f.question : "",
          answer: typeof f.answer === "string" ? f.answer : "",
        }))
        .filter((f) => f.question.trim() !== "")
    : [];
  const hasFaq = faqList.length > 0;

  const rawTestimonials = content.testimonials;
  const testimonialsList: { quote: string; author?: string; photo?: string; rating?: string }[] = Array.isArray(rawTestimonials)
    ? rawTestimonials
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          quote: typeof t.quote === "string" ? t.quote : "",
          author: typeof t.author === "string" ? t.author : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          rating: typeof t.rating === "string" ? t.rating : undefined,
        }))
        .filter((t) => t.quote.trim() !== "")
    : [];
  const hasTestimonials = testimonialsList.length > 0;

  const rawTeam = content.team;
  const teamList: { name: string; role?: string; photo?: string; bio?: string }[] = Array.isArray(rawTeam)
    ? rawTeam
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          name: typeof t.name === "string" ? t.name : "",
          role: typeof t.role === "string" ? t.role : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          bio: typeof t.bio === "string" ? t.bio : undefined,
        }))
        .filter((t) => t.name.trim() !== "")
    : [];
  const hasTeam = teamList.length > 0;

  const rawCertifications = content.certifications;
  const certificationsList: { title?: string; image?: string }[] = Array.isArray(rawCertifications)
    ? rawCertifications
        .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
        .map((c) => ({
          title: typeof c.title === "string" ? c.title : undefined,
          image: typeof c.image === "string" ? c.image : undefined,
        }))
        .filter((c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== ""))
    : [];
  const hasCertifications = certificationsList.length > 0;

  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel.trim() : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl.trim() : "";
  const hasCta = !!(ctaLabel && ctaUrl);

  const schemaImages: string[] = [];
  if (heroImageRaw && heroImageRaw !== PLACEHOLDER_HERO_URL) schemaImages.push(heroImageRaw);
  for (const u of galleryUrls) {
    if (u && !schemaImages.includes(u)) schemaImages.push(u);
  }
  const schemaImageInput = schemaImages.length === 0 ? ogImage : schemaImages.length === 1 ? schemaImages[0] : schemaImages;

  const view: Record<string, unknown> = {
    meta,
    canonicalUrl,
    favicon: favicon || undefined,
    logo: logo || undefined,
    businessName,
    tagline: tagline || undefined,
    legalName: legalName || undefined,
    keywords: keywords || undefined,
    heroImage: heroImage || undefined,
    shortDescription: shortDescription || undefined,
    about: about || undefined,
    yearEstablished: yearEstablished || undefined,
    hasContact,
    address: address || undefined,
    addressLocality: addressLocality || undefined,
    addressRegion: addressRegion || undefined,
    postalCode: postalCode || undefined,
    country: country || undefined,
    areaServed: areaServed || undefined,
    phone: phone || undefined,
    phone2: phone2 || undefined,
    email: email || undefined,
    email2: email2 || undefined,
    contactPreference: contactPreference || undefined,
    contactFormSuccessMessage: contactFormSuccessMessage || undefined,
    contactFormSubject: contactFormSubject || undefined,
    mapQuery: mapQuery || undefined,
    showMapLink,
    directionsLabel: directionsLabel || undefined,
    mapEmbedUrl: mapEmbedUrl || undefined,
    bookingUrl: bookingUrl || undefined,
    announcementBar: announcementBar || undefined,
    footerText: footerText || undefined,
    themeColor: themeColor || undefined,
    robotsMeta: robotsMeta || undefined,
    customCssUrl: customCssUrl || undefined,
    showBackToTop,
    newsletterLabel: newsletterLabel || undefined,
    newsletterUrl: newsletterUrl || undefined,
    hasNewsletter,
    shareSectionTitle: shareSectionTitle || undefined,
    customDomainDisplay: customDomainDisplay || undefined,
    faqAsAccordion,
    galleryCaptions,
    otherVideoUrls,
    otherVideoEmbeds,
    servicesIntro: servicesIntro || undefined,
    bookingEnabled,
    bookingSlotDuration: bookingSlotDuration || undefined,
    bookingLeadTime: bookingLeadTime || undefined,
    bookingServiceIds,
    whatsAppHref: whatsAppHref || undefined,
    paymentMethods: paymentMethods || undefined,
    hasHours,
    timezone: timezone || undefined,
    timezoneLabel,
    businessHours: businessHours || undefined,
    specialHours: specialHours || undefined,
    galleryUrls,
    youtubeEmbeds,
    contactFormAction,
    hasSocialLinks,
    socialLinks,
    hasServices,
    servicesList,
    hasFaq,
    faqList,
    hasTestimonials,
    testimonialsList,
    hasTeam,
    teamList,
    hasCertifications,
    certificationsList,
    hasCta,
    ctaLabel: hasCta ? ctaLabel : undefined,
    ctaUrl: hasCta ? ctaUrl : undefined,
    hasCta2,
    cta2Label: hasCta2 ? cta2Label : undefined,
    cta2Url: hasCta2 ? cta2Url : undefined,
    hasCta3,
    cta3Label: hasCta3 ? cta3Label : undefined,
    cta3Url: hasCta3 ? cta3Url : undefined,
    servicesSectionTitle,
    aboutSectionTitle,
    contactSectionTitle,
    hoursSectionTitle,
    gallerySectionTitle,
    videosSectionTitle,
    otherVideosSectionTitle,
    faqSectionTitle,
    testimonialsSectionTitle,
    teamSectionTitle,
    certificationsSectionTitle,
    contactFormSectionTitle,
    socialSectionTitle,
    jsonLd: buildLocalBusinessJsonLdScript({
      name: businessName,
      description: shortDescription || undefined,
      url: canonicalUrl,
      image: schemaImageInput,
      address: address || undefined,
      addressLocality: addressLocality || undefined,
      addressRegion: addressRegion || undefined,
      postalCode: postalCode || undefined,
      addressCountry: countryCode || undefined,
      telephone: phone || undefined,
      email: email || undefined,
      openingHours: businessHours || undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      priceRange: priceRange || undefined,
      testimonials: testimonialsList.map((t) => ({ rating: t.rating })),
    }),
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
  const phone2 = (view.phone2 as string) ?? "";
  const email = (view.email as string) ?? "";
  const email2 = (view.email2 as string) ?? "";
  const contactPreference = (view.contactPreference as string) ?? "";
  const contactFormSuccessMessage = (view.contactFormSuccessMessage as string) ?? "";
  const whatsAppHref = (view.whatsAppHref as string) ?? "";
  const paymentMethods = (view.paymentMethods as string) ?? "";
  const contactFormSubject = (view.contactFormSubject as string) ?? "";
  const mapQuery = (view.mapQuery as string) ?? "";
  const mapEmbedUrl = (view.mapEmbedUrl as string) ?? "";
  const galleryCaptions = (view.galleryCaptions as string[]) ?? [];
  const otherVideoUrls = (view.otherVideoUrls as string[]) ?? [];
  const otherVideoEmbeds = (view.otherVideoEmbeds as { embedSrc?: string; url: string }[]) ?? [];
  const servicesIntro = (view.servicesIntro as string) ?? "";
  const bookingEnabled = Boolean(view.bookingEnabled);
  const bookingSlotDuration = (view.bookingSlotDuration as string) ?? "";
  const bookingLeadTime = (view.bookingLeadTime as string) ?? "";
  const hasHours = Boolean(view.hasHours);
  const timezone = (view.timezone as string) ?? "";
  const timezoneLabel = (view.timezoneLabel as string) ?? "";
  const businessHours = (view.businessHours as string) ?? "";
  const specialHours = (view.specialHours as string) ?? "";
  const galleryUrls = (view.galleryUrls as string[]) ?? [];
  const youtubeEmbeds = (view.youtubeEmbeds as { src: string }[]) ?? [];
  const contactFormAction = escapeHtml(String(view.contactFormAction ?? ""));
  const hasSocialLinks = Boolean(view.hasSocialLinks);
  const socialLinks = (view.socialLinks as { kind: string; label: string; url: string }[]) ?? [];
  const hasServices = Boolean(view.hasServices);
  const servicesList = (view.servicesList as { name: string; description?: string; image?: string; duration?: string; price?: string; category?: string }[]) ?? [];
  const hasFaq = Boolean(view.hasFaq);
  const faqList = (view.faqList as { question: string; answer: string }[]) ?? [];
  const hasTestimonials = Boolean(view.hasTestimonials);
  const testimonialsList = (view.testimonialsList as { quote: string; author?: string; photo?: string; rating?: string }[]) ?? [];
  const hasTeam = Boolean(view.hasTeam);
  const teamList = (view.teamList as { name: string; role?: string; photo?: string; bio?: string }[]) ?? [];
  const hasCertifications = Boolean(view.hasCertifications);
  const certificationsList = (view.certificationsList as { title?: string; image?: string }[]) ?? [];
  const hasCta = Boolean(view.hasCta);
  const ctaLabel = (view.ctaLabel as string) ?? "";
  const ctaUrl = (view.ctaUrl as string) ?? "";
  const hasCta2 = Boolean(view.hasCta2);
  const cta2Label = (view.cta2Label as string) ?? "";
  const cta2Url = (view.cta2Url as string) ?? "";
  const hasCta3 = Boolean(view.hasCta3);
  const cta3Label = (view.cta3Label as string) ?? "";
  const cta3Url = (view.cta3Url as string) ?? "";
  const showMapLink = view.showMapLink !== false;
  const directionsLabel = escapeHtml(String((view.directionsLabel as string) ?? "View on map"));
  const bookingUrl = (view.bookingUrl as string) ?? "";
  const announcementBar = (view.announcementBar as string) ?? "";
  const footerText = (view.footerText as string) ?? "";
  const themeColor = (view.themeColor as string) ?? "";
  const tagline = (view.tagline as string) ?? "";
  const addressLocality = (view.addressLocality as string) ?? "";
  const addressRegion = (view.addressRegion as string) ?? "";
  const postalCode = (view.postalCode as string) ?? "";
  const robotsMeta = (view.robotsMeta as string) ?? "";
  const customCssUrl = (view.customCssUrl as string) ?? "";
  const showBackToTop = Boolean(view.showBackToTop);
  const newsletterLabel = (view.newsletterLabel as string) ?? "";
  const newsletterUrl = (view.newsletterUrl as string) ?? "";
  const hasNewsletter = Boolean(view.hasNewsletter);
  const shareSectionTitle = (view.shareSectionTitle as string) ?? "";
  const customDomainDisplay = (view.customDomainDisplay as string) ?? "";
  const faqAsAccordion = Boolean(view.faqAsAccordion);
  const canonicalForShare = canonical || "";
  const servicesSectionTitle = escapeHtml(String((view.servicesSectionTitle as string) ?? "What we offer"));
  const aboutSectionTitle = escapeHtml(String((view.aboutSectionTitle as string) ?? "About"));
  const contactSectionTitle = escapeHtml(String((view.contactSectionTitle as string) ?? "Contact"));
  const hoursSectionTitle = escapeHtml(String((view.hoursSectionTitle as string) ?? "Hours"));
  const gallerySectionTitle = escapeHtml(String((view.gallerySectionTitle as string) ?? "Gallery"));
  const videosSectionTitle = escapeHtml(String((view.videosSectionTitle as string) ?? "Videos"));
  const otherVideosSectionTitle = escapeHtml(String((view.otherVideosSectionTitle as string) ?? "Other videos"));
  const faqSectionTitle = escapeHtml(String((view.faqSectionTitle as string) ?? "FAQ"));
  const testimonialsSectionTitle = escapeHtml(String((view.testimonialsSectionTitle as string) ?? "Testimonials"));
  const teamSectionTitle = escapeHtml(String((view.teamSectionTitle as string) ?? "Meet the team"));
  const certificationsSectionTitle = escapeHtml(String((view.certificationsSectionTitle as string) ?? "Certifications & awards"));
  const contactFormSectionTitle = escapeHtml(String((view.contactFormSectionTitle as string) ?? "Contact us"));
  const socialSectionTitle = escapeHtml(String((view.socialSectionTitle as string) ?? "Follow us"));
  const jsonLd = typeof view.jsonLd === "string" ? view.jsonLd : "";

  const legalName = (view.legalName as string) ?? "";
  const keywords = (view.keywords as string) ?? "";
  const parts: string[] = [];
  parts.push("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>", title, "</title>\n");
  if (robotsMeta) parts.push("  <meta name=\"robots\" content=\"", escapeHtml(robotsMeta), "\">\n");
  if (desc) parts.push("  <meta name=\"description\" content=\"", desc, "\">\n");
  if (keywords) parts.push("  <meta name=\"keywords\" content=\"", escapeHtml(keywords), "\">\n");
  if (canonical) parts.push("  <link rel=\"canonical\" href=\"", escapeHtml(canonical), "\">\n");
  if (customCssUrl) parts.push("  <link rel=\"stylesheet\" href=\"", escapeHtml(customCssUrl), "\">\n");
  if (ogImage) parts.push("  <meta property=\"og:image\" content=\"", ogImage, "\">\n");
  parts.push("  <meta property=\"og:title\" content=\"", title, "\">\n");
  if (desc) parts.push("  <meta property=\"og:description\" content=\"", desc, "\">\n");
  if (canonical) parts.push("  <meta property=\"og:url\" content=\"", escapeHtml(canonical), "\">\n");
  parts.push("  <meta name=\"twitter:card\" content=\"summary_large_image\">\n");
  if (favicon) parts.push("  <link rel=\"icon\" href=\"", escapeHtml(favicon), "\">\n");
  if (jsonLd) {
    const safeJsonLd = jsonLd.replace(/<\/script>/gi, "<\\/script>");
    parts.push("  <script type=\"application/ld+json\">\n", safeJsonLd, "\n  </script>\n");
  }
  if (themeColor) parts.push("  <meta name=\"theme-color\" content=\"", escapeHtml(themeColor), "\">\n");
  parts.push("  <link href=\"https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css\" rel=\"stylesheet\" />\n</head>\n<body class=\"min-h-screen bg-white text-gray-900\">\n  <a href=\"#main-content\" class=\"sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 rounded bg-gray-900 px-3 py-2 text-white\">Skip to content</a>\n");
  parts.push("  <div class=\"bg-gray-900 text-white text-center py-2 px-4 text-sm\">", announcementBar ? escapeHtml(announcementBar) : `Welcome to ${businessName || "our site"}`, "</div>\n");
  const navLinks: string[] = [];
  if (about || yearEst) navLinks.push("<a href=\"#about\" class=\"text-gray-700 hover:text-gray-900\">" + aboutSectionTitle + "</a>");
  if (hasServices) navLinks.push("<a href=\"#services\" class=\"text-gray-700 hover:text-gray-900\">" + servicesSectionTitle + "</a>");
  if (hasContact) navLinks.push("<a href=\"#contact\" class=\"text-gray-700 hover:text-gray-900\">" + contactSectionTitle + "</a>");
  if (hasHours) navLinks.push("<a href=\"#hours\" class=\"text-gray-700 hover:text-gray-900\">" + hoursSectionTitle + "</a>");
  if (galleryUrls.length > 0) navLinks.push("<a href=\"#gallery\" class=\"text-gray-700 hover:text-gray-900\">" + gallerySectionTitle + "</a>");
  if (bookingEnabled && bookingUrl) navLinks.push("<a href=\"#booking\" class=\"text-gray-700 hover:text-gray-900\">Book</a>");
  if (hasFaq) navLinks.push("<a href=\"#faq\" class=\"text-gray-700 hover:text-gray-900\">" + faqSectionTitle + "</a>");
  navLinks.push("<a href=\"#contact-form\" class=\"text-gray-700 hover:text-gray-900\">" + contactFormSectionTitle + "</a>");
  parts.push("  <header class=\"border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10\">\n    <div class=\"max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3\">\n      <div class=\"flex items-center gap-4\">\n");
  const logoDim = getRecommendedImageDimension("logo");
  if (logo) parts.push("        <img src=\"", escapeHtml(logo), "\" alt=\"\" class=\"h-10 max-h-10 w-auto object-contain\" width=\"", String(logoDim.width), "\" height=\"", String(logoDim.height), "\" />\n");
  parts.push("        <div><h1 class=\"text-xl font-bold text-gray-900\">", businessName, "</h1>\n");
  if (tagline) parts.push("        <p class=\"text-xs text-gray-600\">", escapeHtml(tagline), "</p>\n");
  parts.push("        </div>\n      </div>\n");
  if (navLinks.length > 0) parts.push("      <nav class=\"flex flex-wrap gap-x-4 gap-y-1 text-sm\" aria-label=\"Main navigation\">\n        ", navLinks.join("\n        "), "\n      </nav>\n");
  parts.push("    </div>\n  </header>\n");
  const heroDim = getRecommendedImageDimension("hero");
  if (heroImage) parts.push("  <div class=\"w-full overflow-hidden bg-gray-100\" style=\"aspect-ratio: 21/9; min-height: 12rem;\"><img src=\"", escapeHtml(heroImage), "\" alt=\"\" class=\"h-full w-full object-cover\" width=\"", String(heroDim.width), "\" height=\"", String(heroDim.height), "\" /></div>\n");
  parts.push("  <div id=\"main-content\" class=\"p-6\">\n");
  if (shortDesc) parts.push("    <p class=\"text-gray-600\">", escapeHtml(shortDesc), "</p>\n");
  if (hasCta && ctaLabel && ctaUrl) {
    parts.push("    <p class=\"mt-4\"><a href=\"", escapeHtml(ctaUrl), "\" class=\"inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800\" target=\"_blank\" rel=\"noopener noreferrer\">", escapeHtml(ctaLabel), "</a></p>\n");
  }
  if (hasCta2 && cta2Label && cta2Url) {
    parts.push("    <p class=\"mt-2\"><a href=\"", escapeHtml(cta2Url), "\" class=\"inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50\" target=\"_blank\" rel=\"noopener noreferrer\">", escapeHtml(cta2Label), "</a></p>\n");
  }
  if (hasCta3 && cta3Label && cta3Url) {
    parts.push("    <p class=\"mt-2\"><a href=\"", escapeHtml(cta3Url), "\" class=\"inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50\" target=\"_blank\" rel=\"noopener noreferrer\">", escapeHtml(cta3Label), "</a></p>\n");
  }
  if (about || yearEst) {
    parts.push("    <section id=\"about\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", aboutSectionTitle, "</h2>\n");
    if (yearEst) parts.push("      <p class=\"mt-2 text-sm text-gray-600\">", escapeHtml(yearEst), "</p>\n");
    if (about) parts.push("      <p class=\"mt-2 text-gray-700\">", escapeHtml(about), "</p>\n");
    parts.push("    </section>\n");
  }
  if (hasServices && servicesList.length > 0) {
    parts.push("    <section id=\"services\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", servicesSectionTitle, "</h2>\n");
    if (servicesIntro) parts.push("      <p class=\"mt-2 text-gray-600\">", escapeHtml(servicesIntro), "</p>\n");
    parts.push("      <ul class=\"mt-2 space-y-4\">\n");
    for (const s of servicesList) {
      const name = escapeHtml(s.name);
      parts.push("        <li class=\"rounded-lg border border-gray-200 p-4\">\n");
      const serviceDim = getRecommendedImageDimension("service");
      if (s.image) parts.push("          <div class=\"mb-2 w-full overflow-hidden rounded-lg bg-gray-100\" style=\"aspect-ratio: 4/3; max-width: 240px;\"><img src=\"", escapeHtml(s.image), "\" alt=\"\" class=\"h-full w-full object-cover\" loading=\"lazy\" width=\"", String(serviceDim.width), "\" height=\"", String(serviceDim.height), "\" /></div>\n");
      if (s.category) parts.push("          <span class=\"text-xs font-medium uppercase text-gray-500\">", escapeHtml(s.category), "</span>\n");
      parts.push("          <span class=\"font-medium\">", name, "</span>\n");
      if (s.description) parts.push("          <p class=\"mt-1 text-sm text-gray-600\">", escapeHtml(s.description), "</p>\n");
      const details: string[] = [];
      if (s.duration) details.push(escapeHtml(s.duration));
      if (s.price) details.push(escapeHtml(s.price));
      if (details.length) parts.push("          <p class=\"mt-1 text-sm text-gray-500\">", details.join(" · "), "</p>\n");
      parts.push("        </li>\n");
    }
    parts.push("      </ul>\n    </section>\n");
  }
  if (hasContact) {
    parts.push("    <section id=\"contact\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", contactSectionTitle, "</h2>\n      <ul class=\"mt-2 space-y-1 text-gray-700\">\n");
    if (address) parts.push("        <li>", escapeHtml(address), "</li>\n");
    if (addressLocality) parts.push("        <li>", escapeHtml(addressLocality), "</li>\n");
    if (addressRegion) parts.push("        <li>", escapeHtml(addressRegion), "</li>\n");
    if (postalCode) parts.push("        <li>", escapeHtml(postalCode), "</li>\n");
    if (country) parts.push("        <li>", escapeHtml(country), "</li>\n");
    if (areaServed) parts.push("        <li class=\"text-gray-600\">", escapeHtml(areaServed), "</li>\n");
    if (showMapLink && mapQuery) parts.push("        <li><a href=\"https://www.google.com/maps/search/?api=1&query=", encodeURIComponent(mapQuery), "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">", directionsLabel, "</a></li>\n");
    if (mapEmbedUrl) parts.push("        <li class=\"mt-2\"><iframe src=\"", escapeHtml(mapEmbedUrl), "\" width=\"100%\" height=\"200\" style=\"border:0; max-width: 560px;\" allowfullscreen loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\" title=\"Map\"></iframe></li>\n");
    if (contactPreference) parts.push("        <li class=\"text-gray-600\">Preferred: ", escapeHtml(contactPreference), "</li>\n");
    if (phone) parts.push("        <li>Phone: <a href=\"tel:", encodeURIComponent(phone), "\" class=\"text-blue-600 underline hover:text-blue-800\">", escapeHtml(phone), "</a></li>\n");
    if (phone2) parts.push("        <li>Phone 2: <a href=\"tel:", encodeURIComponent(phone2), "\" class=\"text-blue-600 underline hover:text-blue-800\">", escapeHtml(phone2), "</a></li>\n");
    if (email) parts.push("        <li>Email: <a href=\"mailto:", encodeURIComponent(email), "\" class=\"text-blue-600 underline hover:text-blue-800\">", escapeHtml(email), "</a></li>\n");
    if (email2) parts.push("        <li>Email 2: <a href=\"mailto:", encodeURIComponent(email2), "\" class=\"text-blue-600 underline hover:text-blue-800\">", escapeHtml(email2), "</a></li>\n");
    if (whatsAppHref) parts.push("        <li><a href=\"", escapeHtml(whatsAppHref), "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">Chat on WhatsApp</a></li>\n");
    if (paymentMethods) parts.push("        <li class=\"text-gray-600\">", escapeHtml(paymentMethods), "</li>\n");
    parts.push("      </ul>\n    </section>\n");
  }
  if (hasSocialLinks && socialLinks.length > 0) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", socialSectionTitle, "</h2>\n      <ul class=\"mt-2 flex flex-wrap gap-1\" role=\"list\">\n");
    for (const link of socialLinks) {
      const kind = (link.kind ?? "other") as Parameters<typeof socialIconSvgInnerHtml>[0];
      const svgInner = socialIconSvgInnerHtml(kind);
      parts.push(
        "        <li><a href=\"",
        escapeHtml(link.url),
        "\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"",
        escapeHtml(link.label),
        "\" class=\"inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"h-6 w-6\" aria-hidden=\"true\">",
        svgInner,
        "</svg></a></li>\n"
      );
    }
    parts.push("      </ul>\n    </section>\n");
  }
  if (hasHours) {
    parts.push("    <section id=\"hours\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", hoursSectionTitle, "</h2>\n");
    if (timezone) parts.push("      <p class=\"mt-1 text-sm text-gray-500\">All times in ", escapeHtml(timezoneLabel), "</p>\n");
    parts.push("      <ul class=\"mt-2 space-y-1 text-gray-700\">\n");
    if (businessHours) parts.push("        <li>", escapeHtml(businessHours), "</li>\n");
    if (specialHours) parts.push("        <li class=\"text-gray-600\">", escapeHtml(specialHours), "</li>\n");
    parts.push("      </ul>\n    </section>\n");
  }
  if (galleryUrls.length > 0) {
    parts.push("    <section id=\"gallery\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", gallerySectionTitle, "</h2>\n      <div class=\"mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3\">\n");
    for (let i = 0; i < galleryUrls.length; i++) {
      const url = galleryUrls[i];
      const caption = galleryCaptions[i];
      const alt = caption ? escapeHtml(caption) : "";
      parts.push("        <figure class=\"overflow-hidden rounded-lg\">");
      const galleryDim = getRecommendedImageDimension("gallery");
      parts.push("<div class=\"w-full overflow-hidden rounded-lg bg-gray-100\" style=\"aspect-ratio: 1/1;\"><img src=\"", escapeHtml(url), "\" alt=\"", alt, "\" class=\"h-full w-full object-cover\" width=\"", String(galleryDim.width), "\" height=\"", String(galleryDim.height), "\" /></div>");
      if (caption) parts.push("<figcaption class=\"mt-1 text-xs text-gray-500 truncate\">", escapeHtml(caption), "</figcaption>");
      parts.push("</figure>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (youtubeEmbeds.length > 0) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", videosSectionTitle, "</h2>\n      <div class=\"mt-2 space-y-4\">\n");
    for (const embed of youtubeEmbeds) {
      const src = escapeHtml(embed.src ?? "");
      parts.push("        <div class=\"relative w-full overflow-hidden rounded-lg\" style=\"max-width: 896px; aspect-ratio: 16/9; min-height: 480px\"><iframe src=\"", src, "\" title=\"YouTube video\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen class=\"absolute inset-0 h-full w-full\"></iframe></div>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (otherVideoEmbeds.length > 0) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", otherVideosSectionTitle, "</h2>\n      <div class=\"mt-2 space-y-4\">\n");
    for (const item of otherVideoEmbeds) {
      if (item.embedSrc) {
        parts.push("        <div class=\"relative w-full overflow-hidden rounded-lg\" style=\"max-width: 896px; aspect-ratio: 16/9; min-height: 480px\"><iframe src=\"", escapeHtml(item.embedSrc), "\" title=\"Video\" allow=\"fullscreen\" allowfullscreen class=\"absolute inset-0 h-full w-full\"></iframe></div>\n");
      } else {
        parts.push("        <p><a href=\"", escapeHtml(item.url), "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">", escapeHtml(item.url), "</a></p>\n");
      }
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (bookingEnabled) {
    parts.push("    <section id=\"booking\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Book online</h2>\n      <p class=\"mt-2 text-gray-700\">");
    if (bookingSlotDuration) parts.push("Slot duration: ", escapeHtml(bookingSlotDuration), ". ");
    if (bookingLeadTime) parts.push(escapeHtml(bookingLeadTime), ".");
    parts.push("</p>\n");
    if (bookingUrl) parts.push("      <p class=\"mt-2\"><a href=\"", escapeHtml(bookingUrl), "\" class=\"inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800\" target=\"_blank\" rel=\"noopener noreferrer\">Book now</a></p>\n");
    parts.push("    </section>\n");
  }
  if (hasFaq && faqList.length > 0) {
    parts.push("    <section id=\"faq\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", faqSectionTitle, "</h2>\n");
    if (faqAsAccordion) {
      parts.push("      <div class=\"mt-2 space-y-2\">\n");
      for (const faq of faqList) {
        parts.push("        <details class=\"rounded-lg border border-gray-200\">\n          <summary class=\"cursor-pointer px-4 py-3 font-medium text-gray-900\">", escapeHtml(faq.question), "</summary>\n          <div class=\"border-t border-gray-200 px-4 py-3 text-gray-600\">", escapeHtml(faq.answer), "</div>\n        </details>\n");
      }
      parts.push("      </div>\n");
    } else {
      parts.push("      <dl class=\"mt-2 space-y-4\">\n");
      for (const faq of faqList) {
        parts.push("        <div>\n          <dt class=\"font-medium text-gray-900\">", escapeHtml(faq.question), "</dt>\n          <dd class=\"mt-1 text-gray-600\">", escapeHtml(faq.answer), "</dd>\n        </div>\n");
      }
      parts.push("      </dl>\n");
    }
    parts.push("    </section>\n");
  }
  if (hasTestimonials && testimonialsList.length > 0) {
    parts.push("    <section id=\"testimonials\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", testimonialsSectionTitle, "</h2>\n      <div class=\"mt-2 space-y-4\">\n");
    for (const t of testimonialsList) {
      parts.push("        <blockquote class=\"rounded-lg border border-gray-200 p-4\">\n");
      const testimonialDim = getRecommendedImageDimension("testimonial");
      if (t.photo) parts.push("          <div class=\"mb-2 h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100\"><img src=\"", escapeHtml(t.photo), "\" alt=\"\" class=\"h-full w-full object-cover\" width=\"", String(testimonialDim.width), "\" height=\"", String(testimonialDim.height), "\" /></div>\n");
      parts.push("          <p class=\"text-gray-700\">", escapeHtml(t.quote), "</p>\n");
      if (t.author) parts.push("          <footer class=\"mt-2 text-sm text-gray-500\">— ", escapeHtml(t.author), "</footer>\n");
      if (t.rating) parts.push("          <p class=\"mt-1 text-sm text-amber-600\">", escapeHtml(t.rating), "</p>\n");
      parts.push("        </blockquote>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (hasTeam && teamList.length > 0) {
    parts.push("    <section id=\"team\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", teamSectionTitle, "</h2>\n      <div class=\"mt-2 grid gap-4 sm:grid-cols-2\">\n");
    for (const m of teamList) {
      parts.push("        <div class=\"rounded-lg border border-gray-200 p-4\">\n");
      const teamDim = getRecommendedImageDimension("team");
      if (m.photo) parts.push("          <div class=\"mb-2 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100\"><img src=\"", escapeHtml(m.photo), "\" alt=\"\" class=\"h-full w-full object-cover\" width=\"", String(teamDim.width), "\" height=\"", String(teamDim.height), "\" /></div>\n");
      parts.push("          <p class=\"font-medium text-gray-900\">", escapeHtml(m.name), "</p>\n");
      if (m.role) parts.push("          <p class=\"text-sm text-gray-600\">", escapeHtml(m.role), "</p>\n");
      if (m.bio) parts.push("          <p class=\"mt-1 text-sm text-gray-700\">", escapeHtml(m.bio), "</p>\n");
      parts.push("        </div>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (hasCertifications && certificationsList.length > 0) {
    parts.push("    <section id=\"certifications\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", certificationsSectionTitle, "</h2>\n      <div class=\"mt-2 flex flex-wrap gap-4\">\n");
    for (const c of certificationsList) {
      parts.push("        <div class=\"flex flex-col items-start rounded-lg border border-gray-200 p-4\">\n");
      const certDim = getRecommendedImageDimension("certification");
      if (c.image) parts.push("          <img src=\"", escapeHtml(c.image), "\" alt=\"\" class=\"h-16 max-h-16 w-auto object-contain\" width=\"", String(certDim.width), "\" height=\"", String(certDim.height), "\" />\n");
      if (c.title) parts.push("          <p class=\"mt-2 text-sm font-medium text-gray-900\">", escapeHtml(c.title), "</p>\n");
      parts.push("        </div>\n");
    }
    parts.push("      </div>\n    </section>\n");
  }
  if (shareSectionTitle) {
    const shareUrl = encodeURIComponent(canonicalForShare);
    const shareTitleEnc = encodeURIComponent(title);
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", escapeHtml(shareSectionTitle), "</h2>\n");
    parts.push("      <p class=\"mt-1 text-sm text-gray-600\">Share this page</p>\n");
    parts.push("      <ul class=\"mt-2 flex flex-wrap gap-3\">\n");
    parts.push("        <li><a href=\"https://twitter.com/intent/tweet?url=", shareUrl, "&text=", shareTitleEnc, "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">Twitter</a></li>\n");
    parts.push("        <li><a href=\"https://www.facebook.com/sharer/sharer.php?u=", shareUrl, "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">Facebook</a></li>\n");
    parts.push("        <li><a href=\"https://www.linkedin.com/sharing/share-offsite/?url=", shareUrl, "\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 underline hover:text-blue-800\">LinkedIn</a></li>\n");
    parts.push("      </ul>\n    </section>\n");
  }
  if (hasNewsletter && (newsletterLabel || newsletterUrl)) {
    parts.push("    <section class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">Newsletter</h2>\n");
    if (newsletterLabel) parts.push("      <p class=\"mt-1 text-sm text-gray-600\">", escapeHtml(newsletterLabel), "</p>\n");
    if (newsletterUrl) parts.push("      <p class=\"mt-2\"><a href=\"", escapeHtml(newsletterUrl), "\" class=\"text-blue-600 underline hover:text-blue-800\" target=\"_blank\" rel=\"noopener noreferrer\">Sign up</a></p>\n");
    parts.push("    </section>\n");
  }
  parts.push("    <section id=\"contact-form\" class=\"mt-6\">\n      <h2 class=\"text-lg font-medium\">", contactFormSectionTitle, "</h2>\n");
  if (contactFormSuccessMessage) parts.push("      <p class=\"mt-1 text-sm text-gray-600\">", escapeHtml(contactFormSuccessMessage), "</p>\n");
  parts.push("      <form method=\"post\" action=\"", contactFormAction, "\" class=\"mt-2 flex flex-col gap-3 max-w-md\">\n");
  if (contactFormSubject) parts.push("        <input type=\"hidden\" name=\"subject\" value=\"", escapeHtml(contactFormSubject), "\" />\n");
  parts.push("        <input type=\"text\" name=\"name\" required placeholder=\"Name\" class=\"border rounded px-3 py-2\" />\n        <input type=\"email\" name=\"email\" required placeholder=\"Email\" class=\"border rounded px-3 py-2\" />\n        <input type=\"tel\" name=\"phone\" placeholder=\"Phone (optional)\" class=\"border rounded px-3 py-2\" />\n        <input type=\"text\" name=\"company\" placeholder=\"Company (optional)\" class=\"border rounded px-3 py-2\" />\n        <textarea name=\"message\" required placeholder=\"Message\" rows=\"4\" class=\"border rounded px-3 py-2\"></textarea>\n");
  parts.push("        <div style=\"position:absolute;left:-9999px;width:1px;height:1px;\" aria-hidden=\"true\"><label for=\"hp-website\">Leave blank</label><input type=\"text\" id=\"hp-website\" name=\"website\" tabindex=\"-1\" autocomplete=\"off\" /></div>\n");
  parts.push("        <button type=\"submit\" class=\"bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800\">Send</button>\n      </form>\n    </section>\n");
  if (showBackToTop) parts.push("    <p class=\"mt-6 text-center\"><a href=\"#\" class=\"text-sm text-gray-500 hover:text-gray-700\">Back to top</a></p>\n");
  const currentYear = new Date().getFullYear();
  parts.push("    <footer class=\"mt-12 border-t border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600\">\n      <div class=\"max-w-4xl mx-auto\">\n");
  if (hasSocialLinks && socialLinks.length > 0) {
    parts.push("        <ul class=\"flex flex-wrap gap-2 mb-4\" role=\"list\">\n");
    for (const link of socialLinks) {
      const kind = (link.kind ?? "other") as Parameters<typeof socialIconSvgInnerHtml>[0];
      const svgInner = socialIconSvgInnerHtml(kind);
      parts.push("          <li><a href=\"", escapeHtml(link.url), "\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"", escapeHtml(link.label), "\" class=\"inline-flex p-2 text-gray-600 hover:text-gray-900\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"h-6 w-6\">", svgInner, "</svg></a></li>\n");
    }
    parts.push("        </ul>\n");
  }
  if (footerText) parts.push("        <p class=\"mb-2\">", escapeHtml(footerText), "</p>\n");
  if (customDomainDisplay) parts.push("        <p class=\"mb-2\">", escapeHtml(customDomainDisplay), "</p>\n");
  if (legalName) parts.push("        <p class=\"mb-2\">Legal name: ", escapeHtml(legalName), "</p>\n");
  parts.push("        <p class=\"mt-4 pt-4 border-t border-gray-200 text-gray-500\">© ", String(currentYear), " ", businessName || "Site", ". All rights reserved.</p>\n      </div>\n    </footer>\n");
  parts.push("  </div>\n</body>\n</html>\n");
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
