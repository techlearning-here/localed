import type { SiteContent, ServiceItem, FaqItem, TestimonialItem, TeamMemberItem, CertificationAwardItem } from "@/lib/types/site";
import { getTemplateById } from "@/lib/template-catalog";

const DEFAULT_LOCALE_CONTENT = {
  businessName: "",
  legalName: "",
  tagline: "",
  logo: "",
  favicon: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  shortDescription: "",
  about: "",
  yearEstablished: "",
  address: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  country: "",
  areaServed: "",
  phone: "",
  phone2: "",
  email: "",
  whatsApp: "",
  contactFormSubject: "",
  contactPreference: "",
  email2: "",
  contactFormSuccessMessage: "",
  priceRange: "",
  mapEmbedUrl: "",
  businessHours: "",
  specialHours: "",
  timezone: "",
  heroImage: "",
  galleryUrls: [] as string[],
  galleryCaptions: [] as string[],
  youtubeUrls: [] as string[],
  otherVideoUrls: [] as string[],
  facebookUrl: "",
  instagramUrl: "",
  youtubeChannelUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  otherLinkLabel: "",
  otherLinkUrl: "",
  services: [] as ServiceItem[],
  faq: [] as FaqItem[],
  ctaLabel: "",
  ctaUrl: "",
  cta2Label: "",
  cta2Url: "",
  cta3Label: "",
  cta3Url: "",
  paymentMethods: "",
  testimonials: [] as TestimonialItem[],
  team: [] as TeamMemberItem[],
  certifications: [] as CertificationAwardItem[],
  bookingEnabled: false,
  bookingSlotDuration: "",
  bookingLeadTime: "",
  bookingServiceIds: [] as string[],
  bookingUrl: "",
  showMapLink: true,
  announcementBar: "",
  footerText: "",
  servicesSectionTitle: "",
  aboutSectionTitle: "",
  contactSectionTitle: "",
  hoursSectionTitle: "",
  gallerySectionTitle: "",
  videosSectionTitle: "",
  otherVideosSectionTitle: "",
  faqSectionTitle: "",
  testimonialsSectionTitle: "",
  teamSectionTitle: "",
  certificationsSectionTitle: "",
  contactFormSectionTitle: "",
  socialSectionTitle: "",
  themeColor: "",
  robotsMeta: "",
  customCssUrl: "",
  directionsLabel: "",
  showBackToTop: false,
  hasNewsletter: false,
  newsletterLabel: "",
  newsletterUrl: "",
  shareSectionTitle: "",
  customDomainDisplay: "",
  contactFormReplyToName: "",
  faqAsAccordion: false,
};

/**
 * Build initial draft_content from template and selected languages.
 * Optional country seeds each locale so the editor shows it without asking again.
 */
export function buildInitialDraftContent(
  languages: string[],
  country?: string | null
): SiteContent {
  const countryVal = country != null && String(country).trim() !== "" ? String(country).trim() : "";
  const content: SiteContent = {};
  for (const lang of languages) {
    content[lang] = {
      ...DEFAULT_LOCALE_CONTENT,
      country: countryVal,
      galleryUrls: [],
      galleryCaptions: [],
      youtubeUrls: [],
      otherVideoUrls: [],
      services: [],
      faq: [],
      testimonials: [],
      team: [] as TeamMemberItem[],
      certifications: [] as CertificationAwardItem[],
      bookingServiceIds: [],
    };
  }
  return content;
}

/**
 * Build draft_content from a template: base defaults plus template extra fields.
 * Used when creating a site with a selected template (MVP: 2 templates per business type).
 */
export function buildDraftContentFromTemplate(
  templateId: string,
  languages: string[],
  country?: string | null,
  extraFieldValues?: Record<string, string>
): SiteContent {
  const base = buildInitialDraftContent(languages, country);
  const template = getTemplateById(templateId);
  if (!template || !template.extraFields?.length) {
    return base;
  }
  const values = extraFieldValues ?? {};
  const content: SiteContent = {};
  for (const lang of languages) {
    const localeContent = { ...(base[lang] ?? base.en ?? {}) } as Record<string, unknown>;
    for (const field of template.extraFields) {
      localeContent[field.key] = values[field.key] ?? "";
    }
    content[lang] = localeContent;
  }
  return content;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 64 && SLUG_REGEX.test(slug);
}
