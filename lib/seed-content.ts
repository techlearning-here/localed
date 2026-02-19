import type { SiteContent, SiteContentLocale, BusinessType } from "@/lib/types/site";
import { getContentPlan } from "@/lib/content-plan";
import { getPlaceholderImages } from "@/lib/placeholder-images";

/**
 * Create-with-assistance content source.
 * Content is planned by site type (see lib/content-plan.ts and docs/CONTENT_PLAN_BY_SITE_TYPE.md).
 * Currently: static seed from that plan. Later: optional AI endpoint can generate from the same plan.
 */

/** Shared defaults for all types (address, hours, contact, UI). */
function getSharedSeedDefaults(businessName: string): Partial<SiteContentLocale> {
  return {
    yearEstablished: "Since 2014",
    address: "123 Main Street, Suite 100",
    addressLocality: "Your City",
    addressRegion: "Your State",
    postalCode: "10001",
    country: "US",
    areaServed: "Your City and surrounding areas",
    addressDescription: "",
    locationName: "",
    serviceAreaOnly: false,
    serviceAreaRegions: "",
    phone: "+1 (555) 123-4567",
    phone2: "",
    email: `hello@${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.example.com`,
    email2: "",
    whatsApp: "https://wa.me/15551234567",
    parking: "Free parking available",
    accessibilityWheelchair: "Wheelchair accessible",
    serviceOptions: "Walk-ins welcome, By appointment",
    languagesSpoken: "English, Spanish",
    otherAmenities: "Free Wi-Fi",
    contactFormSubject: "Website inquiry",
    contactFormReplyToName: businessName,
    contactPreference: "email",
    contactFormSuccessMessage: "Thanks! We'll get back to you within 24 hours.",
    priceRange: "$$",
    mapEmbedUrl: "",
    directionsLabel: "View on map",
    businessHours: "Mon–Fri 9:00 AM–7:00 PM, Sat 9:00 AM–5:00 PM, Sun closed",
    specialHours: "Closed on major holidays. Shorter hours on Christmas Eve.",
    timezone: "America/New_York",
    heroImage: "", // set per type in buildSeedLocaleFromPlan
    galleryUrls: [],
    galleryCaptions: [],
    youtubeUrls: [],
    otherVideoUrls: [],
    facebookUrl: "https://facebook.com/example",
    instagramUrl: "https://instagram.com/example",
    youtubeChannelUrl: "https://youtube.com",
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    tiktokUrl: "https://tiktok.com",
    otherLinkLabel: "Website",
    otherLinkUrl: "#",
    bookingEnabled: false,
    bookingSlotDuration: "60 min",
    bookingLeadTime: "Book at least 2 hours ahead",
    bookingServiceIds: [],
    bookingUrl: "#contact",
    showMapLink: true,
    announcementBar: "",
    footerText: `© 2024 ${businessName}. All rights reserved.`,
    gallerySectionTitle: "Gallery",
    videosSectionTitle: "Videos",
    otherVideosSectionTitle: "More videos",
    contactFormSectionTitle: "Get in touch",
    socialSectionTitle: "Follow us",
    themeColor: "#0f172a",
    robotsMeta: "",
    customCssUrl: "",
    showBackToTop: true,
    hasNewsletter: false,
    newsletterLabel: "Subscribe to our newsletter",
    newsletterUrl: "#",
    shareSectionTitle: "Share this page",
    customDomainDisplay: "",
    faqAsAccordion: true,
    siteLayout: "single_page",
  };
}

/**
 * Builds full seed locale from the content plan for the given site type.
 * Plan defines type-specific copy, services, FAQ, team, etc.; shared defaults fill contact and UI.
 * Placeholder images (hero, gallery, logo) from Picsum Photos are filled per type.
 */
function buildSeedLocaleFromPlan(businessType: BusinessType): SiteContentLocale {
  const plan = getContentPlan(businessType);
  const shared = getSharedSeedDefaults(plan.businessName);
  const placeholders = getPlaceholderImages(businessType);
  return {
    ...shared,
    heroImage: placeholders.hero,
    galleryUrls: placeholders.gallery,
    galleryCaptions: placeholders.gallery.map(() => ""),
    logo: placeholders.logo,
    favicon: placeholders.logo,
    businessName: plan.businessName,
    legalName: plan.legalName,
    tagline: plan.tagline,
    metaTitle: plan.metaTitle,
    metaDescription: plan.metaDescription,
    keywords: plan.keywords,
    shortDescription: plan.shortDescription,
    about: plan.about,
    services: plan.services.map((s, i) => ({
      ...s,
      image: placeholders.serviceImages[i] ?? s.image,
    })),
    faq: plan.faq,
    ctaLabel: plan.ctaLabel,
    ctaUrl: plan.ctaUrl,
    cta2Label: plan.cta2Label,
    cta2Url: plan.cta2Url,
    cta3Label: plan.cta3Label,
    cta3Url: plan.cta3Url,
    paymentMethods: plan.paymentMethods,
    testimonials: plan.testimonials,
    team: plan.team.map((t, i) => ({
      ...t,
      photo: placeholders.teamImages[i] ?? t.photo,
    })),
    certifications: plan.certifications,
    servicesSectionTitle: plan.servicesSectionTitle,
    aboutSectionTitle: plan.aboutSectionTitle,
    contactSectionTitle: plan.contactSectionTitle,
    hoursSectionTitle: plan.hoursSectionTitle,
    faqSectionTitle: plan.faqSectionTitle,
    testimonialsSectionTitle: plan.testimonialsSectionTitle,
    teamSectionTitle: plan.teamSectionTitle,
    certificationsSectionTitle: plan.certificationsSectionTitle,
  };
}

/**
 * Returns full seed content (all fields populated) for the given business type and languages.
 * Content is planned by site type (see docs/CONTENT_PLAN_BY_SITE_TYPE.md).
 *
 * @param businessType - salon, clinic, cafe, etc.
 * @param languages - e.g. ["en", "hi"]; each locale gets the same content (English sample for now)
 */
export function getSeedContent(businessType: BusinessType, languages: string[]): SiteContent {
  const localeContent = buildSeedLocaleFromPlan(businessType);
  const content: SiteContent = {};
  for (const lang of languages) {
    content[lang] = { ...localeContent };
  }
  return content;
}

/** Options for assisted content (reserved for future AI / external provider). */
export type AssistedContentOptions = {
  /** When true, call external AI endpoint instead of static seed (not implemented yet). */
  useAiEndpoint?: boolean;
  /** Optional hint for AI, e.g. business name or extra context. */
  hint?: string;
};

/**
 * Returns content for "Create with assistance". Async so we can later call an AI endpoint.
 * Currently uses static seed from the content plan; when useAiEndpoint is supported,
 * the same plan can drive AI prompts or expected structure.
 */
export async function getAssistedContent(
  businessType: BusinessType,
  languages: string[],
  _options?: AssistedContentOptions
): Promise<SiteContent> {
  return Promise.resolve(getSeedContent(businessType, languages));
}
