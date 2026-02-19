/** Single certification or award (DATA_WE_COLLECT §10): text and/or image */
export type CertificationAwardItem = {
  title?: string;
  image?: string;
};

/** Single team member (DATA_WE_COLLECT §10): name, role, optional photo and bio */
export type TeamMemberItem = {
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
};

/** Single testimonial (DATA_WE_COLLECT §10): quote, author, optional photo and rating */
export type TestimonialItem = {
  quote: string;
  author?: string;
  photo?: string;
  rating?: string;
};

/** Single FAQ item (DATA_WE_COLLECT §10) */
export type FaqItem = {
  question: string;
  answer: string;
};

/** Single service (or menu item / product) for DATA_WE_COLLECT §5 */
export type ServiceItem = {
  name: string;
  description?: string;
  image?: string;
  duration?: string;
  price?: string;
  /** Optional category to group services (e.g. "Hair", "Nails") */
  category?: string;
};

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
  /** SEO override: meta title (defaults to business name + tagline) (DATA_WE_COLLECT §9) */
  metaTitle?: string;
  /** SEO override: meta description (defaults to short description) (DATA_WE_COLLECT §9) */
  metaDescription?: string;
  /** SEO: optional keywords for meta or directory (DATA_WE_COLLECT §9) */
  keywords?: string;
  shortDescription?: string;
  about?: string;
  /** Year established e.g. "Since 2010" (DATA_WE_COLLECT §3) */
  yearEstablished?: string;
  address?: string;
  /** Locality (city) for address display and schema */
  addressLocality?: string;
  /** Region (state/province) for schema */
  addressRegion?: string;
  /** Postal code */
  postalCode?: string;
  /** Country (ISO 3166-1 alpha-2) e.g. "IN", "US" (DATA_WE_COLLECT §2) */
  country?: string;
  /** Location / area served e.g. "Serving Mumbai and suburbs" (DATA_WE_COLLECT §2) */
  areaServed?: string;
  /** Instructions to find the place e.g. "Use the rear entrance", "Next to the bank" */
  addressDescription?: string;
  /** Optional location name e.g. "Downtown branch" (for multi-location) */
  locationName?: string;
  /** Service-area only: we serve customers at their location (no physical storefront). When true, address can be hidden from public. */
  serviceAreaOnly?: boolean;
  /** When serviceAreaOnly: regions/cities served e.g. "Mumbai, Thane, Navi Mumbai" */
  serviceAreaRegions?: string;
  phone?: string;
  /** Optional second phone (DATA_WE_COLLECT §2) */
  phone2?: string;
  email?: string;
  /** WhatsApp link or number (DATA_WE_COLLECT §2) */
  whatsApp?: string;
  /** Optional subject line for contact form emails */
  contactFormSubject?: string;
  /** Preferred contact method e.g. "phone", "email", "whatsapp" (DATA_WE_COLLECT §2) */
  contactPreference?: string;
  /** Optional second email (DATA_WE_COLLECT §2) */
  email2?: string;
  /** Custom message shown after contact form submit (optional) */
  contactFormSuccessMessage?: string;
  /** Price range for schema e.g. "$$" (DATA_WE_COLLECT §9 / schema.org) */
  priceRange?: string;
  /** Optional map embed iframe URL (e.g. from Google Maps share > Embed) */
  mapEmbedUrl?: string;
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
  /** Optional caption per gallery image (same order as galleryUrls) */
  galleryCaptions?: string[];
  /** YouTube video URLs for embed (DATA_WE_COLLECT §4) */
  youtubeUrls?: string[];
  /** Other video URLs e.g. Vimeo (DATA_WE_COLLECT §4, later) */
  otherVideoUrls?: string[];
  /** Social and external links (DATA_WE_COLLECT §7) */
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeChannelUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  /** Optional "Other" link: label (e.g. "Blog") and URL */
  otherLinkLabel?: string;
  otherLinkUrl?: string;
  /** Services / what we offer / menu (DATA_WE_COLLECT §5) */
  services?: ServiceItem[];
  /** FAQ question + answer pairs (DATA_WE_COLLECT §10) */
  faq?: FaqItem[];
  /** CTA button e.g. "Call now", "Book now" — label + URL (DATA_WE_COLLECT §10) */
  ctaLabel?: string;
  ctaUrl?: string;
  /** Second CTA button (optional) */
  cta2Label?: string;
  cta2Url?: string;
  /** Third CTA button (optional) */
  cta3Label?: string;
  cta3Url?: string;
  /** Payment methods e.g. "We accept Cash, Card, UPI." (DATA_WE_COLLECT §10) */
  paymentMethods?: string;
  /** Testimonials: quote, author, optional photo/rating (DATA_WE_COLLECT §10) */
  testimonials?: TestimonialItem[];
  /** Team / staff: name, role, optional photo and bio (DATA_WE_COLLECT §10) */
  team?: TeamMemberItem[];
  /** Certifications / awards: text or image (DATA_WE_COLLECT §10) */
  certifications?: CertificationAwardItem[];
  /** Appointments (DATA_WE_COLLECT §8): booking on/off */
  bookingEnabled?: boolean;
  /** Slot duration e.g. "30 min" (DATA_WE_COLLECT §8) */
  bookingSlotDuration?: string;
  /** Lead time e.g. "Book at least 2 hours ahead" (DATA_WE_COLLECT §8) */
  bookingLeadTime?: string;
  /** Service names that can be booked; empty = all (DATA_WE_COLLECT §8) */
  bookingServiceIds?: string[];
  /** External booking URL when booking enabled (e.g. Calendly link) */
  bookingUrl?: string;
  /** When false, hide "View on map" link (address still shown) */
  showMapLink?: boolean;
  /** Optional one-line announcement at top of site */
  announcementBar?: string;
  /** Optional footer text (e.g. "© 2024 Business Name") */
  footerText?: string;
  /** Section title overrides (defaults: "What we offer", "About", "Contact", etc.) */
  servicesSectionTitle?: string;
  aboutSectionTitle?: string;
  contactSectionTitle?: string;
  hoursSectionTitle?: string;
  gallerySectionTitle?: string;
  videosSectionTitle?: string;
  otherVideosSectionTitle?: string;
  faqSectionTitle?: string;
  testimonialsSectionTitle?: string;
  teamSectionTitle?: string;
  certificationsSectionTitle?: string;
  contactFormSectionTitle?: string;
  socialSectionTitle?: string;
  /** Optional primary/theme color (hex) for buttons/links */
  themeColor?: string;
  /** Robots meta e.g. "noindex, nofollow" (optional) */
  robotsMeta?: string;
  /** Optional custom CSS URL (linked in head) */
  customCssUrl?: string;
  /** Label for map/directions link (default: "View on map") */
  directionsLabel?: string;
  /** Show "Back to top" link at bottom when true */
  showBackToTop?: boolean;
  /** Newsletter CTA: label and URL (e.g. "Subscribe" → mailto or signup page) */
  newsletterLabel?: string;
  newsletterUrl?: string;
  /** When true, show newsletter block on the site (requires newsletterLabel or newsletterUrl) */
  hasNewsletter?: boolean;
  /** Share section: title (e.g. "Share this page"); when set, show share links */
  shareSectionTitle?: string;
  /** Custom domain display in footer (e.g. "Visit us at example.com") */
  customDomainDisplay?: string;
  /** Parking e.g. "Free lot", "Street parking", "Paid garage" (local SEO / GBP-style) */
  parking?: string;
  /** Accessibility e.g. "Wheelchair accessible", "Ramp at rear" */
  accessibilityWheelchair?: string;
  /** Service options e.g. "Dine-in, Takeout, Delivery, Curbside pickup" */
  serviceOptions?: string;
  /** Languages spoken (if different from site UI languages) e.g. "English, Hindi, Marathi" */
  languagesSpoken?: string;
  /** Other amenities e.g. "Outdoor seating, Free Wi-Fi, 24/7" */
  otherAmenities?: string;
  /** Contact form: reply-to display name for notification email */
  contactFormReplyToName?: string;
  /** Render FAQ as accordion (details/summary) when true */
  faqAsAccordion?: boolean;
  /** Single page (all sections on one page) or multi-page (separate pages for About, Services, etc.) */
  siteLayout?: "single_page" | "multi_page";
  [key: string]: unknown;
};

export type SiteLayout = "single_page" | "multi_page";

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
  /** Editor-only: field keys that were assistant-prefilled; persisted in DB so sample indication survives publish and re-edit */
  assistant_prefilled_fields?: string[] | null;
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
  /** Optional; editor-only keys of assistant-prefilled fields, persisted so sample indication survives publish */
  assistant_prefilled_fields?: string[];
};

export type UpdateSiteDraftBody = {
  draft_content?: Partial<SiteContent>;
  /** Editor-only: persist assistant-prefilled field keys so sample indication survives publish and re-edit */
  assistant_prefilled_fields?: string[];
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
