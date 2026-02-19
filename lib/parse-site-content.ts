import { getCountryLabel } from "@/lib/countries";
import { getOpenNowStatus } from "@/lib/open-now";

export type ParsedService = {
  name: string;
  description?: string;
  image?: string;
  duration?: string;
  price?: string;
  category?: string;
};

export type ParsedFaq = { question: string; answer: string };

export type ParsedTestimonial = {
  quote: string;
  author?: string;
  photo?: string;
  rating?: string;
};

export type ParsedTeamMember = {
  name: string;
  role?: string;
  photo?: string;
  bio?: string;
};

export type ParsedCertification = { title?: string; image?: string };

export type SocialLink = {
  kind: "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "tiktok" | "other";
  label: string;
  url: string;
};

export type ParsedSiteContent = {
  businessName: string;
  legalName: string;
  tagline: string;
  logo: string;
  shortDesc: string;
  about: string;
  yearEstablished: string;
  priceRange: string;
  address: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  countryCode: string;
  country: string;
  areaServed: string;
  addressDescription: string;
  locationName: string;
  serviceAreaOnly: boolean;
  serviceAreaRegions: string;
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  contactPreference: string;
  parking: string;
  accessibilityWheelchair: string;
  serviceOptions: string;
  languagesSpoken: string;
  otherAmenities: string;
  contactFormSuccessMessage: string;
  mapEmbedUrl: string;
  whatsApp: string;
  paymentMethods: string;
  directionsLabel: string;
  mapQuery: string;
  galleryUrls: string[];
  galleryCaptions: string[];
  otherVideoUrls: string[];
  otherVideoEmbeds: { embedSrc?: string; url: string }[];
  servicesIntro: string;
  bookingEnabled: boolean;
  bookingSlotDuration: string;
  bookingLeadTime: string;
  businessHours: string;
  specialHours: string;
  timezone: string;
  heroImageRaw: string;
  heroImage: string;
  youtubeUrls: string[];
  businessTypeLabel: string;
  socialLinks: SocialLink[];
  servicesList: ParsedService[];
  faqList: ParsedFaq[];
  testimonialsList: ParsedTestimonial[];
  teamList: ParsedTeamMember[];
  certificationsList: ParsedCertification[];
  ctaLabel: string;
  ctaUrl: string;
  hasCta: boolean;
  cta2Label: string;
  cta2Url: string;
  hasCta2: boolean;
  cta3Label: string;
  cta3Url: string;
  hasCta3: boolean;
  showMapLink: boolean;
  announcementBar: string;
  footerText: string;
  customDomainDisplay: string;
  showBackToTop: boolean;
  newsletterLabel: string;
  newsletterUrl: string;
  hasNewsletter: boolean;
  shareSectionTitle: string;
  faqAsAccordion: boolean;
  bookingUrl: string;
  canonicalForShare: string;
  openStatus: { open: boolean } | null;
  servicesSectionTitle: string;
  aboutSectionTitle: string;
  contactSectionTitle: string;
  hoursSectionTitle: string;
  gallerySectionTitle: string;
  videosSectionTitle: string;
  otherVideosSectionTitle: string;
  faqSectionTitle: string;
  testimonialsSectionTitle: string;
  teamSectionTitle: string;
  certificationsSectionTitle: string;
  contactFormSectionTitle: string;
  socialSectionTitle: string;
};

const DEFAULT_SECTION_TITLES = {
  servicesSectionTitle: "What we offer",
  aboutSectionTitle: "About",
  contactSectionTitle: "Contact",
  hoursSectionTitle: "Hours",
  gallerySectionTitle: "Gallery",
  videosSectionTitle: "Videos",
  otherVideosSectionTitle: "Other videos",
  faqSectionTitle: "FAQ",
  testimonialsSectionTitle: "Testimonials",
  teamSectionTitle: "Meet the team",
  certificationsSectionTitle: "Certifications & awards",
  contactFormSectionTitle: "Contact us",
  socialSectionTitle: "Follow us",
};

/**
 * Parses raw draft_content or published_content into a flat structure for display.
 * Used by both the public site and the preview page so they render identically.
 */
