"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessType, LocaledSite, ServiceItem, FaqItem, TestimonialItem, TeamMemberItem, CertificationAwardItem } from "@/lib/types/site";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { DEFAULT_LANGUAGE, getLanguagesForCountry } from "@/lib/languages";
import { useDashboardFeatures } from "@/app/dashboard/features-context";
import {
  getTemplatesForBusinessType,
  getTemplateById,
  getDefaultTemplateIdForBusinessType,
  isTemplateValidForBusinessType,
} from "@/lib/template-catalog";
import { getSeedContent } from "@/lib/seed-content"; // static for now; getAssistedContent() available for future AI endpoint
import { getRecommendedDimensionHint } from "@/lib/image-dimensions";
import { QRCodeSection } from "./qr-code-section";
import { ContactSubmissionsSection } from "./contact-submissions-section";

/** Base URL for the app; published site and QR code use this + site slug (user’s site name). */
const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
/** When set (e.g. https://localed.info), published link and QR code use this so they always point to the canonical domain. */
const PUBLIC_SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || BASE_URL;

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "salon", label: "Salon / Beauty" },
  { value: "clinic", label: "Clinic / Health" },
  { value: "repair", label: "Repair / Workshop" },
  { value: "tutor", label: "Tutor / Coach" },
  { value: "cafe", label: "Cafe / Restaurant" },
  { value: "local_service", label: "Local service" },
  { value: "other", label: "Other" },
];

