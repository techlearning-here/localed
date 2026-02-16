import type { SiteContent } from "@/lib/types/site";

const DEFAULT_LOCALE_CONTENT = {
  businessName: "",
  legalName: "",
  tagline: "",
  logo: "",
  favicon: "",
  shortDescription: "",
  about: "",
  yearEstablished: "",
  address: "",
  country: "",
  areaServed: "",
  phone: "",
  email: "",
  whatsApp: "",
  businessHours: "",
  specialHours: "",
  timezone: "",
  heroImage: "",
  galleryUrls: [] as string[],
  youtubeUrls: [] as string[],
};

/**
 * Build initial draft_content from template and selected languages.
 */
export function buildInitialDraftContent(languages: string[]): SiteContent {
  const content: SiteContent = {};
  for (const lang of languages) {
    content[lang] = { ...DEFAULT_LOCALE_CONTENT, galleryUrls: [], youtubeUrls: [] };
  }
  return content;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 64 && SLUG_REGEX.test(slug);
}
