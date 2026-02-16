/** Content per locale for localed_sites draft_content / published_content */
export type SiteContentLocale = {
  businessName?: string;
  /** Legal name if different from display name (DATA_WE_COLLECT §1) */
  legalName?: string;
  tagline?: string;
  /** Logo image URL (DATA_WE_COLLECT §1) */
  logo?: string;
  /** Favicon URL; can be derived from logo if not set (DATA_WE_COLLECT §1) */
  favicon?: string;
  shortDescription?: string;
  about?: string;
  /** Year established e.g. "Since 2010" (DATA_WE_COLLECT §3) */
  yearEstablished?: string;
  address?: string;
  /** Country (ISO 3166-1 alpha-2) e.g. "IN", "US" (DATA_WE_COLLECT §2) */
  country?: string;
  /** Location / area served e.g. "Serving Mumbai and suburbs" (DATA_WE_COLLECT §2) */
  areaServed?: string;
  phone?: string;
  email?: string;
  /** WhatsApp link or number (DATA_WE_COLLECT §2) */
  whatsApp?: string;
  /** Regular hours e.g. "Mon–Fri 9–6, Sat 10–4, Sun closed" (DATA_WE_COLLECT) */
  businessHours?: string;
  /** Special hours / holidays e.g. "Closed on Diwali" (optional) */
  specialHours?: string;
  /** IANA timezone e.g. "Asia/Kolkata" for business hours / "Open now" (DATA_WE_COLLECT) */
  timezone?: string;
  /** Hero/banner image URL (DATA_WE_COLLECT §4) */
  heroImage?: string;
  /** Gallery image URLs (DATA_WE_COLLECT §4) */
  galleryUrls?: string[];
  /** YouTube video URLs for embed (DATA_WE_COLLECT §4) */
  youtubeUrls?: string[];
  [key: string]: unknown;
};

export type SiteContent = {
  en?: SiteContentLocale;
  hi?: SiteContentLocale;
  [locale: string]: SiteContentLocale | undefined;
};

export type BusinessType =
  | "salon"
  | "clinic"
  | "repair"
  | "tutor"
  | "cafe"
  | "local_service"
  | "other";

export type Plan = "free" | "paid";

export type LocaledSite = {
  id: string;
  owner_id: string;
  slug: string;
  business_type: BusinessType;
  template_id: string;
  plan: Plan;
  languages: string[];
  /** Business country (ISO 3166-1 alpha-2), stored at site level in DB */
  country?: string | null;
  published_at: string | null;
  /** When set, site is archived: hidden from public, contact form disabled */
  archived_at: string | null;
  draft_content: SiteContent;
  published_content: SiteContent | null;
  created_at: string;
  updated_at: string;
};

export type CreateSiteBody = {
  business_type: BusinessType;
  slug: string;
  languages: string[];
};

export type UpdateSiteDraftBody = {
  draft_content?: Partial<SiteContent>;
  /** Site-level country (ISO 3166-1 alpha-2); stored in DB and synced into draft_content */
  country?: string | null;
  /** Set true to archive the site, false to unarchive */
  archived?: boolean;
};