const WIZARD_STEPS = [
  { id: "site_settings", label: "Site settings" },
  { id: "basic", label: "Basic info" },
  { id: "contact", label: "Contact & form" },
  { id: "hours", label: "Hours & booking" },
  { id: "template", label: "Template" },
  { id: "template_extras", label: "Template details" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQ" },
  { id: "testimonials", label: "Testimonials" },
  { id: "team", label: "Team" },
  { id: "certifications", label: "Certifications" },
  { id: "media", label: "Media & videos" },
] as const;

/** Default form keys so all wizard fields exist from the start (create mode and when switching steps). */
const INITIAL_FORM: Record<string, string> = {
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
  addressDescription: "",
  locationName: "",
  serviceAreaOnly: "false",
  serviceAreaRegions: "",
  phone: "",
  phone2: "",
  email: "",
  whatsApp: "",
  parking: "",
  accessibilityWheelchair: "",
  serviceOptions: "",
  languagesSpoken: "",
  otherAmenities: "",
  contactFormSubject: "",
  contactFormReplyToName: "",
  contactPreference: "",
  email2: "",
  contactFormSuccessMessage: "",
  priceRange: "",
  mapEmbedUrl: "",
  directionsLabel: "View on map",
  businessHours: "",
  specialHours: "",
  timezone: "",
  heroImage: "",
  galleryUrls: "",
  galleryCaptions: "",
  youtubeUrls: "",
  otherVideoUrls: "",
  bookingEnabled: "false",
  bookingSlotDuration: "",
  bookingLeadTime: "",
  bookingServiceIds: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeChannelUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  otherLinkLabel: "",
  otherLinkUrl: "",
  ctaLabel: "",
  ctaUrl: "",
  cta2Label: "",
  cta2Url: "",
  cta3Label: "",
  cta3Url: "",
  paymentMethods: "",
  bookingUrl: "",
  showMapLink: "true",
  announcementBar: "",
  footerText: "",
  customDomainDisplay: "",
  showBackToTop: "false",
  newsletterLabel: "",
  newsletterUrl: "",
  hasNewsletter: "false",
  shareSectionTitle: "",
  robotsMeta: "",
  customCssUrl: "",
  themeColor: "",
  faqAsAccordion: "false",
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
  siteLayout: "single_page",
};

/** Key stored in draft_content (per locale) to track fields prefilled by "Create with assistance". Not published. */
const ASSISTANT_PREFILLED_FIELDS_KEY = "_assistantPrefilledFields";

/** Form and list keys that are set when user clicks "Pre-fill with sample content". */
const FORM_KEYS_PREFILLED_BY_ASSISTANT = [
  ...Object.keys(INITIAL_FORM),
  "services",
  "faq",
  "testimonials",
  "team",
  "certifications",
];

export default function EditSitePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [site, setSite] = useState<LocaledSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [archiving, setArchiving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [siteLanguages, setSiteLanguages] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState<BusinessType>("other");
  const [slugProposed, setSlugProposed] = useState("");
  const [slugAvailability, setSlugAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() =>
    id === "new" ? getDefaultTemplateIdForBusinessType("other") : ""
  );
  const [templateExtraValues, setTemplateExtraValues] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [teamList, setTeamList] = useState<TeamMemberItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationAwardItem[]>([]);
  const [assistantPrefilledFields, setAssistantPrefilledFields] = useState<Set<string>>(() => new Set());
  const [assistantBannerDismissed, setAssistantBannerDismissed] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const stepContentRef = useRef<HTMLDivElement>(null);

  /** CSS class for a field wrapper when the field is assistant-prefilled (color indication). */
  function prefilledFieldClass(fieldKey: string): string {
    return assistantPrefilledFields.has(fieldKey)
      ? "rounded-r-md border-l-4 border-blue-400 bg-blue-50/60 pl-3 pr-2 pt-2 pb-2"
      : "";
  }
  /** Inline badge shown next to label when field is assistant-prefilled. */
  function PrefilledBadge({ fieldKey }: { fieldKey: string }) {
    if (!assistantPrefilledFields.has(fieldKey)) return null;
    return (
      <span className="ml-2 text-xs font-medium text-blue-600" title="Filled with sample content; edit to customize">
        (sample)
      </span>
    );
  }
  /** Section wrapper class when a list section (e.g. Services) is assistant-prefilled. */
  function prefilledSectionClass(sectionKey: string): string {
    return assistantPrefilledFields.has(sectionKey)
      ? "rounded-lg border-l-4 border-blue-400 bg-blue-50/40"
      : "";
  }

  /** Per-item list styling when section is prefilled. Uses a visible left bar so it isn't overridden by border-gray-200. */
  function prefilledItemWrapperClass(sectionKey: string): string {
    return assistantPrefilledFields.has(sectionKey) ? "relative pl-5" : "";
  }
  function PrefilledItemLeftBar({ sectionKey }: { sectionKey: string }) {
    if (!assistantPrefilledFields.has(sectionKey)) return null;
    return (
      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-blue-400"
        aria-hidden="true"
      />
    );
  }

  /** Media step has multiple form keys; show section indication when any media field is prefilled. */
  const MEDIA_PREFILLED_KEYS = ["heroImage", "galleryUrls", "galleryCaptions", "youtubeUrls", "otherVideoUrls"];
  function isMediaSectionPrefilled(): boolean {
    return MEDIA_PREFILLED_KEYS.some((k) => assistantPrefilledFields.has(k));
  }

  const flags = useDashboardFeatures();
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...INITIAL_FORM }));
  const totalSteps = WIZARD_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const isCreateMode = id === "new";

  /** In create mode, user must enter site name and have availability true before leaving step 0. */
  const canProceedFromSiteSettings =
    !isCreateMode ||
    (slugProposed.trim() !== "" && slugAvailability?.available === true);

  const loadSite = useCallback(async () => {
    const res = await fetch(`/api/dashboard/sites/${id}`);
    if (res.status === 404 || res.status === 403) {
      setError("Site not found");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError("Failed to load site");
      setLoading(false);
      return;
    }
    const data: LocaledSite = await res.json();
    setSite(data);
    setSlugProposed(data.slug ?? "");
    setSlugAvailability(null);
    setBusinessType((data.business_type as BusinessType) ?? "other");
    setSiteLanguages(data.languages?.length ? [...data.languages] : [DEFAULT_LANGUAGE]);
    const locale = data.languages?.[0] ?? "en";
    const content = (data.draft_content?.[locale] ?? data.draft_content?.en ?? {}) as Record<string, string>;
    const templateId =
      data.template_id && getTemplateById(data.template_id)
        ? data.template_id
        : getDefaultTemplateIdForBusinessType((data.business_type as BusinessType) ?? "other");
    setSelectedTemplateId(templateId);
    const template = getTemplateById(templateId);
    const extras: Record<string, string> = {};
    if (template?.extraFields?.length) {
      for (const field of template.extraFields) {
        const v = content[field.key];
        extras[field.key] = typeof v === "string" ? v : "";
      }
    }
    setTemplateExtraValues(extras);
    setForm({
      ...INITIAL_FORM,
      businessName: content.businessName ?? "",
      legalName: content.legalName ?? "",
      tagline: content.tagline ?? "",
      logo: content.logo ?? "",
      favicon: content.favicon ?? "",
      metaTitle: content.metaTitle ?? "",
      metaDescription: content.metaDescription ?? "",
      keywords: content.keywords ?? "",
      shortDescription: content.shortDescription ?? "",
      about: content.about ?? "",
      yearEstablished: content.yearEstablished ?? "",
      address: content.address ?? "",
      addressLocality: content.addressLocality ?? "",
      addressRegion: content.addressRegion ?? "",
      postalCode: content.postalCode ?? "",
      country: content.country ?? (data.country ?? ""),
      areaServed: content.areaServed ?? "",
      addressDescription: content.addressDescription ?? "",
      locationName: content.locationName ?? "",
      serviceAreaOnly: content.serviceAreaOnly ? "true" : "false",
      serviceAreaRegions: content.serviceAreaRegions ?? "",
      phone: content.phone ?? "",
      phone2: content.phone2 ?? "",
      email: content.email ?? "",
      whatsApp: content.whatsApp ?? "",
      parking: content.parking ?? "",
      accessibilityWheelchair: content.accessibilityWheelchair ?? "",
      serviceOptions: content.serviceOptions ?? "",
      languagesSpoken: content.languagesSpoken ?? "",
      otherAmenities: content.otherAmenities ?? "",
      contactFormSubject: content.contactFormSubject ?? "",
      contactFormReplyToName: content.contactFormReplyToName ?? "",
      contactPreference: content.contactPreference ?? "",
      email2: content.email2 ?? "",
      contactFormSuccessMessage: content.contactFormSuccessMessage ?? "",
      priceRange: content.priceRange ?? "",
      mapEmbedUrl: content.mapEmbedUrl ?? "",
      directionsLabel: content.directionsLabel ?? "View on map",
      businessHours: content.businessHours ?? "",
      specialHours: content.specialHours ?? "",
      timezone: content.timezone ?? "",
      heroImage: content.heroImage ?? "",
      galleryUrls: Array.isArray(content.galleryUrls) ? content.galleryUrls.join("\n") : "",
      galleryCaptions: Array.isArray(content.galleryCaptions) ? content.galleryCaptions.join("\n") : "",
      youtubeUrls: Array.isArray(content.youtubeUrls) ? content.youtubeUrls.join("\n") : "",
      otherVideoUrls: Array.isArray(content.otherVideoUrls) ? content.otherVideoUrls.join("\n") : "",
      bookingEnabled: content.bookingEnabled ? "true" : "false",
      bookingSlotDuration: content.bookingSlotDuration ?? "",
      bookingLeadTime: content.bookingLeadTime ?? "",
      bookingServiceIds: Array.isArray(content.bookingServiceIds) ? content.bookingServiceIds.join(", ") : "",
      facebookUrl: content.facebookUrl ?? "",
      instagramUrl: content.instagramUrl ?? "",
      youtubeChannelUrl: content.youtubeChannelUrl ?? "",
      twitterUrl: content.twitterUrl ?? "",
      linkedinUrl: content.linkedinUrl ?? "",
      tiktokUrl: content.tiktokUrl ?? "",
      otherLinkLabel: content.otherLinkLabel ?? "",
      otherLinkUrl: content.otherLinkUrl ?? "",
      ctaLabel: content.ctaLabel ?? "",
      ctaUrl: content.ctaUrl ?? "",
      cta2Label: content.cta2Label ?? "",
      cta2Url: content.cta2Url ?? "",
      cta3Label: content.cta3Label ?? "",
      cta3Url: content.cta3Url ?? "",
      paymentMethods: content.paymentMethods ?? "",
      bookingUrl: content.bookingUrl ?? "",
      showMapLink: String(content.showMapLink) === "false" ? "false" : "true",
      announcementBar: content.announcementBar ?? "",
      footerText: content.footerText ?? "",
      customDomainDisplay: content.customDomainDisplay ?? "",
      showBackToTop: content.showBackToTop ? "true" : "false",
      newsletterLabel: content.newsletterLabel ?? "",
      newsletterUrl: content.newsletterUrl ?? "",
      hasNewsletter: content.hasNewsletter ? "true" : "false",
      shareSectionTitle: content.shareSectionTitle ?? "",
      robotsMeta: content.robotsMeta ?? "",
      customCssUrl: content.customCssUrl ?? "",
      themeColor: content.themeColor ?? "",
      faqAsAccordion: content.faqAsAccordion ? "true" : "false",
      servicesSectionTitle: content.servicesSectionTitle ?? "",
      aboutSectionTitle: content.aboutSectionTitle ?? "",
      contactSectionTitle: content.contactSectionTitle ?? "",
      hoursSectionTitle: content.hoursSectionTitle ?? "",
      gallerySectionTitle: content.gallerySectionTitle ?? "",
      videosSectionTitle: content.videosSectionTitle ?? "",
      otherVideosSectionTitle: content.otherVideosSectionTitle ?? "",
      faqSectionTitle: content.faqSectionTitle ?? "",
      testimonialsSectionTitle: content.testimonialsSectionTitle ?? "",
      teamSectionTitle: content.teamSectionTitle ?? "",
      certificationsSectionTitle: content.certificationsSectionTitle ?? "",
      contactFormSectionTitle: content.contactFormSectionTitle ?? "",
      socialSectionTitle: content.socialSectionTitle ?? "",
      siteLayout: content.siteLayout === "multi_page" ? "multi_page" : "single_page",
    });
    const services = content.services;
    const list: ServiceItem[] = Array.isArray(services)
      ? services
          .filter((s): s is Record<string, unknown> => s != null && typeof s === "object")
          .map((s) => ({
            name: typeof s.name === "string" ? s.name : "",
            description: typeof s.description === "string" ? s.description : undefined,
            image: typeof s.image === "string" ? s.image : undefined,
            duration: typeof s.duration === "string" ? s.duration : undefined,
            price: typeof s.price === "string" ? s.price : undefined,
            category: typeof s.category === "string" ? (s.category.trim() || undefined) : undefined,
          }))
      : [];
    setServicesList(list);
    const rawFaq = content.faq;
    const faqListLoaded: FaqItem[] = Array.isArray(rawFaq)
      ? rawFaq
          .filter((f): f is Record<string, unknown> => f != null && typeof f === "object")
          .map((f) => ({
            question: typeof f.question === "string" ? f.question : "",
            answer: typeof f.answer === "string" ? f.answer : "",
          }))
      : [];
    setFaqList(faqListLoaded);
    const rawTestimonials = content.testimonials;
    const testimonialsLoaded: TestimonialItem[] = Array.isArray(rawTestimonials)
      ? rawTestimonials
          .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
          .map((t) => ({
            quote: typeof t.quote === "string" ? t.quote : "",
            author: typeof t.author === "string" ? t.author : undefined,
            photo: typeof t.photo === "string" ? t.photo : undefined,
            rating: typeof t.rating === "string" ? t.rating : undefined,
          }))
      : [];
    setTestimonialsList(testimonialsLoaded);
    const rawTeam = content.team;
    const teamLoaded: TeamMemberItem[] = Array.isArray(rawTeam)
      ? rawTeam
          .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
          .map((t) => ({
            name: typeof t.name === "string" ? t.name : "",
            role: typeof t.role === "string" ? t.role : undefined,
            photo: typeof t.photo === "string" ? t.photo : undefined,
            bio: typeof t.bio === "string" ? t.bio : undefined,
          }))
      : [];
    setTeamList(teamLoaded);
    const rawCertifications = content.certifications;
    const certificationsLoaded: CertificationAwardItem[] = Array.isArray(rawCertifications)
      ? rawCertifications
          .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
          .map((c) => ({
            title: typeof c.title === "string" ? c.title : undefined,
            image: typeof c.image === "string" ? c.image : undefined,
          }))
      : [];
    setCertificationsList(certificationsLoaded);
    // Restore assistant-prefilled tracking from DB column first (persists after publish); fallback to draft_content per locale.
    const fromColumn = Array.isArray(data.assistant_prefilled_fields)
      ? data.assistant_prefilled_fields.filter((k): k is string => typeof k === "string")
      : [];
    const rawLocale = (data.draft_content?.[locale] ?? data.draft_content?.en ?? {}) as Record<string, unknown>;
    const prefilledRaw = rawLocale[ASSISTANT_PREFILLED_FIELDS_KEY];
    const fromDraft = Array.isArray(prefilledRaw) ? prefilledRaw.filter((k): k is string => typeof k === "string") : [];
    const prefilled = fromColumn.length > 0 ? fromColumn : fromDraft;
    setAssistantPrefilledFields(new Set(prefilled));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
      return;
    }
    loadSite();
  }, [isCreateMode, loadSite]);

  useEffect(() => {
    if (!site && !isCreateMode) return;
    const countryCode = form.country ?? site?.country ?? "";
    const options = getLanguagesForCountry(countryCode);
    const allowed = new Set(options.map((l) => l.value));
    setSiteLanguages((prev) => {
      const kept = prev.filter((l) => allowed.has(l));
      return kept.length > 0 ? kept : [DEFAULT_LANGUAGE];
    });
  }, [form.country, site?.id]);

  useEffect(() => {
    if (!isCreateMode || !businessType) return;
    const defaultId = getDefaultTemplateIdForBusinessType(businessType);
    if (!selectedTemplateId || !isTemplateValidForBusinessType(selectedTemplateId, businessType)) {
      setSelectedTemplateId(defaultId);
    }
  }, [isCreateMode, businessType, selectedTemplateId]);

  useEffect(() => {
    stepContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const primaryLocale = siteLanguages[0] ?? site?.languages?.[0] ?? "en";
  const languageOptionsForCountry = getLanguagesForCountry(form.country ?? site?.country ?? "");

  function addSiteLanguage(lang: string) {
    if (lang && !siteLanguages.includes(lang)) {
      setSiteLanguages((prev) => [...prev, lang].sort((a, b) => {
        const ia = languageOptionsForCountry.findIndex((l) => l.value === a);
        const ib = languageOptionsForCountry.findIndex((l) => l.value === b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }));
    }
  }

  function removeSiteLanguage(lang: string) {
    if (lang !== primaryLocale && siteLanguages.length > 1) {
      setSiteLanguages((prev) => prev.filter((l) => l !== lang));
    }
  }

  function normalizedSlugProposed(): string {
    return slugProposed.trim().toLowerCase().replace(/\s+/g, "-");
  }

  /** Update a form field and clear the assistant-prefilled flag for that field so it stays "assisted" until user edits. */
  function updateFormField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setAssistantPrefilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }

  /** Mark list as user-edited so the assisted flag is cleared for that section (flag on = not edited). */
  function clearAssistedFlagForKey(key: "services" | "faq" | "testimonials" | "team" | "certifications") {
    setAssistantPrefilledFields((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  /** Update services list and clear assisted flag so we know user has edited this section. */
  function updateServicesList(updater: (prev: ServiceItem[]) => ServiceItem[]) {
    setServicesList(updater);
    clearAssistedFlagForKey("services");
  }
  /** Update FAQ list and clear assisted flag. */
  function updateFaqList(updater: (prev: FaqItem[]) => FaqItem[]) {
    setFaqList(updater);
    clearAssistedFlagForKey("faq");
  }
  /** Update testimonials list and clear assisted flag. */
  function updateTestimonialsList(updater: (prev: TestimonialItem[]) => TestimonialItem[]) {
    setTestimonialsList(updater);
    clearAssistedFlagForKey("testimonials");
  }
  /** Update team list and clear assisted flag. */
  function updateTeamList(updater: (prev: TeamMemberItem[]) => TeamMemberItem[]) {
    setTeamList(updater);
    clearAssistedFlagForKey("team");
  }
  /** Update certifications list and clear assisted flag. */
  function updateCertificationsList(updater: (prev: CertificationAwardItem[]) => CertificationAwardItem[]) {
    setCertificationsList(updater);
    clearAssistedFlagForKey("certifications");
  }

  /** Pre-fill all wizard fields with sample content (Create with assistance). User can edit anything after. */
  function fillWithSampleContent() {
    const langs = siteLanguages.length ? siteLanguages : [DEFAULT_LANGUAGE];
    const seed = getSeedContent(businessType, langs);
    const content = (seed[langs[0]] ?? seed.en ?? {}) as Record<string, unknown>;
    setForm((prev) => ({
      ...prev,
      businessName: String(content.businessName ?? ""),
      legalName: String(content.legalName ?? ""),
      tagline: String(content.tagline ?? ""),
      metaTitle: String(content.metaTitle ?? ""),
      metaDescription: String(content.metaDescription ?? ""),
      keywords: String(content.keywords ?? ""),
      shortDescription: String(content.shortDescription ?? ""),
      about: String(content.about ?? ""),
      yearEstablished: String(content.yearEstablished ?? ""),
      address: String(content.address ?? ""),
      addressLocality: String(content.addressLocality ?? ""),
      addressRegion: String(content.addressRegion ?? ""),
      postalCode: String(content.postalCode ?? ""),
      country: String(content.country ?? prev.country ?? ""),
      areaServed: String(content.areaServed ?? ""),
      addressDescription: String(content.addressDescription ?? ""),
      locationName: String(content.locationName ?? ""),
      serviceAreaOnly: content.serviceAreaOnly ? "true" : "false",
      serviceAreaRegions: String(content.serviceAreaRegions ?? ""),
      phone: String(content.phone ?? ""),
      phone2: String(content.phone2 ?? ""),
      email: String(content.email ?? ""),
      whatsApp: String(content.whatsApp ?? ""),
      parking: String(content.parking ?? ""),
      accessibilityWheelchair: String(content.accessibilityWheelchair ?? ""),
      serviceOptions: String(content.serviceOptions ?? ""),
      languagesSpoken: String(content.languagesSpoken ?? ""),
      otherAmenities: String(content.otherAmenities ?? ""),
      contactFormSubject: String(content.contactFormSubject ?? ""),
      contactFormReplyToName: String(content.contactFormReplyToName ?? ""),
      contactPreference: String(content.contactPreference ?? ""),
      email2: String(content.email2 ?? ""),
      contactFormSuccessMessage: String(content.contactFormSuccessMessage ?? ""),
      priceRange: String(content.priceRange ?? ""),
      directionsLabel: String(content.directionsLabel ?? "View on map"),
      businessHours: String(content.businessHours ?? ""),
      specialHours: String(content.specialHours ?? ""),
      timezone: String(content.timezone ?? ""),
      galleryUrls: Array.isArray(content.galleryUrls) ? (content.galleryUrls as string[]).join("\n") : "",
      galleryCaptions: Array.isArray(content.galleryCaptions) ? (content.galleryCaptions as string[]).join("\n") : "",
      youtubeUrls: Array.isArray(content.youtubeUrls) ? (content.youtubeUrls as string[]).join("\n") : "",
      otherVideoUrls: Array.isArray(content.otherVideoUrls) ? (content.otherVideoUrls as string[]).join("\n") : "",
      bookingEnabled: content.bookingEnabled ? "true" : "false",
      bookingSlotDuration: String(content.bookingSlotDuration ?? ""),
      bookingLeadTime: String(content.bookingLeadTime ?? ""),
      bookingServiceIds: Array.isArray(content.bookingServiceIds) ? (content.bookingServiceIds as string[]).join(", ") : "",
      facebookUrl: String(content.facebookUrl ?? ""),
      instagramUrl: String(content.instagramUrl ?? ""),
      youtubeChannelUrl: String(content.youtubeChannelUrl ?? ""),
      twitterUrl: String(content.twitterUrl ?? ""),
      linkedinUrl: String(content.linkedinUrl ?? ""),
      tiktokUrl: String(content.tiktokUrl ?? ""),
      ctaLabel: String(content.ctaLabel ?? ""),
      ctaUrl: String(content.ctaUrl ?? ""),
      cta2Label: String(content.cta2Label ?? ""),
      cta2Url: String(content.cta2Url ?? ""),
      cta3Label: String(content.cta3Label ?? ""),
      cta3Url: String(content.cta3Url ?? ""),
      paymentMethods: String(content.paymentMethods ?? ""),
      announcementBar: String(content.announcementBar ?? ""),
      footerText: String(content.footerText ?? ""),
      customDomainDisplay: String(content.customDomainDisplay ?? ""),
      showBackToTop: content.showBackToTop ? "true" : "false",
      hasNewsletter: content.hasNewsletter ? "true" : "false",
      newsletterLabel: String(content.newsletterLabel ?? ""),
      newsletterUrl: String(content.newsletterUrl ?? ""),
      shareSectionTitle: String(content.shareSectionTitle ?? ""),
      robotsMeta: String(content.robotsMeta ?? ""),
      customCssUrl: String(content.customCssUrl ?? ""),
      themeColor: String(content.themeColor ?? ""),
      faqAsAccordion: content.faqAsAccordion ? "true" : "false",
      servicesSectionTitle: String(content.servicesSectionTitle ?? ""),
      aboutSectionTitle: String(content.aboutSectionTitle ?? ""),
      contactSectionTitle: String(content.contactSectionTitle ?? ""),
      hoursSectionTitle: String(content.hoursSectionTitle ?? ""),
      gallerySectionTitle: String(content.gallerySectionTitle ?? ""),
      videosSectionTitle: String(content.videosSectionTitle ?? ""),
      otherVideosSectionTitle: String(content.otherVideosSectionTitle ?? ""),
      faqSectionTitle: String(content.faqSectionTitle ?? ""),
      testimonialsSectionTitle: String(content.testimonialsSectionTitle ?? ""),
      teamSectionTitle: String(content.teamSectionTitle ?? ""),
      certificationsSectionTitle: String(content.certificationsSectionTitle ?? ""),
      contactFormSectionTitle: String(content.contactFormSectionTitle ?? ""),
      socialSectionTitle: String(content.socialSectionTitle ?? ""),
      siteLayout: content.siteLayout === "multi_page" ? "multi_page" : "single_page",
    }));
    const services = content.services;
    const serviceList: ServiceItem[] = Array.isArray(services)
      ? services
          .filter((s): s is Record<string, unknown> => s != null && typeof s === "object")
          .map((s) => ({
            name: typeof s.name === "string" ? s.name : "",
            description: typeof s.description === "string" ? s.description : undefined,
            image: typeof s.image === "string" ? s.image : undefined,
            duration: typeof s.duration === "string" ? s.duration : undefined,
            price: typeof s.price === "string" ? s.price : undefined,
            category: typeof s.category === "string" ? (s.category.trim() || undefined) : undefined,
          }))
      : [];
    setServicesList(serviceList);
    const rawFaq = content.faq;
    const faqLoaded: FaqItem[] = Array.isArray(rawFaq)
      ? rawFaq
          .filter((f): f is Record<string, unknown> => f != null && typeof f === "object")
          .map((f) => ({
            question: typeof f.question === "string" ? f.question : "",
            answer: typeof f.answer === "string" ? f.answer : "",
          }))
      : [];
    setFaqList(faqLoaded);
    const rawTestimonials = content.testimonials;
    const testimonialsLoaded: TestimonialItem[] = Array.isArray(rawTestimonials)
      ? rawTestimonials
          .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
          .map((t) => ({
            quote: typeof t.quote === "string" ? t.quote : "",
            author: typeof t.author === "string" ? t.author : undefined,
            photo: typeof t.photo === "string" ? t.photo : undefined,
            rating: typeof t.rating === "string" ? t.rating : undefined,
          }))
      : [];
    setTestimonialsList(testimonialsLoaded);
    const rawTeam = content.team;
    const teamLoaded: TeamMemberItem[] = Array.isArray(rawTeam)
      ? rawTeam
          .filter((t): t is Record<string, unknown> => t != null && typeof t === "object")
          .map((t) => ({
            name: typeof t.name === "string" ? t.name : "",
            role: typeof t.role === "string" ? t.role : undefined,
            photo: typeof t.photo === "string" ? t.photo : undefined,
            bio: typeof t.bio === "string" ? t.bio : undefined,
          }))
      : [];
    setTeamList(teamLoaded);
    const rawCertifications = content.certifications;
    const certificationsLoaded: CertificationAwardItem[] = Array.isArray(rawCertifications)
      ? rawCertifications
          .filter((c): c is Record<string, unknown> => c != null && typeof c === "object")
          .map((c) => ({
            title: typeof c.title === "string" ? c.title : undefined,
            image: typeof c.image === "string" ? c.image : undefined,
          }))
      : [];
    setCertificationsList(certificationsLoaded);
    setAssistantPrefilledFields(new Set(FORM_KEYS_PREFILLED_BY_ASSISTANT));
    setAssistantBannerDismissed(false);
  }

  async function checkSlugAvailability() {
    const slug = normalizedSlugProposed();
    if (!slug) {
      setSlugAvailability({ available: false, message: "Enter a site name" });
      return;
    }
    setCheckingSlug(true);
    setSlugAvailability(null);
    setError(null);
    try {
      const url = isCreateMode
        ? `/api/dashboard/sites/check-availability?slug=${encodeURIComponent(slug)}`
        : `/api/dashboard/sites/check-availability?slug=${encodeURIComponent(slug)}&excludeSiteId=${encodeURIComponent(id)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      const available = data.available === true;
      setSlugAvailability({
        available,
        message: data.message ?? (available ? "Available" : "This name is taken"),
      });
      setError(null);
      if (available && !isCreateMode && site && slug !== site.slug) {
        const patchRes = await fetch(`/api/dashboard/sites/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (patchRes.ok) {
          const updated: LocaledSite = await patchRes.json();
          setSite(updated);
          setSlugProposed(updated.slug ?? slug);
        }
      }
    } catch {
      setSlugAvailability({ available: false, message: "Could not check" });
    } finally {
      setCheckingSlug(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.bookingEnabled === "true" && !(form.bookingUrl ?? "").trim()) {
      setError("Please add your Calendly booking link when appointments are enabled.");
      setSaveStatus("idle");
      return;
    }
    setSaving(true);
    setSaveStatus("idle");
    setError(null);
    const locale = primaryLocale;
    const galleryUrls = (form.galleryUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const galleryCaptions = (form.galleryCaptions ?? "").split("\n").map((s) => s.trim());
    const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const otherVideoUrls = (form.otherVideoUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const bookingEnabled = form.bookingEnabled === "true";
    const bookingSlotDuration = (form.bookingSlotDuration ?? "").trim() || undefined;
    const bookingLeadTime = (form.bookingLeadTime ?? "").trim() || undefined;
    const bookingServiceIds = (form.bookingServiceIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const base = site
      ? {
          ...((site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>),
          ...form,
        }
      : { ...form };
    const services = servicesList.filter((s) => (s.name ?? "").trim() !== "");
    const faq = faqList.filter((f) => (f.question ?? "").trim() !== "");
    const testimonials = testimonialsList.filter((t) => (t.quote ?? "").trim() !== "");
    const team = teamList.filter((m) => (m.name ?? "").trim() !== "");
    const certifications = certificationsList.filter(
      (c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== "")
    );
    const draftContentForPayload = {
      [locale]: {
        ...base,
        ...templateExtraValues,
        galleryUrls,
        galleryCaptions,
        youtubeUrls,
        otherVideoUrls,
        bookingEnabled,
        bookingSlotDuration,
        bookingLeadTime,
        bookingServiceIds,
        services,
        faq,
        testimonials,
        team,
        certifications,
        [ASSISTANT_PREFILLED_FIELDS_KEY]: Array.from(assistantPrefilledFields),
      },
    };

    if (isCreateMode) {
      const slug = slugProposed.trim().toLowerCase().replace(/\s+/g, "-");
      if (!slug) {
        setError("Enter a site name and check availability before saving.");
        setSaving(false);
        return;
      }
      if (slugAvailability?.available !== true) {
        setError("Please check that the site name is available before saving.");
        setSaving(false);
        return;
      }
      try {
        const res = await fetch("/api/dashboard/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_type: businessType,
            slug,
            languages: siteLanguages.length ? siteLanguages : [DEFAULT_LANGUAGE],
            template_id: selectedTemplateId || getDefaultTemplateIdForBusinessType(businessType),
            country: form.country || null,
            draft_content: draftContentForPayload,
            assistant_prefilled_fields: Array.from(assistantPrefilledFields),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!data.id) {
          setSaveStatus("error");
          setError(
            res.status === 409
              ? "That site name was taken. Choose another and check availability."
              : data.error ?? "Failed to create site"
          );
          setSaving(false);
          return;
        }
        setError(null);
        router.replace(`/dashboard/sites/${data.id}/edit`);
      } catch {
        setSaveStatus("error");
        setError("Network error");
      }
      setSaving(false);
      return;
    }

    if (!site) return;
    const payload: {
      draft_content: Record<string, unknown>;
      assistant_prefilled_fields?: string[];
      country?: string | null;
      languages?: string[];
      business_type?: BusinessType;
      slug?: string;
    } = {
      draft_content: draftContentForPayload,
      assistant_prefilled_fields: Array.from(assistantPrefilledFields),
      country: form.country ?? null,
      languages: siteLanguages.length ? siteLanguages : [DEFAULT_LANGUAGE],
      business_type: businessType,
    };
    const slugStepIndex = WIZARD_STEPS.findIndex((s) => s.id === "site_settings");
    if (
      slugStepIndex >= 0 &&
      currentStep === slugStepIndex &&
      slugProposed.trim() &&
      !site.published_at
    ) {
      payload.slug = slugProposed.trim().toLowerCase().replace(/\s+/g, "-");
    }
    try {
      const res = await fetch(`/api/dashboard/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveStatus("error");
        setError(data.error ?? "Save failed");
        setSaving(false);
        return;
      }
      const updated: LocaledSite = await res.json();
      setSite(updated);
      setSlugProposed(updated.slug ?? slugProposed);
      setBusinessType((updated.business_type as BusinessType) ?? "other");
      setSiteLanguages(updated.languages?.length ? [...updated.languages] : [DEFAULT_LANGUAGE]);
      setSaveStatus("saved");
      setError(null);
    } catch {
      setSaveStatus("error");
      setError("Network error");
    }
    setSaving(false);
  }

  function openPreview() {
    window.open(
      `/dashboard/sites/${id}/preview`,
      "_blank",
      "noopener,noreferrer,width=1024,height=768"
    );
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    if (form.bookingEnabled === "true" && !(form.bookingUrl ?? "").trim()) {
      setError("Please add your Calendly booking link when appointments are enabled.");
      setPublishing(false);
      return;
    }
    if (isCreateMode) {
      const slug = slugProposed.trim().toLowerCase().replace(/\s+/g, "-");
      if (!slug || slugAvailability?.available !== true) {
        setError("Enter a site name and check availability before publishing.");
        setPublishing(false);
        return;
      }
      const locale = primaryLocale;
      const galleryUrls = (form.galleryUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const galleryCaptions = (form.galleryCaptions ?? "").split("\n").map((s) => s.trim());
      const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const otherVideoUrls = (form.otherVideoUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const bookingEnabled = form.bookingEnabled === "true";
      const bookingSlotDuration = (form.bookingSlotDuration ?? "").trim() || undefined;
      const bookingLeadTime = (form.bookingLeadTime ?? "").trim() || undefined;
      const bookingServiceIds = (form.bookingServiceIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const services = servicesList.filter((s) => (s.name ?? "").trim() !== "");
      const faq = faqList.filter((f) => (f.question ?? "").trim() !== "");
      const testimonials = testimonialsList.filter((t) => (t.quote ?? "").trim() !== "");
      const team = teamList.filter((m) => (m.name ?? "").trim() !== "");
      const certifications = certificationsList.filter(
        (c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== "")
      );
      const draftContentForPayload = {
        [locale]: {
          ...form,
          ...templateExtraValues,
          galleryUrls,
          galleryCaptions,
          youtubeUrls,
          otherVideoUrls,
          bookingEnabled,
          bookingSlotDuration,
          bookingLeadTime,
          bookingServiceIds,
          services,
          faq,
          testimonials,
          team,
          certifications,
        },
      };
      try {
        const createRes = await fetch("/api/dashboard/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_type: businessType,
            slug,
            languages: siteLanguages.length ? siteLanguages : [DEFAULT_LANGUAGE],
            template_id: selectedTemplateId || getDefaultTemplateIdForBusinessType(businessType),
            country: form.country || null,
            draft_content: draftContentForPayload,
            assistant_prefilled_fields: Array.from(assistantPrefilledFields),
          }),
        });
        const createData = await createRes.json().catch(() => ({}));
        if (!createData.id) {
          setError(
            createRes.status === 409
              ? "That site name was taken."
              : createData.error ?? "Failed to create site"
          );
          setPublishing(false);
          return;
        }
        const pubRes = await fetch(`/api/dashboard/sites/${createData.id}/publish`, {
          method: "POST",
        });
        if (!pubRes.ok) {
          const pubData = await pubRes.json().catch(() => ({}));
          setError(
            pubData.error
              ? `Site created but publish failed: ${pubData.error}`
              : "Site created but publish failed. You can publish from the editor."
          );
        }
        router.replace(`/dashboard/sites/${createData.id}/edit`);
      } catch {
        setError("Network error");
      }
      setPublishing(false);
      return;
    }
    if (!site) return;
    try {
      const locale = primaryLocale;
      const galleryUrls = (form.galleryUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const galleryCaptions = (form.galleryCaptions ?? "").split("\n").map((s) => s.trim());
      const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const otherVideoUrls = (form.otherVideoUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const bookingEnabled = form.bookingEnabled === "true";
      const bookingSlotDuration = (form.bookingSlotDuration ?? "").trim() || undefined;
      const bookingLeadTime = (form.bookingLeadTime ?? "").trim() || undefined;
      const bookingServiceIds = (form.bookingServiceIds ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const services = servicesList.filter((s) => (s.name ?? "").trim() !== "");
      const faq = faqList.filter((f) => (f.question ?? "").trim() !== "");
      const testimonials = testimonialsList.filter((t) => (t.quote ?? "").trim() !== "");
      const team = teamList.filter((m) => (m.name ?? "").trim() !== "");
      const certifications = certificationsList.filter(
        (c) => ((c.title ?? "").trim() !== "" || (c.image ?? "").trim() !== "")
      );
      const base = {
        ...((site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>),
        ...form,
      };
      const draftContentForPayload = {
        [locale]: {
          ...base,
          ...templateExtraValues,
          galleryUrls,
          galleryCaptions,
          youtubeUrls,
          otherVideoUrls,
          bookingEnabled,
          bookingSlotDuration,
          bookingLeadTime,
          bookingServiceIds,
          services,
          faq,
          testimonials,
          team,
          certifications,
        },
      };
      const saveRes = await fetch(`/api/dashboard/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_content: draftContentForPayload,
          assistant_prefilled_fields: Array.from(assistantPrefilledFields),
          country: form.country ?? null,
          languages: siteLanguages.length ? siteLanguages : [DEFAULT_LANGUAGE],
          business_type: businessType,
        }),
      });
      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        setError(data.error ?? "Save failed before publish");
        setPublishing(false);
        return;
      }
      const res = await fetch(`/api/dashboard/sites/${id}/publish`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Publish failed");
        setPublishing(false);
        return;
      }
      const updated: LocaledSite = await res.json();
      setSite(updated);
    } catch {
      setError("Network error");
    }
    setPublishing(false);
  }

  async function handleArchiveToggle() {
    if (!site) return;
    const newArchived = !site.archived_at;
    setArchiving(true);
    setError(null);
    setShowArchiveConfirm(false);
    try {
      const res = await fetch(`/api/dashboard/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: newArchived }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? (newArchived ? "Archive failed" : "Unarchive failed"));
        setArchiving(false);
        return;
      }
      const updated: LocaledSite = await res.json();
      setSite(updated);
    } catch {
      setError("Network error");
    }
    setArchiving(false);
  }

  if (loading) {
    return <p className="text-gray-500">Loading…</p>;
  }

  if (error && !site && !isCreateMode) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const locale = site?.languages?.[0] ?? primaryLocale;

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {isCreateMode ? "Create site" : "Edit site"}
        </h1>
        <span className="rounded bg-gray-200 px-2 py-0.5 text-sm text-gray-600 font-mono">
          /{site ? site.slug : (slugProposed.trim() ? normalizedSlugProposed() : "your-name")}
        </span>
        {!isCreateMode && site && (
          <>
            {site.published_at && !site.archived_at ? (
              <>
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">
                  Published
                </span>
                <a
                  href={`${PUBLIC_SITE_BASE}/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 underline hover:text-gray-900"
                >
                  View live site →
                </a>
              </>
            ) : site.archived_at ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
                Unpublished
              </span>
            ) : (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
                Draft
              </span>
            )}
            {flags.archive !== false && (
              showArchiveConfirm ? (
                <span className="ml-2 flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Archive this site? You can unarchive later.</span>
                  <button
                    type="button"
                    onClick={() => setShowArchiveConfirm(false)}
                    className="text-gray-600 underline hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveToggle}
                    disabled={archiving}
                    className="font-medium text-amber-700 underline hover:text-amber-800 disabled:opacity-50"
                  >
                    Yes, archive
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => (site.archived_at ? handleArchiveToggle() : setShowArchiveConfirm(true))}
                  disabled={archiving}
                  className="ml-2 text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
                >
                  {site.archived_at ? "Unarchive site" : "Archive site"}
                </button>
              )
            )}
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      {/* Step progress: vertical list (sidebar on md+, stacked on small) */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="flex-shrink-0 md:w-52">
          <p className="mb-2 text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <label htmlFor="wizard-step-jump" className="sr-only">
            Jump to step
          </label>
          <select
            id="wizard-step-jump"
            value={currentStep}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (isCreateMode && currentStep === 0 && next > 0 && !canProceedFromSiteSettings) {
                setError("Enter a site name and check availability to continue.");
                return;
              }
              setCurrentStep(next);
            }}
            className="mb-3 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 md:sr-only"
            aria-label="Jump to step"
          >
            {WIZARD_STEPS.map((step, index) => (
              <option key={step.id} value={index}>
                {index + 1}. {step.label}
              </option>
            ))}
          </select>
          <nav aria-label="Wizard steps" className="flex flex-col gap-0">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isLast = index === WIZARD_STEPS.length - 1;
              return (
                <div key={step.id} className="flex items-stretch">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCreateMode && currentStep === 0 && index > 0 && !canProceedFromSiteSettings) {
                          setError("Enter a site name and check availability to continue.");
                          return;
                        }
                        setCurrentStep(index);
                      }}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors w-full ${
                        isActive
                          ? "bg-gray-900 text-white ring-2 ring-gray-900 ring-offset-2"
                          : isCompleted
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={step.label}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs">
                        {isCompleted ? "✓" : index + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </button>
                    {!isLast && (
                      <div
                        className={`h-2 w-0.5 shrink-0 ${isCompleted ? "bg-green-300" : "bg-gray-200"}`}
                        aria-hidden
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSave} className="min-w-0 flex-1 space-y-6">
          {/* Step content: scrolls into view when step changes */}
          <div ref={stepContentRef}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                aria-disabled="true"
                title="AI-assisted content improvement will be available in a future update"
              >
                <span aria-hidden>✨</span>
                AI assistance
                <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">Coming soon</span>
              </button>
            </div>
            {assistantPrefilledFields.size > 0 && !assistantBannerDismissed && (
              <div
                role="status"
                className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
              >
                <p className="flex-1">
                  <span className="font-medium">Assistant-prefilled content.</span> Sample content for{" "}
                  <strong>{BUSINESS_TYPES.find((t) => t.value === businessType)?.label ?? "Other"}</strong> is filled in so
                  your site has complete information. You can edit any field to customize.
                </p>
                <button
                  type="button"
                  onClick={() => setAssistantBannerDismissed(true)}
                  className="shrink-0 rounded px-2 py-1 text-blue-700 hover:bg-blue-100"
                  aria-label="Dismiss"
                >
                  Dismiss
                </button>
              </div>
            )}

        {/* Step 0: Site settings */}
        {currentStep === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Step 1 of {totalSteps} — {WIZARD_STEPS[0].label}
            </p>
            <h2 className="mb-4 text-lg font-medium text-gray-900">Site settings</h2>
            <p className="mb-4 text-sm text-gray-500">
              Change country, business type, or site languages here. These affect language options and how your site is categorized.
            </p>

            <div className="mb-6 space-y-2">
              <label htmlFor="site-slug" className="block text-sm font-medium text-gray-700">
                Site name (URL) <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <p className="text-xs text-gray-500">
                Your site will be at localed.info/
                <strong className="font-mono">{slugProposed.trim() ? normalizedSlugProposed() : "your-name"}</strong>
              </p>
              {!isCreateMode && site?.published_at ? (
                <input
                  type="text"
                  id="site-slug"
                  value={slugProposed}
                  readOnly
                  disabled
                  className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 cursor-not-allowed"
                  aria-label="Site name (read-only after publishing)"
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      id="site-slug"
                      value={slugProposed}
                      onChange={(e) => {
                        setSlugProposed(e.target.value);
                        setSlugAvailability(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), checkSlugAvailability())}
                      className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      aria-label="Site name (URL slug)"
                    />
                    <button
                      type="button"
                      onClick={checkSlugAvailability}
                      disabled={checkingSlug || !slugProposed.trim()}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {checkingSlug ? "Checking…" : "Check availability"}
                    </button>
                    {slugAvailability && (
                      <span
                        className={`text-sm font-medium ${slugAvailability.available ? "text-green-700" : "text-amber-700"}`}
                        role="status"
                      >
                        {slugAvailability.message}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Use only lowercase letters, numbers, and hyphens. When the name is available, it is applied automatically.
                  </p>
                </>
              )}
            </div>

            <div className={`mb-6 ${prefilledFieldClass("siteLayout")}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website layout
                <PrefilledBadge fieldKey="siteLayout" />
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Single page shows all sections on one scrollable page. Multi-page uses separate pages for About, Services, Contact, etc.
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="siteLayout"
                    value="single_page"
                    checked={form.siteLayout === "single_page"}
                    onChange={() => updateFormField("siteLayout", "single_page")}
                    className="rounded-full border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-900">Single page</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="siteLayout"
                    value="multi_page"
                    checked={form.siteLayout === "multi_page"}
                    onChange={() => updateFormField("siteLayout", "multi_page")}
                    className="rounded-full border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-900">Multi page</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="site-business-type" className="block text-sm font-medium text-gray-700">
                  Business type
                </label>
                <select
                  id="site-business-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="site-country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="site-country"
                  value={form.country ?? ""}
                  onChange={(e) => updateFormField("country", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {COUNTRY_OPTIONS.map((opt) => (
                    <option key={opt.value || "empty"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site languages
                </label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Languages your site supports. First language is the default. Click Save to apply changes.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {siteLanguages.map((code) => {
                    const meta = languageOptionsForCountry.find((l) => l.value === code);
                    const label = meta?.label ?? code;
                    const isPrimary = code === primaryLocale;
                    return (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                      >
                        {label}
                        {isPrimary && <span className="text-xs text-gray-500">(default)</span>}
                        {!isPrimary && siteLanguages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSiteLanguage(code)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200"
                            aria-label={`Remove ${label}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                  {languageOptionsForCountry.filter((l) => !siteLanguages.includes(l.value)).length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) addSiteLanguage(v);
                        e.target.value = "";
                      }}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                      aria-label="Add language"
                    >
                      <option value="">+ Add language</option>
                      {languageOptionsForCountry.filter((l) => !siteLanguages.includes(l.value)).map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

            {currentStep === 0 && isCreateMode && assistantPrefilledFields.size === 0 && (
              <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">Create with assistance</p>
                <p className="mt-1 text-sm text-gray-600">
                  Pre-fill all steps with sample content for <strong>{BUSINESS_TYPES.find((t) => t.value === businessType)?.label ?? "Other"}</strong> so your site has complete information from the start. You can change any detail after.
                </p>
                <button
                  type="button"
                  onClick={fillWithSampleContent}
                  className="mt-3 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
                >
                  Pre-fill with sample content for {BUSINESS_TYPES.find((t) => t.value === businessType)?.label ?? "Other"}
                </button>
              </div>
            )}

        {/* Step 4: Template selection */}
        {currentStep === 4 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Step 5 of {totalSteps} — {WIZARD_STEPS[4].label}
            </p>
            <h2 className="mb-4 text-lg font-medium text-gray-900">Choose a template</h2>
            <p className="mb-4 text-sm text-gray-500">
              Pick a layout for your site. Each template has a distinct look; you can change this later.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {getTemplatesForBusinessType(businessType).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(t.id);
                    setTemplateExtraValues({});
                  }}
                  className={`rounded-lg border-2 p-4 text-left transition ${
                    selectedTemplateId === t.id
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t.previewImageUrl ? (
                    <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.previewImageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <span className="font-medium text-gray-900">{t.label}</span>
                  {t.description ? (
                    <p className="mt-1 text-sm text-gray-600">{t.description}</p>
                  ) : null}
                  {t.extraFields?.length ? (
                    <p className="mt-1 text-xs text-gray-500">
                      Asks for {t.extraFields.length} extra detail{t.extraFields.length === 1 ? "" : "s"} in the next step
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Template extras (optional fields for selected template) */}
        {currentStep === 5 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Step 6 of {totalSteps} — {WIZARD_STEPS[5].label}
            </p>
            <h2 className="mb-4 text-lg font-medium text-gray-900">Template details</h2>
            {(() => {
              const template = getTemplateById(selectedTemplateId);
              const extraFields = template?.extraFields ?? [];
              if (extraFields.length === 0) {
                return (
                  <p className="text-sm text-gray-500">
                    This template has no extra fields. Click Next to continue.
                  </p>
                );
              }
              return (
                <div className="space-y-4">
                  {extraFields.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={`template-extra-${field.key}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          id={`template-extra-${field.key}`}
                          value={templateExtraValues[field.key] ?? ""}
                          onChange={(e) =>
                            setTemplateExtraValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          rows={3}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                        />
                      ) : (
                        <input
                          id={`template-extra-${field.key}`}
                          type="text"
                          value={templateExtraValues[field.key] ?? ""}
                          onChange={(e) =>
                            setTemplateExtraValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 1: Basic info */}
        {currentStep === 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 2 of {totalSteps} — {WIZARD_STEPS[1].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Basic info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`sm:col-span-2 ${prefilledFieldClass("businessName")}`}>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business name
                <PrefilledBadge fieldKey="businessName" />
              </label>
              <input
                id="businessName"
                value={form.businessName ?? ""}
                onChange={(e) => updateFormField("businessName", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("legalName")}`}>
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">
                Legal name <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="legalName" />
              </label>
              <input
                id="legalName"
                value={form.legalName ?? ""}
                onChange={(e) => updateFormField("legalName", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="If different from business name"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("tagline")}`}>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
                Tagline
                <PrefilledBadge fieldKey="tagline" />
              </label>
              <input
                id="tagline"
                value={form.tagline ?? ""}
                onChange={(e) => updateFormField("tagline", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Your neighborhood salon"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("logo")}`}>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo URL <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="logo" />
              </label>
              <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("logo")}</p>
              <input
                id="logo"
                type="url"
                value={form.logo ?? ""}
                onChange={(e) => updateFormField("logo", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("favicon")}`}>
              <label htmlFor="favicon" className="block text-sm font-medium text-gray-700">
                Favicon URL <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="favicon" />
              </label>
              <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("favicon")}</p>
              <input
                id="favicon"
                type="url"
                value={form.favicon ?? ""}
                onChange={(e) => updateFormField("favicon", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Leave empty to use logo"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("shortDescription")}`}>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short description
                <PrefilledBadge fieldKey="shortDescription" />
              </label>
              <input
                id="shortDescription"
                value={form.shortDescription ?? ""}
                onChange={(e) => updateFormField("shortDescription", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="1–2 sentences for your homepage"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("about")}`}>
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                About (longer text)
                <PrefilledBadge fieldKey="about" />
              </label>
              <textarea
                id="about"
                rows={4}
                value={form.about ?? ""}
                onChange={(e) => updateFormField("about", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("yearEstablished")}`}>
              <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700">
                Year established <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="yearEstablished" />
              </label>
              <input
                id="yearEstablished"
                value={form.yearEstablished ?? ""}
                onChange={(e) => updateFormField("yearEstablished", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Since 2010"
              />
            </div>
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">SEO (optional)</p>
              <p className="text-xs text-gray-500 mb-3">Override defaults for search and social sharing.</p>
              <div className="space-y-3">
                <div className={prefilledFieldClass("metaTitle")}>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-600">Meta title <PrefilledBadge fieldKey="metaTitle" /></label>
                  <input
                    id="metaTitle"
                    value={form.metaTitle ?? ""}
                    onChange={(e) => updateFormField("metaTitle", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Defaults to business name + tagline"
                  />
                </div>
                <div className={prefilledFieldClass("metaDescription")}>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-600">Meta description <PrefilledBadge fieldKey="metaDescription" /></label>
                  <input
                    id="metaDescription"
                    value={form.metaDescription ?? ""}
                    onChange={(e) => updateFormField("metaDescription", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Defaults to short description"
                  />
                </div>
                <div className={prefilledFieldClass("keywords")}>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-600">Keywords <PrefilledBadge fieldKey="keywords" /></label>
                  <input
                    id="keywords"
                    value={form.keywords ?? ""}
                    onChange={(e) => updateFormField("keywords", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Comma-separated (e.g. salon, haircut, Mumbai)"
                  />
                </div>
                <div className={prefilledFieldClass("priceRange")}>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-600">Price range (SEO) <PrefilledBadge fieldKey="priceRange" /></label>
                  <input
                    id="priceRange"
                    value={form.priceRange ?? ""}
                    onChange={(e) => updateFormField("priceRange", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. $$ or $ to $$$"
                  />
                  <p className="mt-1 text-xs text-gray-500">Shown in search results (e.g. $ to $$$)</p>
                </div>
                <div className={prefilledFieldClass("robotsMeta")}>
                  <label htmlFor="robotsMeta" className="block text-sm font-medium text-gray-600">Robots meta <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="robotsMeta" /></label>
                  <input id="robotsMeta" value={form.robotsMeta ?? ""} onChange={(e) => updateFormField("robotsMeta", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. noindex, nofollow" />
                </div>
                <div className={prefilledFieldClass("customCssUrl")}>
                  <label htmlFor="customCssUrl" className="block text-sm font-medium text-gray-600">Custom CSS URL <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="customCssUrl" /></label>
                  <input id="customCssUrl" type="url" value={form.customCssUrl ?? ""} onChange={(e) => updateFormField("customCssUrl", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Announcement &amp; footer</p>
              <div className="space-y-3">
                <div className={prefilledFieldClass("announcementBar")}>
                  <label htmlFor="announcementBar" className="block text-sm font-medium text-gray-600">Announcement bar <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="announcementBar" /></label>
                  <input
                    id="announcementBar"
                    value={form.announcementBar ?? ""}
                    onChange={(e) => updateFormField("announcementBar", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. Closed for holidays Dec 24–26"
                  />
                </div>
                <div className={prefilledFieldClass("footerText")}>
                  <label htmlFor="footerText" className="block text-sm font-medium text-gray-600">Footer text <PrefilledBadge fieldKey="footerText" /></label>
                  <input
                    id="footerText"
                    value={form.footerText ?? ""}
                    onChange={(e) => updateFormField("footerText", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. © 2024 Business Name"
                  />
                </div>
                <div className={prefilledFieldClass("customDomainDisplay")}>
                  <label htmlFor="customDomainDisplay" className="block text-sm font-medium text-gray-600">Custom domain text <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="customDomainDisplay" /></label>
                  <input id="customDomainDisplay" value={form.customDomainDisplay ?? ""} onChange={(e) => updateFormField("customDomainDisplay", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Visit us at example.com" />
                </div>
                <div className={`flex items-center gap-2 ${prefilledFieldClass("showBackToTop")}`}>
                  <input type="checkbox" id="showBackToTop" checked={form.showBackToTop === "true"} onChange={(e) => updateFormField("showBackToTop", e.target.checked ? "true" : "false")} className="rounded border-gray-300" />
                  <label htmlFor="showBackToTop" className="text-sm font-medium text-gray-700">Show &quot;Back to top&quot; link <PrefilledBadge fieldKey="showBackToTop" /></label>
                </div>
                <div className={`border-t border-gray-100 pt-3 mt-2 ${prefilledFieldClass("hasNewsletter")}`}>
                  <p className="text-sm font-medium text-gray-700 mb-2">Newsletter</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="hasNewsletter" checked={form.hasNewsletter === "true"} onChange={(e) => updateFormField("hasNewsletter", e.target.checked ? "true" : "false")} className="rounded border-gray-300" />
                    <label htmlFor="hasNewsletter" className="text-sm text-gray-600">Show newsletter section <PrefilledBadge fieldKey="hasNewsletter" /></label>
                  </div>
                  <div className="space-y-2">
                    <div className={prefilledFieldClass("newsletterLabel")}>                    <input id="newsletterLabel" value={form.newsletterLabel ?? ""} onChange={(e) => updateFormField("newsletterLabel", e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm" placeholder="Newsletter label (optional)" /></div>
                    <div className={prefilledFieldClass("newsletterUrl")}>                    <input id="newsletterUrl" type="url" value={form.newsletterUrl ?? ""} onChange={(e) => updateFormField("newsletterUrl", e.target.value)} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm" placeholder="Sign-up URL" /></div>
                  </div>
                </div>
                <div className={prefilledFieldClass("shareSectionTitle")}>
                  <label htmlFor="shareSectionTitle" className="block text-sm font-medium text-gray-600">Share section title <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="shareSectionTitle" /></label>
                  <input id="shareSectionTitle" value={form.shareSectionTitle ?? ""} onChange={(e) => updateFormField("shareSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Share this page" />
                </div>
                <div className={prefilledFieldClass("themeColor")}>
                  <label htmlFor="themeColor" className="block text-sm font-medium text-gray-600">Theme color (hex) <PrefilledBadge fieldKey="themeColor" /></label>
                  <input
                    id="themeColor"
                    value={form.themeColor ?? ""}
                    onChange={(e) => updateFormField("themeColor", e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. #0f172a"
                  />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Section titles <span className="text-gray-500">(optional overrides)</span></p>
              <p className="text-xs text-gray-500 mb-3">Override default section headings on your site.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={prefilledFieldClass("servicesSectionTitle")}><label htmlFor="servicesSectionTitle" className="block text-xs text-gray-600">Services <PrefilledBadge fieldKey="servicesSectionTitle" /></label><input id="servicesSectionTitle" value={form.servicesSectionTitle ?? ""} onChange={(e) => updateFormField("servicesSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="What we offer" /></div>
                <div className={prefilledFieldClass("aboutSectionTitle")}><label htmlFor="aboutSectionTitle" className="block text-xs text-gray-600">About <PrefilledBadge fieldKey="aboutSectionTitle" /></label><input id="aboutSectionTitle" value={form.aboutSectionTitle ?? ""} onChange={(e) => updateFormField("aboutSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="About" /></div>
                <div className={prefilledFieldClass("contactSectionTitle")}><label htmlFor="contactSectionTitle" className="block text-xs text-gray-600">Contact <PrefilledBadge fieldKey="contactSectionTitle" /></label><input id="contactSectionTitle" value={form.contactSectionTitle ?? ""} onChange={(e) => updateFormField("contactSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Contact" /></div>
                <div className={prefilledFieldClass("hoursSectionTitle")}><label htmlFor="hoursSectionTitle" className="block text-xs text-gray-600">Hours <PrefilledBadge fieldKey="hoursSectionTitle" /></label><input id="hoursSectionTitle" value={form.hoursSectionTitle ?? ""} onChange={(e) => updateFormField("hoursSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Hours" /></div>
                <div className={prefilledFieldClass("faqSectionTitle")}><label htmlFor="faqSectionTitle" className="block text-xs text-gray-600">FAQ <PrefilledBadge fieldKey="faqSectionTitle" /></label><input id="faqSectionTitle" value={form.faqSectionTitle ?? ""} onChange={(e) => updateFormField("faqSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="FAQ" /></div>
                <div className={prefilledFieldClass("contactFormSectionTitle")}><label htmlFor="contactFormSectionTitle" className="block text-xs text-gray-600">Contact form <PrefilledBadge fieldKey="contactFormSectionTitle" /></label><input id="contactFormSectionTitle" value={form.contactFormSectionTitle ?? ""} onChange={(e) => updateFormField("contactFormSectionTitle", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Contact us" /></div>
                <div className={`sm:col-span-2 flex items-center gap-2 ${prefilledFieldClass("faqAsAccordion")}`}>
                  <input type="checkbox" id="faqAsAccordion" checked={form.faqAsAccordion === "true"} onChange={(e) => updateFormField("faqAsAccordion", e.target.checked ? "true" : "false")} className="rounded border-gray-300" />
                  <label htmlFor="faqAsAccordion" className="text-sm text-gray-600">Show FAQ as accordion (expand/collapse) <PrefilledBadge fieldKey="faqAsAccordion" /></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Step 2: Contact */}
        {currentStep === 2 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 3 of {totalSteps} — {WIZARD_STEPS[2].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`sm:col-span-2 ${prefilledFieldClass("address")}`}>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
                <PrefilledBadge fieldKey="address" />
              </label>
              <input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => updateFormField("address", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={prefilledFieldClass("addressLocality")}>
              <label htmlFor="addressLocality" className="block text-sm font-medium text-gray-700">Locality / City <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="addressLocality" /></label>
              <input id="addressLocality" value={form.addressLocality ?? ""} onChange={(e) => updateFormField("addressLocality", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Mumbai" />
            </div>
            <div className={prefilledFieldClass("addressRegion")}>
              <label htmlFor="addressRegion" className="block text-sm font-medium text-gray-700">Region / State <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="addressRegion" /></label>
              <input id="addressRegion" value={form.addressRegion ?? ""} onChange={(e) => updateFormField("addressRegion", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Maharashtra" />
            </div>
            <div className={prefilledFieldClass("postalCode")}>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal code <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="postalCode" /></label>
              <input id="postalCode" value={form.postalCode ?? ""} onChange={(e) => updateFormField("postalCode", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. 400001" />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("addressDescription")}`}>
              <label htmlFor="addressDescription" className="block text-sm font-medium text-gray-700">
                Location instructions <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="addressDescription" />
              </label>
              <input
                id="addressDescription"
                value={form.addressDescription ?? ""}
                onChange={(e) => updateFormField("addressDescription", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Use the rear entrance, Next to the bank"
              />
            </div>
            <div className={prefilledFieldClass("locationName")}>
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
                Location name <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="locationName" />
              </label>
              <input
                id="locationName"
                value={form.locationName ?? ""}
                onChange={(e) => updateFormField("locationName", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Downtown branch"
              />
            </div>
            <div className={prefilledFieldClass("directionsLabel")}>
              <label htmlFor="directionsLabel" className="block text-sm font-medium text-gray-700">Map link label <PrefilledBadge fieldKey="directionsLabel" /></label>
              <input id="directionsLabel" value={form.directionsLabel ?? "View on map"} onChange={(e) => updateFormField("directionsLabel", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="View on map" />
            </div>
            <div className={prefilledFieldClass("country")}>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
                <PrefilledBadge fieldKey="country" />
              </label>
              <select
                id="country"
                value={form.country ?? ""}
                onChange={(e) => updateFormField("country", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("areaServed")}`}>
              <label htmlFor="areaServed" className="block text-sm font-medium text-gray-700">
                Location / area served <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="areaServed" />
              </label>
              <input
                id="areaServed"
                value={form.areaServed ?? ""}
                onChange={(e) => updateFormField("areaServed", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Serving Mumbai and suburbs, Downtown only"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("serviceAreaOnly")}`}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.serviceAreaOnly === "true"}
                  onChange={(e) => updateFormField("serviceAreaOnly", e.target.checked ? "true" : "false")}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Service-area only (we visit customers; no physical storefront)</span>
              </label>
              <PrefilledBadge fieldKey="serviceAreaOnly" />
            </div>
            {form.serviceAreaOnly === "true" ? (
              <div className={`sm:col-span-2 ${prefilledFieldClass("serviceAreaRegions")}`}>
                <label htmlFor="serviceAreaRegions" className="block text-sm font-medium text-gray-700">
                  Regions / cities served
                  <PrefilledBadge fieldKey="serviceAreaRegions" />
                </label>
                <input
                  id="serviceAreaRegions"
                  value={form.serviceAreaRegions ?? ""}
                  onChange={(e) => updateFormField("serviceAreaRegions", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Mumbai, Thane, Navi Mumbai"
                />
              </div>
            ) : null}
            <div className={prefilledFieldClass("phone")}>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
                <PrefilledBadge fieldKey="phone" />
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => updateFormField("phone", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={prefilledFieldClass("email")}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
                <PrefilledBadge fieldKey="email" />
              </label>
              <input
                id="email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => updateFormField("email", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={prefilledFieldClass("email2")}>
              <label htmlFor="email2" className="block text-sm font-medium text-gray-700">
                Email 2 <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="email2" />
              </label>
              <input
                id="email2"
                type="email"
                value={form.email2 ?? ""}
                onChange={(e) => updateFormField("email2", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className={prefilledFieldClass("phone2")}>
              <label htmlFor="phone2" className="block text-sm font-medium text-gray-700">
                Phone 2 <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="phone2" />
              </label>
              <input
                id="phone2"
                type="tel"
                value={form.phone2 ?? ""}
                onChange={(e) => updateFormField("phone2", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2 mt-6 border-t border-gray-200 pt-6">
              <h3 className="mb-3 text-base font-medium text-gray-900">Location & accessibility</h3>
              <p className="mb-4 text-sm text-gray-500">
                Optional details that help customers find you and know what to expect (e.g. parking, wheelchair access).
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={prefilledFieldClass("parking")}>
                  <label htmlFor="parking" className="block text-sm font-medium text-gray-700">Parking <PrefilledBadge fieldKey="parking" /></label>
                  <input id="parking" value={form.parking ?? ""} onChange={(e) => updateFormField("parking", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Free lot, Street parking, Paid garage" />
                </div>
                <div className={prefilledFieldClass("accessibilityWheelchair")}>
                  <label htmlFor="accessibilityWheelchair" className="block text-sm font-medium text-gray-700">Accessibility <PrefilledBadge fieldKey="accessibilityWheelchair" /></label>
                  <input id="accessibilityWheelchair" value={form.accessibilityWheelchair ?? ""} onChange={(e) => updateFormField("accessibilityWheelchair", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Wheelchair accessible, Ramp at rear" />
                </div>
                <div className={`sm:col-span-2 ${prefilledFieldClass("serviceOptions")}`}>
                  <label htmlFor="serviceOptions" className="block text-sm font-medium text-gray-700">Service options <PrefilledBadge fieldKey="serviceOptions" /></label>
                  <input id="serviceOptions" value={form.serviceOptions ?? ""} onChange={(e) => updateFormField("serviceOptions", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Dine-in, Takeout, Delivery, Curbside pickup" />
                </div>
                <div className={prefilledFieldClass("languagesSpoken")}>
                  <label htmlFor="languagesSpoken" className="block text-sm font-medium text-gray-700">Languages spoken <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="languagesSpoken" /></label>
                  <input id="languagesSpoken" value={form.languagesSpoken ?? ""} onChange={(e) => updateFormField("languagesSpoken", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. English, Hindi, Marathi" />
                </div>
                <div className={prefilledFieldClass("otherAmenities")}>
                  <label htmlFor="otherAmenities" className="block text-sm font-medium text-gray-700">Other amenities <PrefilledBadge fieldKey="otherAmenities" /></label>
                  <input id="otherAmenities" value={form.otherAmenities ?? ""} onChange={(e) => updateFormField("otherAmenities", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Outdoor seating, Free Wi-Fi, 24/7" />
                </div>
              </div>
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("whatsApp")}`}>
              <label htmlFor="whatsApp" className="block text-sm font-medium text-gray-700">
                WhatsApp <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="whatsApp" />
              </label>
              <input
                id="whatsApp"
                type="text"
                value={form.whatsApp ?? ""}
                onChange={(e) => updateFormField("whatsApp", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="https://wa.me/919876543210 or number"
              />
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Social links</h3>
            <p className="mb-4 text-sm text-gray-500">
              Optional links to your social profiles. Shown as &quot;Follow us&quot; on your site.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={prefilledFieldClass("facebookUrl")}>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">Facebook <PrefilledBadge fieldKey="facebookUrl" /></label>
                <input
                  id="facebookUrl"
                  type="url"
                  value={form.facebookUrl ?? ""}
                  onChange={(e) => updateFormField("facebookUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className={prefilledFieldClass("instagramUrl")}>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">Instagram <PrefilledBadge fieldKey="instagramUrl" /></label>
                <input
                  id="instagramUrl"
                  type="url"
                  value={form.instagramUrl ?? ""}
                  onChange={(e) => updateFormField("instagramUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className={prefilledFieldClass("youtubeChannelUrl")}>
                <label htmlFor="youtubeChannelUrl" className="block text-sm font-medium text-gray-700">YouTube channel <PrefilledBadge fieldKey="youtubeChannelUrl" /></label>
                <input
                  id="youtubeChannelUrl"
                  type="url"
                  value={form.youtubeChannelUrl ?? ""}
                  onChange={(e) => updateFormField("youtubeChannelUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div className={prefilledFieldClass("twitterUrl")}>
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700">Twitter / X <PrefilledBadge fieldKey="twitterUrl" /></label>
                <input
                  id="twitterUrl"
                  type="url"
                  value={form.twitterUrl ?? ""}
                  onChange={(e) => updateFormField("twitterUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://x.com/..."
                />
              </div>
              <div className={prefilledFieldClass("linkedinUrl")}>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">LinkedIn <PrefilledBadge fieldKey="linkedinUrl" /></label>
                <input
                  id="linkedinUrl"
                  type="url"
                  value={form.linkedinUrl ?? ""}
                  onChange={(e) => updateFormField("linkedinUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div className={prefilledFieldClass("tiktokUrl")}>
                <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-700">TikTok <PrefilledBadge fieldKey="tiktokUrl" /></label>
                <input
                  id="tiktokUrl"
                  type="url"
                  value={form.tiktokUrl ?? ""}
                  onChange={(e) => updateFormField("tiktokUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
              <div className={prefilledFieldClass("otherLinkLabel")}>
                <label htmlFor="otherLinkLabel" className="block text-sm font-medium text-gray-700">Other link (label) <PrefilledBadge fieldKey="otherLinkLabel" /></label>
                <input
                  id="otherLinkLabel"
                  type="text"
                  value={form.otherLinkLabel ?? ""}
                  onChange={(e) => updateFormField("otherLinkLabel", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Blog"
                />
              </div>
              <div className={prefilledFieldClass("otherLinkUrl")}>
                <label htmlFor="otherLinkUrl" className="block text-sm font-medium text-gray-700">Other link (URL) <PrefilledBadge fieldKey="otherLinkUrl" /></label>
                <input
                  id="otherLinkUrl"
                  type="url"
                  value={form.otherLinkUrl ?? ""}
                  onChange={(e) => updateFormField("otherLinkUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Call to action button</h3>
            <p className="mb-4 text-sm text-gray-500">
              Optional primary button on your site (e.g. &quot;Book now&quot;, &quot;Call now&quot;). Both label and URL are required to show it.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={prefilledFieldClass("ctaLabel")}>
                <label htmlFor="ctaLabel" className="block text-sm font-medium text-gray-700">Button label <PrefilledBadge fieldKey="ctaLabel" /></label>
                <input
                  id="ctaLabel"
                  type="text"
                  value={form.ctaLabel ?? ""}
                  onChange={(e) => updateFormField("ctaLabel", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Book now"
                />
              </div>
              <div className={prefilledFieldClass("ctaUrl")}>
                <label htmlFor="ctaUrl" className="block text-sm font-medium text-gray-700">Button URL <PrefilledBadge fieldKey="ctaUrl" /></label>
                <input
                  id="ctaUrl"
                  type="url"
                  value={form.ctaUrl ?? ""}
                  onChange={(e) => updateFormField("ctaUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://... or tel:+1234567890"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={prefilledFieldClass("cta3Label")}>
                  <label htmlFor="cta3Label" className="block text-sm font-medium text-gray-700">Third button label <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="cta3Label" /></label>
                  <input id="cta3Label" type="text" value={form.cta3Label ?? ""} onChange={(e) => updateFormField("cta3Label", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. View menu" />
                </div>
                <div className={prefilledFieldClass("cta3Url")}>
                  <label htmlFor="cta3Url" className="block text-sm font-medium text-gray-700">Third button URL <PrefilledBadge fieldKey="cta3Url" /></label>
                  <input id="cta3Url" type="url" value={form.cta3Url ?? ""} onChange={(e) => updateFormField("cta3Url", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Contact form</h3>
            <div className="space-y-4">
              <div className={prefilledFieldClass("contactFormSubject")}>
                <label htmlFor="contactFormSubject" className="block text-sm font-medium text-gray-700">
                  Default subject line <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="contactFormSubject" />
                </label>
                <input
                  id="contactFormSubject"
                  type="text"
                  value={form.contactFormSubject ?? ""}
                  onChange={(e) => updateFormField("contactFormSubject", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Website enquiry"
                />
              </div>
              <div className={prefilledFieldClass("contactFormReplyToName")}>
                <label htmlFor="contactFormReplyToName" className="block text-sm font-medium text-gray-700">Reply-to name <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="contactFormReplyToName" /></label>
                <input id="contactFormReplyToName" type="text" value={form.contactFormReplyToName ?? ""} onChange={(e) => updateFormField("contactFormReplyToName", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="Name shown when replying to form" />
              </div>
              <div className={prefilledFieldClass("contactPreference")}>
                <label htmlFor="contactPreference" className="block text-sm font-medium text-gray-700">
                  Preferred contact <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="contactPreference" />
                </label>
                <input
                  id="contactPreference"
                  type="text"
                  value={form.contactPreference ?? ""}
                  onChange={(e) => updateFormField("contactPreference", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. phone, email, WhatsApp"
                />
              </div>
              <div className={prefilledFieldClass("contactFormSuccessMessage")}>
                <label htmlFor="contactFormSuccessMessage" className="block text-sm font-medium text-gray-700">
                  Success message after submit <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="contactFormSuccessMessage" />
                </label>
                <input
                  id="contactFormSuccessMessage"
                  type="text"
                  value={form.contactFormSuccessMessage ?? ""}
                  onChange={(e) => updateFormField("contactFormSuccessMessage", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Thanks! We'll reply within 24 hours."
                />
              </div>
              <div className={prefilledFieldClass("mapEmbedUrl")}>
                <label htmlFor="mapEmbedUrl" className="block text-sm font-medium text-gray-700">
                  Map embed URL <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="mapEmbedUrl" />
                </label>
                <input
                  id="mapEmbedUrl"
                  type="url"
                  value={form.mapEmbedUrl ?? ""}
                  onChange={(e) => updateFormField("mapEmbedUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="mt-1 text-xs text-gray-500">From Google Maps: Share → Embed a map → copy src URL</p>
              </div>
            </div>
          </div>
          <div className={`mt-6 border-t border-gray-200 pt-6 ${prefilledFieldClass("paymentMethods")}`}>
            <h3 className="mb-3 text-base font-medium text-gray-900">
              Payment methods <PrefilledBadge fieldKey="paymentMethods" />
            </h3>
            <p className="mb-2 text-sm text-gray-500">
              Optional line shown on your site (e.g. &quot;We accept Cash, Card, UPI.&quot;).
            </p>
            <input
              id="paymentMethods"
              type="text"
              value={form.paymentMethods ?? ""}
              onChange={(e) => updateFormField("paymentMethods", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              placeholder="e.g. We accept Cash, Card, UPI"
            />
          </div>
        </div>
        )}

        {/* Step 3: Business hours */}
        {currentStep === 3 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 4 of {totalSteps} — {WIZARD_STEPS[3].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Business hours</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`sm:col-span-2 ${prefilledFieldClass("timezone")}`}>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Local timezone
                <PrefilledBadge fieldKey="timezone" />
              </label>
              <select
                id="timezone"
                value={form.timezone ?? ""}
                onChange={(e) => updateFormField("timezone", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("businessHours")}`}>
              <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700">
                Regular hours <PrefilledBadge fieldKey="businessHours" />
              </label>
              <input
                id="businessHours"
                value={form.businessHours ?? ""}
                onChange={(e) => updateFormField("businessHours", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Mon–Fri 9–6, Sat 10–4, Sun closed"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("specialHours")}`}>
              <label htmlFor="specialHours" className="block text-sm font-medium text-gray-700">
                Special hours / holidays <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="specialHours" />
              </label>
              <input
                id="specialHours"
                value={form.specialHours ?? ""}
                onChange={(e) => updateFormField("specialHours", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Closed on Diwali, New Year 10–2"
              />
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Appointments with Calendly</h3>
            <p className="mb-4 text-sm text-gray-500">
              Let visitors book appointments via your Calendly page. Enable below and paste your Calendly scheduling link (required). Slot duration and lead time are optional and shown on your site when set.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`flex items-center gap-2 ${prefilledFieldClass("bookingEnabled")}`}>
                <input
                  id="bookingEnabled"
                  type="checkbox"
                  checked={form.bookingEnabled === "true"}
                  onChange={(e) => updateFormField("bookingEnabled", e.target.checked ? "true" : "false")}
                  className="rounded border-gray-300"
                />
                <label htmlFor="bookingEnabled" className="text-sm font-medium text-gray-700">Enable appointments (Calendly) <PrefilledBadge fieldKey="bookingEnabled" /></label>
              </div>
              <div className={prefilledFieldClass("bookingSlotDuration")}>
                <label htmlFor="bookingSlotDuration" className="block text-sm font-medium text-gray-700">Slot duration <span className="text-gray-500">(optional)</span> <PrefilledBadge fieldKey="bookingSlotDuration" /></label>
                <input
                  id="bookingSlotDuration"
                  type="text"
                  value={form.bookingSlotDuration ?? ""}
                  onChange={(e) => updateFormField("bookingSlotDuration", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. 30 min"
                />
              </div>
              <div className={`sm:col-span-2 ${prefilledFieldClass("bookingUrl")}`}>
                <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700">
                  Calendly booking link {form.bookingEnabled === "true" ? <span className="text-amber-600">(required)</span> : <span className="text-gray-500">(required when appointments enabled)</span>} <PrefilledBadge fieldKey="bookingUrl" />
                </label>
                <input
                  id="bookingUrl"
                  type="url"
                  value={form.bookingUrl ?? ""}
                  onChange={(e) => updateFormField("bookingUrl", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://calendly.com/your-name/30min"
                />
                <p className="mt-1 text-xs text-gray-500">Get your link from Calendly: create an event type at calendly.com, then copy the scheduling link and paste it here.</p>
              </div>
              <div className={`sm:col-span-2 ${prefilledFieldClass("bookingLeadTime")}`}>
                <label htmlFor="bookingLeadTime" className="block text-sm font-medium text-gray-700">Lead time <PrefilledBadge fieldKey="bookingLeadTime" /></label>
                <input
                  id="bookingLeadTime"
                  type="text"
                  value={form.bookingLeadTime ?? ""}
                  onChange={(e) => updateFormField("bookingLeadTime", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Book at least 2 hours ahead"
                />
              </div>
              <div className={`sm:col-span-2 ${prefilledFieldClass("bookingServiceIds")}`}>
                <label htmlFor="bookingServiceIds" className="block text-sm font-medium text-gray-700">Services that can be booked <span className="text-gray-500">(optional, comma-separated names; leave empty for all)</span> <PrefilledBadge fieldKey="bookingServiceIds" /></label>
                <input
                  id="bookingServiceIds"
                  type="text"
                  value={form.bookingServiceIds ?? ""}
                  onChange={(e) => updateFormField("bookingServiceIds", e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Haircut, Consultation"
                />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Step 6: Services */}
        {currentStep === 6 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${prefilledSectionClass("services")}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 7 of {totalSteps} — {WIZARD_STEPS[6].label}
            {assistantPrefilledFields.has("services") ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Services</h2>
          <p className="mb-4 text-sm text-gray-500">
            List what you offer (e.g. services, menu items, or products). Name is required; others optional.
          </p>
          <div className="space-y-4">
            {servicesList.map((item, index) => (
              <div key={index} className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 ${prefilledSectionClass("services")} ${prefilledItemWrapperClass("services")}`}>
                <PrefilledItemLeftBar sectionKey="services" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                    {assistantPrefilledFields.has("services") ? (
                      <span className="ml-2 text-xs font-medium text-blue-600">(sample)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateServicesList((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={item.name ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, name: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Haircut, Consultation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.category ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, category: e.target.value.trim() || undefined } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Hair, Nails"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
                    <textarea
                      rows={2}
                      value={item.description ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, description: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="Short description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL <span className="text-gray-500">(optional)</span></label>
                    <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("service")}</p>
                    <input
                      type="url"
                      value={item.image ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, image: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.duration ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, duration: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. 30 min"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Price <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.price ?? ""}
                      onChange={(e) =>
                        updateServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, price: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. From $20 or Contact for price"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateServicesList((prev) => [...prev, { name: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add service / item
            </button>
          </div>
        </div>
        )}

        {/* Step 7: FAQ */}
        {currentStep === 7 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${prefilledSectionClass("faq")}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 8 of {totalSteps} — {WIZARD_STEPS[7].label}
            {assistantPrefilledFields.has("faq") ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">FAQ</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add common questions and answers for your visitors. Question is required.
          </p>
          <div className="space-y-4">
            {faqList.map((item, index) => (
              <div key={index} className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 ${prefilledSectionClass("faq")} ${prefilledItemWrapperClass("faq")}`}>
                <PrefilledItemLeftBar sectionKey="faq" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Q&amp;A {index + 1}
                    {assistantPrefilledFields.has("faq") ? (
                      <span className="ml-2 text-xs font-medium text-blue-600">(sample)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateFaqList((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Question</label>
                    <input
                      type="text"
                      value={item.question ?? ""}
                      onChange={(e) =>
                        updateFaqList((prev) =>
                          prev.map((f, i) => (i === index ? { ...f, question: e.target.value } : f))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. What are your opening hours?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Answer</label>
                    <textarea
                      rows={3}
                      value={item.answer ?? ""}
                      onChange={(e) =>
                        updateFaqList((prev) =>
                          prev.map((f, i) => (i === index ? { ...f, answer: e.target.value } : f))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. We are open Mon–Fri 9–6, Sat 10–4."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateFaqList((prev) => [...prev, { question: "", answer: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add question
            </button>
          </div>
        </div>
        )}

        {/* Step 8: Testimonials */}
        {currentStep === 8 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${prefilledSectionClass("testimonials")}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 9 of {totalSteps} — {WIZARD_STEPS[8].label}
            {assistantPrefilledFields.has("testimonials") ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Testimonials</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add customer quotes for social proof. Quote is required; author, photo and rating are optional.
          </p>
          <div className="space-y-4">
            {testimonialsList.map((item, index) => (
              <div key={index} className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 ${prefilledSectionClass("testimonials")} ${prefilledItemWrapperClass("testimonials")}`}>
                <PrefilledItemLeftBar sectionKey="testimonials" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Testimonial {index + 1}
                    {assistantPrefilledFields.has("testimonials") ? (
                      <span className="ml-2 text-xs font-medium text-blue-600">(sample)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateTestimonialsList((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Quote</label>
                    <textarea
                      rows={3}
                      value={item.quote ?? ""}
                      onChange={(e) =>
                        updateTestimonialsList((prev) =>
                          prev.map((t, i) => (i === index ? { ...t, quote: e.target.value } : t))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="What did the customer say?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.author ?? ""}
                      onChange={(e) =>
                        setTestimonialsList((prev) =>
                          prev.map((t, i) => (i === index ? { ...t, author: e.target.value } : t))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Jane D."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Photo URL <span className="text-gray-500">(optional)</span></label>
                    <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("testimonial")}</p>
                    <input
                      type="url"
                      value={item.photo ?? ""}
                      onChange={(e) =>
                        updateTestimonialsList((prev) =>
                          prev.map((t, i) => (i === index ? { ...t, photo: e.target.value } : t))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Rating <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.rating ?? ""}
                      onChange={(e) =>
                        updateTestimonialsList((prev) =>
                          prev.map((t, i) => (i === index ? { ...t, rating: e.target.value } : t))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. 5 or 5 stars"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateTestimonialsList((prev) => [...prev, { quote: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add testimonial
            </button>
          </div>
        </div>
        )}

        {/* Step 9: Team */}
        {currentStep === 9 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${prefilledSectionClass("team")}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 10 of {totalSteps} — {WIZARD_STEPS[9].label}
            {assistantPrefilledFields.has("team") ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Meet the team</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add team or staff members. Name is required; role, photo and short bio are optional.
          </p>
          <div className="space-y-4">
            {teamList.map((item, index) => (
              <div key={index} className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 ${prefilledSectionClass("team")} ${prefilledItemWrapperClass("team")}`}>
                <PrefilledItemLeftBar sectionKey="team" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Team member {index + 1}
                    {assistantPrefilledFields.has("team") ? (
                      <span className="ml-2 text-xs font-medium text-blue-600">(sample)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateTeamList((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={item.name ?? ""}
                      onChange={(e) =>
                        updateTeamList((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, name: e.target.value } : m))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.role ?? ""}
                      onChange={(e) =>
                        updateTeamList((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, role: e.target.value } : m))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Stylist, Manager"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Photo URL <span className="text-gray-500">(optional)</span></label>
                    <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("team")}</p>
                    <input
                      type="url"
                      value={item.photo ?? ""}
                      onChange={(e) =>
                        setTeamList((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, photo: e.target.value } : m))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Short bio <span className="text-gray-500">(optional)</span></label>
                    <textarea
                      rows={2}
                      value={item.bio ?? ""}
                      onChange={(e) =>
                        updateTeamList((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, bio: e.target.value } : m))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="A brief description or specialty."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateTeamList((prev) => [...prev, { name: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add team member
            </button>
          </div>
        </div>
        )}

        {/* Step 10: Certifications */}
        {currentStep === 10 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${prefilledSectionClass("certifications")}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 11 of {totalSteps} — {WIZARD_STEPS[10].label}
            {assistantPrefilledFields.has("certifications") ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Certifications & awards</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add certifications, awards or badges. Provide a title (text) and/or an image URL for each.
          </p>
          <div className="space-y-4">
            {certificationsList.map((item, index) => (
              <div key={index} className={`relative rounded-lg border border-gray-200 bg-gray-50 p-4 ${prefilledSectionClass("certifications")} ${prefilledItemWrapperClass("certifications")}`}>
                <PrefilledItemLeftBar sectionKey="certifications" />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                    {assistantPrefilledFields.has("certifications") ? (
                      <span className="ml-2 text-xs font-medium text-blue-600">(sample)</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCertificationsList((prev) => prev.filter((_, i) => i !== index))}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Title / name <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="text"
                      value={item.title ?? ""}
                      onChange={(e) =>
                        updateCertificationsList((prev) =>
                          prev.map((c, i) => (i === index ? { ...c, title: e.target.value } : c))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. ISO 9001 Certified, Best Salon 2024"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Image URL <span className="text-gray-500">(optional)</span></label>
                    <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("certification")}</p>
                    <input
                      type="url"
                      value={item.image ?? ""}
                      onChange={(e) =>
                        setCertificationsList((prev) =>
                          prev.map((c, i) => (i === index ? { ...c, image: e.target.value } : c))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateCertificationsList((prev) => [...prev, {}])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add certification or award
            </button>
          </div>
        </div>
        )}

        {/* Step 11: Media */}
        {currentStep === 11 && (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${isMediaSectionPrefilled() ? "rounded-lg border-l-4 border-blue-400 bg-blue-50/40" : ""}`}>
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 12 of {totalSteps} — {WIZARD_STEPS[11].label}
            {isMediaSectionPrefilled() ? (
              <span className="ml-2 text-xs font-medium text-blue-600">(sample content)</span>
            ) : null}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Media</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`sm:col-span-2 ${prefilledFieldClass("heroImage")}`}>
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">
                Hero image URL <span className="text-gray-500">(optional)</span>
                <PrefilledBadge fieldKey="heroImage" />
              </label>
              <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("hero")}</p>
              <input
                id="heroImage"
                type="url"
                value={form.heroImage ?? ""}
                onChange={(e) => updateFormField("heroImage", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="https://example.com/hero.jpg"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("galleryUrls")}`}>
              <label htmlFor="galleryUrls" className="block text-sm font-medium text-gray-700">
                Gallery image URLs <span className="text-gray-500">(optional, one per line)</span>
                <PrefilledBadge fieldKey="galleryUrls" />
              </label>
              <p className="mt-0.5 text-xs text-gray-500">{getRecommendedDimensionHint("gallery")}</p>
              <textarea
                id="galleryUrls"
                rows={4}
                value={form.galleryUrls ?? ""}
                onChange={(e) => updateFormField("galleryUrls", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm"
                placeholder="One image URL per line"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("galleryCaptions")}`}>
              <label htmlFor="galleryCaptions" className="block text-sm font-medium text-gray-700">
                Gallery captions <span className="text-gray-500">(optional, one per line, same order as URLs)</span>
                <PrefilledBadge fieldKey="galleryCaptions" />
              </label>
              <textarea
                id="galleryCaptions"
                rows={3}
                value={form.galleryCaptions ?? ""}
                onChange={(e) => updateFormField("galleryCaptions", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm"
                placeholder="Caption for each image, one per line"
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("youtubeUrls")}`}>
              <label htmlFor="youtubeUrls" className="block text-sm font-medium text-gray-700">
                YouTube video URLs <span className="text-gray-500">(optional, one per line)</span>
                <PrefilledBadge fieldKey="youtubeUrls" />
              </label>
              <textarea
                id="youtubeUrls"
                rows={3}
                value={form.youtubeUrls ?? ""}
                onChange={(e) => updateFormField("youtubeUrls", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className={`sm:col-span-2 ${prefilledFieldClass("otherVideoUrls")}`}>
              <label htmlFor="otherVideoUrls" className="block text-sm font-medium text-gray-700">
                Other video URLs <span className="text-gray-500">(e.g. Vimeo, one per line)</span>
                <PrefilledBadge fieldKey="otherVideoUrls" />
              </label>
              <textarea
                id="otherVideoUrls"
                rows={2}
                value={form.otherVideoUrls ?? ""}
                onChange={(e) => updateFormField("otherVideoUrls", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm"
                placeholder="https://vimeo.com/..."
              />
            </div>
          </div>
        </div>
        )}
        </div>

        {/* Wizard navigation + global actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            {!isLastStep && (
              <button
                type="button"
                disabled={currentStep === 0 && isCreateMode && !canProceedFromSiteSettings}
                onClick={() => {
                  if (currentStep === 0 && isCreateMode && !canProceedFromSiteSettings) return;
                  setCurrentStep((s) => s + 1);
                }}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            {isCreateMode && slugAvailability?.available !== true && slugProposed.trim() && (
              <span className="text-xs text-amber-700">
                Check site name availability above first.
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sm text-green-600">Saved</span>
            )}
            {!isCreateMode && (
              <button
                type="button"
                onClick={openPreview}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Preview
              </button>
            )}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? "Publishing…" : isCreateMode ? "Save and publish" : "Publish"}
            </button>
          </div>
        </div>
      </form>
      </div>

      {site?.published_at && (
        <div id="qr" className="mt-8 scroll-mt-4">
          <QRCodeSection
            slug={site.slug}
            siteUrl={`${PUBLIC_SITE_BASE}/${site.slug}`}
            hint="The link and QR code use the site name you set in the Site name step."
          />
        </div>
      )}

      {(!site || !site.published_at) && (
        <p className="mt-6 text-sm text-gray-500">
          Publish your site to get a public link and QR code.
        </p>
      )}

      {!isCreateMode && site && (
        <ContactSubmissionsSection siteId={site.id} />
      )}
    </div>
  );
}
