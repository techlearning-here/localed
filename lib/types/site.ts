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

/** Minimal meta stored when publishing to CDN (title, description, ogImage). */
export type PublishedMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
};

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
  /** Set when serving from DB (no CDN). When using CDN, null; recreate the site from draft_content + path + meta. */
  published_content: SiteContent | null;
  /** Path prefix for published static files (e.g. sites/{id}); used with CDN base URL */
  published_artifact_path?: string | null;
  /** Minimal meta for redirect page when serving from CDN */
  published_meta?: PublishedMeta | null;
  created_at: string;
  updated_at: string;
};

export type CreateSiteBody = {
  business_type: BusinessType;
  slug: string;
  languages: string[];
  /** Template id (MVP: 2 per business type); must be valid for business_type */
  template_id: string;
  /** Optional; stored on site and pre-fills editor so we don't ask again */
  country?: string | null;
  /** Optional; when provided (e.g. from wizard) used instead of buildDraftContentFromTemplate */
  draft_content?: SiteContent;
};

export type UpdateSiteDraftBody = {
  draft_content?: Partial<SiteContent>;
  /** Site-level country (ISO 3166-1 alpha-2); stored in DB and synced into draft_content */
  country?: string | null;
  /** Site languages; when provided, draft_content is adjusted (new locales get default content, removed ones dropped) */
  languages?: string[];
  /** Business type (salon, clinic, etc.); stored on site row */
  business_type?: BusinessType;
  /** Set true to archive the site, false to unarchive */
  archived?: boolean;
  /** Site URL slug (localed.info/{slug}); validated and must be unique */
  slug?: string;
};
