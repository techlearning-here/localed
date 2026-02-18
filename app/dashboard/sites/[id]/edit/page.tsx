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
} from "@/lib/template-catalog";
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
  phone: "",
  phone2: "",
  email: "",
  whatsApp: "",
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
};

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateExtraValues, setTemplateExtraValues] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [teamList, setTeamList] = useState<TeamMemberItem[]>([]);
  const [certificationsList, setCertificationsList] = useState<CertificationAwardItem[]>([]);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const flags = useDashboardFeatures();
  const [form, setForm] = useState<Record<string, string>>(() => ({ ...INITIAL_FORM }));
  const totalSteps = WIZARD_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const isCreateMode = id === "new";

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
      phone: content.phone ?? "",
      phone2: content.phone2 ?? "",
      email: content.email ?? "",
      whatsApp: content.whatsApp ?? "",
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
    if (isCreateMode && businessType && !selectedTemplateId) {
      setSelectedTemplateId(getDefaultTemplateIdForBusinessType(businessType));
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

  async function checkSlugAvailability() {
    const slug = normalizedSlugProposed();
    if (!slug) {
      setSlugAvailability({ available: false, message: "Enter a site name" });
      return;
    }
    setCheckingSlug(true);
    setSlugAvailability(null);
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
    setSaving(true);
    setSaveStatus("idle");
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
      country?: string | null;
      languages?: string[];
      business_type?: BusinessType;
      slug?: string;
    } = {
      draft_content: draftContentForPayload,
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
    setArchiving(true);
    setError(null);
    const newArchived = !site.archived_at;
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
              <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">
                Published
              </span>
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
              <button
                type="button"
                onClick={handleArchiveToggle}
                disabled={archiving}
                className="ml-2 text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
              >
                {site.archived_at ? "Unarchive site" : "Archive site"}
              </button>
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
            onChange={(e) => setCurrentStep(Number(e.target.value))}
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
                      onClick={() => setCurrentStep(index)}
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
                Site name (URL)
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
                      placeholder="e.g. joes-salon"
                      className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
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

        {/* Step 4: Template selection */}
        {currentStep === 4 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Step 5 of {totalSteps} — {WIZARD_STEPS[4].label}
            </p>
            <h2 className="mb-4 text-lg font-medium text-gray-900">Choose a template</h2>
            <p className="mb-4 text-sm text-gray-500">
              Pick one of two layouts for your business type. You can change this later.
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
                  <span className="font-medium text-gray-900">{t.label}</span>
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
            <div className="sm:col-span-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business name
              </label>
              <input
                id="businessName"
                value={form.businessName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="legalName" className="block text-sm font-medium text-gray-700">
                Legal name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="legalName"
                value={form.legalName ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="If different from business name"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
                Tagline
              </label>
              <input
                id="tagline"
                value={form.tagline ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Your neighborhood salon"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo URL <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="logo"
                type="url"
                value={form.logo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="favicon" className="block text-sm font-medium text-gray-700">
                Favicon URL <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="favicon"
                type="url"
                value={form.favicon ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, favicon: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Leave empty to use logo"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                Short description
              </label>
              <input
                id="shortDescription"
                value={form.shortDescription ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="1–2 sentences for your homepage"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="about" className="block text-sm font-medium text-gray-700">
                About (longer text)
              </label>
              <textarea
                id="about"
                rows={4}
                value={form.about ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700">
                Year established <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="yearEstablished"
                value={form.yearEstablished ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, yearEstablished: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Since 2010"
              />
            </div>
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">SEO (optional)</p>
              <p className="text-xs text-gray-500 mb-3">Override defaults for search and social sharing.</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-600">Meta title</label>
                  <input
                    id="metaTitle"
                    value={form.metaTitle ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Defaults to business name + tagline"
                  />
                </div>
                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-600">Meta description</label>
                  <input
                    id="metaDescription"
                    value={form.metaDescription ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Defaults to short description"
                  />
                </div>
                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-600">Keywords</label>
                  <input
                    id="keywords"
                    value={form.keywords ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Comma-separated (e.g. salon, haircut, Mumbai)"
                  />
                </div>
                <div>
                  <label htmlFor="priceRange" className="block text-sm font-medium text-gray-600">Price range (SEO)</label>
                  <input
                    id="priceRange"
                    value={form.priceRange ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. $$ or $ to $$$"
                  />
                  <p className="mt-1 text-xs text-gray-500">Shown in search results (e.g. $ to $$$)</p>
                </div>
                <div>
                  <label htmlFor="robotsMeta" className="block text-sm font-medium text-gray-600">Robots meta <span className="text-gray-500">(optional)</span></label>
                  <input id="robotsMeta" value={form.robotsMeta ?? ""} onChange={(e) => setForm((f) => ({ ...f, robotsMeta: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. noindex, nofollow" />
                </div>
                <div>
                  <label htmlFor="customCssUrl" className="block text-sm font-medium text-gray-600">Custom CSS URL <span className="text-gray-500">(optional)</span></label>
                  <input id="customCssUrl" type="url" value={form.customCssUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, customCssUrl: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Announcement &amp; footer</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="announcementBar" className="block text-sm font-medium text-gray-600">Announcement bar <span className="text-gray-500">(optional)</span></label>
                  <input
                    id="announcementBar"
                    value={form.announcementBar ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, announcementBar: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. Closed for holidays Dec 24–26"
                  />
                </div>
                <div>
                  <label htmlFor="footerText" className="block text-sm font-medium text-gray-600">Footer text</label>
                  <input
                    id="footerText"
                    value={form.footerText ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, footerText: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="e.g. © 2024 Business Name"
                  />
                </div>
                <div>
                  <label htmlFor="customDomainDisplay" className="block text-sm font-medium text-gray-600">Custom domain text <span className="text-gray-500">(optional)</span></label>
                  <input id="customDomainDisplay" value={form.customDomainDisplay ?? ""} onChange={(e) => setForm((f) => ({ ...f, customDomainDisplay: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Visit us at example.com" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showBackToTop" checked={form.showBackToTop === "true"} onChange={(e) => setForm((f) => ({ ...f, showBackToTop: e.target.checked ? "true" : "false" }))} className="rounded border-gray-300" />
                  <label htmlFor="showBackToTop" className="text-sm font-medium text-gray-700">Show &quot;Back to top&quot; link</label>
                </div>
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Newsletter</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="hasNewsletter" checked={form.hasNewsletter === "true"} onChange={(e) => setForm((f) => ({ ...f, hasNewsletter: e.target.checked ? "true" : "false" }))} className="rounded border-gray-300" />
                    <label htmlFor="hasNewsletter" className="text-sm text-gray-600">Show newsletter section</label>
                  </div>
                  <div className="space-y-2">
                    <input id="newsletterLabel" value={form.newsletterLabel ?? ""} onChange={(e) => setForm((f) => ({ ...f, newsletterLabel: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm" placeholder="Newsletter label (optional)" />
                    <input id="newsletterUrl" type="url" value={form.newsletterUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, newsletterUrl: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm" placeholder="Sign-up URL" />
                  </div>
                </div>
                <div>
                  <label htmlFor="shareSectionTitle" className="block text-sm font-medium text-gray-600">Share section title <span className="text-gray-500">(optional)</span></label>
                  <input id="shareSectionTitle" value={form.shareSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, shareSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Share this page" />
                </div>
                <div>
                  <label htmlFor="themeColor" className="block text-sm font-medium text-gray-600">Theme color (hex)</label>
                  <input
                    id="themeColor"
                    value={form.themeColor ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, themeColor: e.target.value }))}
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
                <div><label htmlFor="servicesSectionTitle" className="block text-xs text-gray-600">Services</label><input id="servicesSectionTitle" value={form.servicesSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, servicesSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="What we offer" /></div>
                <div><label htmlFor="aboutSectionTitle" className="block text-xs text-gray-600">About</label><input id="aboutSectionTitle" value={form.aboutSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, aboutSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="About" /></div>
                <div><label htmlFor="contactSectionTitle" className="block text-xs text-gray-600">Contact</label><input id="contactSectionTitle" value={form.contactSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Contact" /></div>
                <div><label htmlFor="hoursSectionTitle" className="block text-xs text-gray-600">Hours</label><input id="hoursSectionTitle" value={form.hoursSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, hoursSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Hours" /></div>
                <div><label htmlFor="faqSectionTitle" className="block text-xs text-gray-600">FAQ</label><input id="faqSectionTitle" value={form.faqSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, faqSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="FAQ" /></div>
                <div><label htmlFor="contactFormSectionTitle" className="block text-xs text-gray-600">Contact form</label><input id="contactFormSectionTitle" value={form.contactFormSectionTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactFormSectionTitle: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900" placeholder="Contact us" /></div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="faqAsAccordion" checked={form.faqAsAccordion === "true"} onChange={(e) => setForm((f) => ({ ...f, faqAsAccordion: e.target.checked ? "true" : "false" }))} className="rounded border-gray-300" />
                  <label htmlFor="faqAsAccordion" className="text-sm text-gray-600">Show FAQ as accordion (expand/collapse)</label>
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
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                id="address"
                value={form.address ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="addressLocality" className="block text-sm font-medium text-gray-700">Locality / City <span className="text-gray-500">(optional)</span></label>
              <input id="addressLocality" value={form.addressLocality ?? ""} onChange={(e) => setForm((f) => ({ ...f, addressLocality: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label htmlFor="addressRegion" className="block text-sm font-medium text-gray-700">Region / State <span className="text-gray-500">(optional)</span></label>
              <input id="addressRegion" value={form.addressRegion ?? ""} onChange={(e) => setForm((f) => ({ ...f, addressRegion: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. Maharashtra" />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal code <span className="text-gray-500">(optional)</span></label>
              <input id="postalCode" value={form.postalCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. 400001" />
            </div>
            <div>
              <label htmlFor="directionsLabel" className="block text-sm font-medium text-gray-700">Map link label</label>
              <input id="directionsLabel" value={form.directionsLabel ?? "View on map"} onChange={(e) => setForm((f) => ({ ...f, directionsLabel: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="View on map" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="country"
                value={form.country ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="areaServed" className="block text-sm font-medium text-gray-700">
                Location / area served <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="areaServed"
                value={form.areaServed ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, areaServed: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Serving Mumbai and suburbs, Downtown only"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="email2" className="block text-sm font-medium text-gray-700">
                Email 2 <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="email2"
                type="email"
                value={form.email2 ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email2: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="phone2" className="block text-sm font-medium text-gray-700">
                Phone 2 <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="phone2"
                type="tel"
                value={form.phone2 ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone2: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="whatsApp" className="block text-sm font-medium text-gray-700">
                WhatsApp <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="whatsApp"
                type="text"
                value={form.whatsApp ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, whatsApp: e.target.value }))}
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
              <div>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">Facebook</label>
                <input
                  id="facebookUrl"
                  type="url"
                  value={form.facebookUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  id="instagramUrl"
                  type="url"
                  value={form.instagramUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label htmlFor="youtubeChannelUrl" className="block text-sm font-medium text-gray-700">YouTube channel</label>
                <input
                  id="youtubeChannelUrl"
                  type="url"
                  value={form.youtubeChannelUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeChannelUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700">Twitter / X</label>
                <input
                  id="twitterUrl"
                  type="url"
                  value={form.twitterUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, twitterUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://x.com/..."
                />
              </div>
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input
                  id="linkedinUrl"
                  type="url"
                  value={form.linkedinUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, linkedinUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
              <div>
                <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-700">TikTok</label>
                <input
                  id="tiktokUrl"
                  type="url"
                  value={form.tiktokUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, tiktokUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://tiktok.com/@..."
                />
              </div>
              <div>
                <label htmlFor="otherLinkLabel" className="block text-sm font-medium text-gray-700">Other link (label)</label>
                <input
                  id="otherLinkLabel"
                  type="text"
                  value={form.otherLinkLabel ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, otherLinkLabel: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Blog"
                />
              </div>
              <div>
                <label htmlFor="otherLinkUrl" className="block text-sm font-medium text-gray-700">Other link (URL)</label>
                <input
                  id="otherLinkUrl"
                  type="url"
                  value={form.otherLinkUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, otherLinkUrl: e.target.value }))}
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
              <div>
                <label htmlFor="ctaLabel" className="block text-sm font-medium text-gray-700">Button label</label>
                <input
                  id="ctaLabel"
                  type="text"
                  value={form.ctaLabel ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Book now"
                />
              </div>
              <div>
                <label htmlFor="ctaUrl" className="block text-sm font-medium text-gray-700">Button URL</label>
                <input
                  id="ctaUrl"
                  type="url"
                  value={form.ctaUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://... or tel:+1234567890"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cta3Label" className="block text-sm font-medium text-gray-700">Third button label <span className="text-gray-500">(optional)</span></label>
                  <input id="cta3Label" type="text" value={form.cta3Label ?? ""} onChange={(e) => setForm((f) => ({ ...f, cta3Label: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="e.g. View menu" />
                </div>
                <div>
                  <label htmlFor="cta3Url" className="block text-sm font-medium text-gray-700">Third button URL</label>
                  <input id="cta3Url" type="url" value={form.cta3Url ?? ""} onChange={(e) => setForm((f) => ({ ...f, cta3Url: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Contact form</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="contactFormSubject" className="block text-sm font-medium text-gray-700">
                  Default subject line <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="contactFormSubject"
                  type="text"
                  value={form.contactFormSubject ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contactFormSubject: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Website enquiry"
                />
              </div>
              <div>
                <label htmlFor="contactFormReplyToName" className="block text-sm font-medium text-gray-700">Reply-to name <span className="text-gray-500">(optional)</span></label>
                <input id="contactFormReplyToName" type="text" value={form.contactFormReplyToName ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactFormReplyToName: e.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900" placeholder="Name shown when replying to form" />
              </div>
              <div>
                <label htmlFor="contactPreference" className="block text-sm font-medium text-gray-700">
                  Preferred contact <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="contactPreference"
                  type="text"
                  value={form.contactPreference ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contactPreference: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. phone, email, WhatsApp"
                />
              </div>
              <div>
                <label htmlFor="contactFormSuccessMessage" className="block text-sm font-medium text-gray-700">
                  Success message after submit <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="contactFormSuccessMessage"
                  type="text"
                  value={form.contactFormSuccessMessage ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contactFormSuccessMessage: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Thanks! We'll reply within 24 hours."
                />
              </div>
              <div>
                <label htmlFor="mapEmbedUrl" className="block text-sm font-medium text-gray-700">
                  Map embed URL <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="mapEmbedUrl"
                  type="url"
                  value={form.mapEmbedUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, mapEmbedUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="mt-1 text-xs text-gray-500">From Google Maps: Share → Embed a map → copy src URL</p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Payment methods</h3>
            <p className="mb-2 text-sm text-gray-500">
              Optional line shown on your site (e.g. &quot;We accept Cash, Card, UPI.&quot;).
            </p>
            <input
              id="paymentMethods"
              type="text"
              value={form.paymentMethods ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, paymentMethods: e.target.value }))}
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
            <div className="sm:col-span-2">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                Local timezone
              </label>
              <select
                id="timezone"
                value={form.timezone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value || "empty"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="businessHours" className="block text-sm font-medium text-gray-700">
                Regular hours
              </label>
              <input
                id="businessHours"
                value={form.businessHours ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, businessHours: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Mon–Fri 9–6, Sat 10–4, Sun closed"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="specialHours" className="block text-sm font-medium text-gray-700">
                Special hours / holidays <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="specialHours"
                value={form.specialHours ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, specialHours: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g. Closed on Diwali, New Year 10–2"
              />
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="mb-3 text-base font-medium text-gray-900">Bookings (optional)</h3>
            <p className="mb-4 text-sm text-gray-500">
              Show &quot;Book online&quot; on your site. Slot duration and lead time are displayed when set.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <input
                  id="bookingEnabled"
                  type="checkbox"
                  checked={form.bookingEnabled === "true"}
                  onChange={(e) => setForm((f) => ({ ...f, bookingEnabled: e.target.checked ? "true" : "false" }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="bookingEnabled" className="text-sm font-medium text-gray-700">Booking enabled</label>
              </div>
              <div>
                <label htmlFor="bookingSlotDuration" className="block text-sm font-medium text-gray-700">Slot duration</label>
                <input
                  id="bookingSlotDuration"
                  type="text"
                  value={form.bookingSlotDuration ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bookingSlotDuration: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. 30 min"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bookingUrl" className="block text-sm font-medium text-gray-700">Booking URL <span className="text-gray-500">(optional)</span></label>
                <input
                  id="bookingUrl"
                  type="url"
                  value={form.bookingUrl ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bookingUrl: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. https://calendly.com/..."
                />
                <p className="mt-1 text-xs text-gray-500">Link for &quot;Book now&quot; when booking is enabled</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bookingLeadTime" className="block text-sm font-medium text-gray-700">Lead time</label>
                <input
                  id="bookingLeadTime"
                  type="text"
                  value={form.bookingLeadTime ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bookingLeadTime: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g. Book at least 2 hours ahead"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bookingServiceIds" className="block text-sm font-medium text-gray-700">Services that can be booked <span className="text-gray-500">(optional, comma-separated names; leave empty for all)</span></label>
                <input
                  id="bookingServiceIds"
                  type="text"
                  value={form.bookingServiceIds ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bookingServiceIds: e.target.value }))}
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 7 of {totalSteps} — {WIZARD_STEPS[6].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Services</h2>
          <p className="mb-4 text-sm text-gray-500">
            List what you offer (e.g. services, menu items, or products). Name is required; others optional.
          </p>
          <div className="space-y-4">
            {servicesList.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setServicesList((prev) => prev.filter((_, i) => i !== index))}
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
                        setServicesList((prev) =>
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
                        setServicesList((prev) =>
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
                        setServicesList((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, description: e.target.value } : s))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="Short description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL <span className="text-gray-500">(optional)</span></label>
                    <input
                      type="url"
                      value={item.image ?? ""}
                      onChange={(e) =>
                        setServicesList((prev) =>
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
                        setServicesList((prev) =>
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
                        setServicesList((prev) =>
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
              onClick={() => setServicesList((prev) => [...prev, { name: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add service / item
            </button>
          </div>
        </div>
        )}

        {/* Step 7: FAQ */}
        {currentStep === 7 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 8 of {totalSteps} — {WIZARD_STEPS[7].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">FAQ</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add common questions and answers for your visitors. Question is required.
          </p>
          <div className="space-y-4">
            {faqList.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Q&amp;A {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setFaqList((prev) => prev.filter((_, i) => i !== index))}
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
                        setFaqList((prev) =>
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
                        setFaqList((prev) =>
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
              onClick={() => setFaqList((prev) => [...prev, { question: "", answer: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add question
            </button>
          </div>
        </div>
        )}

        {/* Step 8: Testimonials */}
        {currentStep === 8 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 9 of {totalSteps} — {WIZARD_STEPS[8].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Testimonials</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add customer quotes for social proof. Quote is required; author, photo and rating are optional.
          </p>
          <div className="space-y-4">
            {testimonialsList.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Testimonial {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setTestimonialsList((prev) => prev.filter((_, i) => i !== index))}
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
                        setTestimonialsList((prev) =>
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
                    <input
                      type="url"
                      value={item.photo ?? ""}
                      onChange={(e) =>
                        setTestimonialsList((prev) =>
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
                        setTestimonialsList((prev) =>
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
              onClick={() => setTestimonialsList((prev) => [...prev, { quote: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add testimonial
            </button>
          </div>
        </div>
        )}

        {/* Step 9: Team */}
        {currentStep === 9 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 10 of {totalSteps} — {WIZARD_STEPS[9].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Meet the team</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add team or staff members. Name is required; role, photo and short bio are optional.
          </p>
          <div className="space-y-4">
            {teamList.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Team member {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setTeamList((prev) => prev.filter((_, i) => i !== index))}
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
                        setTeamList((prev) =>
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
                        setTeamList((prev) =>
                          prev.map((m, i) => (i === index ? { ...m, role: e.target.value } : m))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. Stylist, Manager"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Photo URL <span className="text-gray-500">(optional)</span></label>
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
                        setTeamList((prev) =>
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
              onClick={() => setTeamList((prev) => [...prev, { name: "" }])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add team member
            </button>
          </div>
        </div>
        )}

        {/* Step 10: Certifications */}
        {currentStep === 10 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 11 of {totalSteps} — {WIZARD_STEPS[10].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Certifications & awards</h2>
          <p className="mb-4 text-sm text-gray-500">
            Add certifications, awards or badges. Provide a title (text) and/or an image URL for each.
          </p>
          <div className="space-y-4">
            {certificationsList.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setCertificationsList((prev) => prev.filter((_, i) => i !== index))}
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
                        setCertificationsList((prev) =>
                          prev.map((c, i) => (i === index ? { ...c, title: e.target.value } : c))
                        )
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                      placeholder="e.g. ISO 9001 Certified, Best Salon 2024"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Image URL <span className="text-gray-500">(optional)</span></label>
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
              onClick={() => setCertificationsList((prev) => [...prev, {}])}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add certification or award
            </button>
          </div>
        </div>
        )}

        {/* Step 11: Media */}
        {currentStep === 11 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 12 of {totalSteps} — {WIZARD_STEPS[11].label}
          </p>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Media</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">
                Hero image URL <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="heroImage"
                type="url"
                value={form.heroImage ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="https://example.com/hero.jpg"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="galleryUrls" className="block text-sm font-medium text-gray-700">
                Gallery image URLs <span className="text-gray-500">(optional, one per line)</span>
              </label>
              <textarea
                id="galleryUrls"
                rows={4}
                value={form.galleryUrls ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, galleryUrls: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm"
                placeholder="One image URL per line"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="galleryCaptions" className="block text-sm font-medium text-gray-700">
                Gallery captions <span className="text-gray-500">(optional, one per line, same order as URLs)</span>
              </label>
              <textarea
                id="galleryCaptions"
                rows={3}
                value={form.galleryCaptions ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, galleryCaptions: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm"
                placeholder="Caption for each image, one per line"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="youtubeUrls" className="block text-sm font-medium text-gray-700">
                YouTube video URLs <span className="text-gray-500">(optional, one per line)</span>
              </label>
              <textarea
                id="youtubeUrls"
                rows={3}
                value={form.youtubeUrls ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, youtubeUrls: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 font-mono text-sm"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="otherVideoUrls" className="block text-sm font-medium text-gray-700">
                Other video URLs <span className="text-gray-500">(e.g. Vimeo, one per line)</span>
              </label>
              <textarea
                id="otherVideoUrls"
                rows={2}
                value={form.otherVideoUrls ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, otherVideoUrls: e.target.value }))}
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
                onClick={() => setCurrentStep((s) => s + 1)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
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
            {site?.published_at && (
              <a
                href={`${PUBLIC_SITE_BASE}/${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 underline hover:text-gray-900"
              >
                View live site →
              </a>
            )}
          </div>
        </div>
      </form>
      </div>

      {site?.published_at && (
        <div className="mt-8">
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