export function parseSiteContentForDisplay(
  content: Record<string, unknown>,
  site: { slug: string; business_type?: string; country?: string },
  options?: { siteBaseUrl?: string }
): ParsedSiteContent {
  const businessName = String(content.businessName || "").trim() || site.slug || "Site";
  const legalName = typeof content.legalName === "string" ? content.legalName.trim() : "";
  const tagline = typeof content.tagline === "string" ? content.tagline.trim() : "";
  const logo = typeof content.logo === "string" ? content.logo : "";
  const shortDesc = typeof content.shortDescription === "string" ? content.shortDescription : "";
  const about = typeof content.about === "string" ? content.about : "";
  const yearEstablished = typeof content.yearEstablished === "string" ? content.yearEstablished : "";
  const priceRange = typeof content.priceRange === "string" ? content.priceRange.trim() : "";
  const address = typeof content.address === "string" ? content.address : "";
  const addressLocality = typeof content.addressLocality === "string" ? content.addressLocality.trim() : "";
  const addressRegion = typeof content.addressRegion === "string" ? content.addressRegion.trim() : "";
  const postalCode = typeof content.postalCode === "string" ? content.postalCode.trim() : "";
  const countryCode = typeof content.country === "string" ? content.country : (site.country ?? "");
  const country = countryCode ? getCountryLabel(countryCode) : "";
  const areaServed = typeof content.areaServed === "string" ? content.areaServed : "";
  const addressDescription = typeof content.addressDescription === "string" ? content.addressDescription.trim() : "";
  const locationName = typeof content.locationName === "string" ? content.locationName.trim() : "";
  const serviceAreaOnly = content.serviceAreaOnly === true || content.serviceAreaOnly === "true";
  const serviceAreaRegions = typeof content.serviceAreaRegions === "string" ? content.serviceAreaRegions.trim() : "";
  const phone = typeof content.phone === "string" ? content.phone : "";
  const phone2 = typeof content.phone2 === "string" ? content.phone2.trim() : "";
  const email = typeof content.email === "string" ? content.email : "";
  const parking = typeof content.parking === "string" ? content.parking.trim() : "";
  const accessibilityWheelchair = typeof content.accessibilityWheelchair === "string" ? content.accessibilityWheelchair.trim() : "";
  const serviceOptions = typeof content.serviceOptions === "string" ? content.serviceOptions.trim() : "";
  const languagesSpoken = typeof content.languagesSpoken === "string" ? content.languagesSpoken.trim() : "";
  const otherAmenities = typeof content.otherAmenities === "string" ? content.otherAmenities.trim() : "";
  const email2 = typeof content.email2 === "string" ? content.email2.trim() : "";
  const contactPreference = typeof content.contactPreference === "string" ? content.contactPreference.trim() : "";
  const contactFormSuccessMessage = typeof content.contactFormSuccessMessage === "string" ? content.contactFormSuccessMessage.trim() : "";
  const mapEmbedUrl = typeof content.mapEmbedUrl === "string" ? content.mapEmbedUrl.trim() : "";
  const whatsApp = typeof content.whatsApp === "string" ? content.whatsApp : "";
  const paymentMethods = typeof content.paymentMethods === "string" ? content.paymentMethods.trim() : "";
  const directionsLabel = typeof content.directionsLabel === "string" ? content.directionsLabel.trim() || "View on map" : "View on map";
  const mapQuery = [address, addressLocality, addressRegion, postalCode, country].filter(Boolean).join(", ") || "";
  const galleryUrls = Array.isArray(content.galleryUrls) ? content.galleryUrls.filter((u): u is string => typeof u === "string") : [];
  const galleryCaptions = Array.isArray(content.galleryCaptions)
    ? (content.galleryCaptions as unknown[]).slice(0, galleryUrls.length).map((c) => (typeof c === "string" ? c : ""))
    : [];
  const otherVideoUrls = Array.isArray(content.otherVideoUrls)
    ? (content.otherVideoUrls as unknown[]).filter((u): u is string => typeof u === "string")
    : [];
  const otherVideoEmbeds: { embedSrc?: string; url: string }[] = otherVideoUrls.map((url) => {
    const vimeoId = url.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/)?.[1];
    return vimeoId ? { embedSrc: `https://player.vimeo.com/video/${vimeoId}`, url } : { url };
  });
  const servicesIntro = typeof content.servicesIntro === "string" ? content.servicesIntro.trim() : "";
  const bookingEnabled = Boolean(content.bookingEnabled);
  const bookingSlotDuration = typeof content.bookingSlotDuration === "string" ? content.bookingSlotDuration.trim() : "";
  const bookingLeadTime = typeof content.bookingLeadTime === "string" ? content.bookingLeadTime.trim() : "";
  const businessHours = typeof content.businessHours === "string" ? content.businessHours : "";
  const specialHours = typeof content.specialHours === "string" ? content.specialHours : "";
  const timezone = typeof content.timezone === "string" ? content.timezone : "";
  const heroImageRaw = typeof content.heroImage === "string" ? content.heroImage : "";
  const heroImage = heroImageRaw || (galleryUrls.length > 0 ? "" : "https://placehold.co/1200x400/e2e8f0/64748b?text=No+image");
  const youtubeUrls = Array.isArray(content.youtubeUrls) ? content.youtubeUrls.filter((u): u is string => typeof u === "string") : [];
  const businessTypeLabel = site.business_type ? String(site.business_type).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const facebookUrl = typeof content.facebookUrl === "string" ? content.facebookUrl.trim() : "";
  const instagramUrl = typeof content.instagramUrl === "string" ? content.instagramUrl.trim() : "";
  const youtubeChannelUrl = typeof content.youtubeChannelUrl === "string" ? content.youtubeChannelUrl.trim() : "";
  const twitterUrl = typeof content.twitterUrl === "string" ? content.twitterUrl.trim() : "";
  const linkedinUrl = typeof content.linkedinUrl === "string" ? content.linkedinUrl.trim() : "";
  const tiktokUrl = typeof content.tiktokUrl === "string" ? content.tiktokUrl.trim() : "";
  const otherLinkLabel = typeof content.otherLinkLabel === "string" ? content.otherLinkLabel.trim() : "";
  const otherLinkUrl = typeof content.otherLinkUrl === "string" ? content.otherLinkUrl.trim() : "";
  const socialLinks: SocialLink[] = [];
  if (facebookUrl) socialLinks.push({ kind: "facebook", label: "Facebook", url: facebookUrl });
  if (instagramUrl) socialLinks.push({ kind: "instagram", label: "Instagram", url: instagramUrl });
  if (youtubeChannelUrl) socialLinks.push({ kind: "youtube", label: "YouTube", url: youtubeChannelUrl });
  if (twitterUrl) socialLinks.push({ kind: "x", label: "X", url: twitterUrl });
  if (linkedinUrl) socialLinks.push({ kind: "linkedin", label: "LinkedIn", url: linkedinUrl });
  if (tiktokUrl) socialLinks.push({ kind: "tiktok", label: "TikTok", url: tiktokUrl });
  if (otherLinkUrl) socialLinks.push({ kind: "other", label: otherLinkLabel || "Link", url: otherLinkUrl });

  const rawServices = content.services;
  const servicesList: ParsedService[] = Array.isArray(rawServices)
    ? (rawServices as Record<string, unknown>[])
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

  const rawFaq = content.faq;
  const faqList: ParsedFaq[] = Array.isArray(rawFaq)
    ? (rawFaq as Record<string, unknown>[])
        .filter((f): f is Record<string, unknown> => f != null && typeof f === "object")
        .map((f) => ({
          question: typeof f.question === "string" ? f.question : "",
          answer: typeof f.answer === "string" ? f.answer : "",
        }))
        .filter((f) => f.question.trim() !== "")
    : [];

  const rawTestimonials = content.testimonials;
  const testimonialsList: ParsedTestimonial[] = Array.isArray(rawTestimonials)
    ? (rawTestimonials as Record<string, unknown>[])
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          quote: typeof t.quote === "string" ? t.quote : "",
          author: typeof t.author === "string" ? t.author : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          rating: typeof t.rating === "string" ? t.rating : undefined,
        }))
        .filter((t) => t.quote.trim() !== "")
    : [];

  const rawTeam = content.team;
  const teamList: ParsedTeamMember[] = Array.isArray(rawTeam)
    ? (rawTeam as Record<string, unknown>[])
        .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
        .map((t) => ({
          name: typeof t.name === "string" ? t.name : "",
          role: typeof t.role === "string" ? t.role : undefined,
          photo: typeof t.photo === "string" ? t.photo : undefined,
          bio: typeof t.bio === "string" ? t.bio : undefined,
        }))
        .filter((t) => t.name.trim() !== "")
    : [];

  const rawCertifications = content.certifications;
  const certificationsList: ParsedCertification[] = Array.isArray(rawCertifications)
    ? (rawCertifications as Record<string, unknown>[])
        .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
        .map((c) => ({
          title: typeof c.title === "string" ? c.title : undefined,
          image: typeof c.image === "string" ? c.image : undefined,
        }))
        .filter((c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== ""))
    : [];

  const ctaLabel = typeof content.ctaLabel === "string" ? content.ctaLabel.trim() : "";
  const ctaUrl = typeof content.ctaUrl === "string" ? content.ctaUrl.trim() : "";
  const cta2Label = typeof content.cta2Label === "string" ? content.cta2Label.trim() : "";
  const cta2Url = typeof content.cta2Url === "string" ? content.cta2Url.trim() : "";
  const cta3Label = typeof content.cta3Label === "string" ? content.cta3Label.trim() : "";
  const cta3Url = typeof content.cta3Url === "string" ? content.cta3Url.trim() : "";
  const showMapLink = content.showMapLink !== false && content.showMapLink !== "false";
  const announcementBar = typeof content.announcementBar === "string" ? content.announcementBar.trim() : "";
  const footerText = typeof content.footerText === "string" ? content.footerText.trim() : "";
  const customDomainDisplay = typeof content.customDomainDisplay === "string" ? content.customDomainDisplay.trim() : "";
  const showBackToTop = Boolean(content.showBackToTop);
  const newsletterLabel = typeof content.newsletterLabel === "string" ? content.newsletterLabel.trim() : "";
  const newsletterUrl = typeof content.newsletterUrl === "string" ? content.newsletterUrl.trim() : "";
  const hasNewsletter = Boolean((content.hasNewsletter === true || content.hasNewsletter === "true") && (newsletterLabel || newsletterUrl));
  const shareSectionTitle = typeof content.shareSectionTitle === "string" ? content.shareSectionTitle.trim() : "";
  const faqAsAccordion = Boolean(content.faqAsAccordion);
  const bookingUrl = typeof content.bookingUrl === "string" ? content.bookingUrl.trim() : "";
  const siteBaseUrl = options?.siteBaseUrl ?? "";
  const canonicalForShare = siteBaseUrl ? `${siteBaseUrl.replace(/\/$/, "")}/${site.slug}` : "";

  const openStatus = timezone && businessHours ? getOpenNowStatus(timezone, businessHours) : null;

  const servicesSectionTitle = typeof content.servicesSectionTitle === "string" ? content.servicesSectionTitle.trim() || DEFAULT_SECTION_TITLES.servicesSectionTitle : DEFAULT_SECTION_TITLES.servicesSectionTitle;
  const aboutSectionTitle = typeof content.aboutSectionTitle === "string" ? content.aboutSectionTitle.trim() || DEFAULT_SECTION_TITLES.aboutSectionTitle : DEFAULT_SECTION_TITLES.aboutSectionTitle;
  const contactSectionTitle = typeof content.contactSectionTitle === "string" ? content.contactSectionTitle.trim() || DEFAULT_SECTION_TITLES.contactSectionTitle : DEFAULT_SECTION_TITLES.contactSectionTitle;
  const hoursSectionTitle = typeof content.hoursSectionTitle === "string" ? content.hoursSectionTitle.trim() || DEFAULT_SECTION_TITLES.hoursSectionTitle : DEFAULT_SECTION_TITLES.hoursSectionTitle;
  const gallerySectionTitle = typeof content.gallerySectionTitle === "string" ? content.gallerySectionTitle.trim() || DEFAULT_SECTION_TITLES.gallerySectionTitle : DEFAULT_SECTION_TITLES.gallerySectionTitle;
  const videosSectionTitle = typeof content.videosSectionTitle === "string" ? content.videosSectionTitle.trim() || DEFAULT_SECTION_TITLES.videosSectionTitle : DEFAULT_SECTION_TITLES.videosSectionTitle;
  const otherVideosSectionTitle = typeof content.otherVideosSectionTitle === "string" ? content.otherVideosSectionTitle.trim() || DEFAULT_SECTION_TITLES.otherVideosSectionTitle : DEFAULT_SECTION_TITLES.otherVideosSectionTitle;
  const faqSectionTitle = typeof content.faqSectionTitle === "string" ? content.faqSectionTitle.trim() || DEFAULT_SECTION_TITLES.faqSectionTitle : DEFAULT_SECTION_TITLES.faqSectionTitle;
  const testimonialsSectionTitle = typeof content.testimonialsSectionTitle === "string" ? content.testimonialsSectionTitle.trim() || DEFAULT_SECTION_TITLES.testimonialsSectionTitle : DEFAULT_SECTION_TITLES.testimonialsSectionTitle;
  const teamSectionTitle = typeof content.teamSectionTitle === "string" ? content.teamSectionTitle.trim() || DEFAULT_SECTION_TITLES.teamSectionTitle : DEFAULT_SECTION_TITLES.teamSectionTitle;
  const certificationsSectionTitle = typeof content.certificationsSectionTitle === "string" ? content.certificationsSectionTitle.trim() || DEFAULT_SECTION_TITLES.certificationsSectionTitle : DEFAULT_SECTION_TITLES.certificationsSectionTitle;
  const contactFormSectionTitle = typeof content.contactFormSectionTitle === "string" ? content.contactFormSectionTitle.trim() || DEFAULT_SECTION_TITLES.contactFormSectionTitle : DEFAULT_SECTION_TITLES.contactFormSectionTitle;
  const socialSectionTitle = typeof content.socialSectionTitle === "string" ? content.socialSectionTitle.trim() || DEFAULT_SECTION_TITLES.socialSectionTitle : DEFAULT_SECTION_TITLES.socialSectionTitle;

  return {
    businessName,
    legalName,
    tagline,
    logo,
    shortDesc,
    about,
    yearEstablished,
    priceRange,
    address,
    addressLocality,
    addressRegion,
    postalCode,
    countryCode,
    country,
    areaServed,
    addressDescription,
    locationName,
    serviceAreaOnly,
    serviceAreaRegions,
    phone,
    phone2,
    email,
    email2,
    contactPreference,
    parking,
    accessibilityWheelchair,
    serviceOptions,
    languagesSpoken,
    otherAmenities,
    contactFormSuccessMessage,
    mapEmbedUrl,
    whatsApp,
    paymentMethods,
    directionsLabel,
    mapQuery,
    galleryUrls,
    galleryCaptions,
    otherVideoUrls,
    otherVideoEmbeds,
    servicesIntro,
    bookingEnabled,
    bookingSlotDuration,
    bookingLeadTime,
    businessHours,
    specialHours,
    timezone,
    heroImageRaw,
    heroImage,
    youtubeUrls,
    businessTypeLabel,
    socialLinks,
    servicesList,
    faqList,
    testimonialsList,
    teamList,
    certificationsList,
    ctaLabel,
    ctaUrl,
    hasCta: !!(ctaLabel && ctaUrl),
    cta2Label,
    cta2Url,
    hasCta2: !!(cta2Label && cta2Url),
    cta3Label,
    cta3Url,
    hasCta3: !!(cta3Label && cta3Url),
    showMapLink,
    announcementBar,
    footerText,
    customDomainDisplay,
    showBackToTop,
    newsletterLabel,
    newsletterUrl,
    hasNewsletter,
    shareSectionTitle,
    faqAsAccordion,
    bookingUrl,
    canonicalForShare,
    openStatus,
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
  };
}
