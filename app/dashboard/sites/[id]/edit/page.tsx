"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BusinessType, LocaledSite } from "@/lib/types/site";
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
  { id: "contact", label: "Contact" },
  { id: "hours", label: "Business hours" },
  { id: "template", label: "Template" },
  { id: "template_extras", label: "Template details" },
  { id: "media", label: "Media" },
] as const;

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
  const stepContentRef = useRef<HTMLDivElement>(null);

  const flags = useDashboardFeatures();
  const [form, setForm] = useState<Record<string, string>>({});
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
      businessName: content.businessName ?? "",
      legalName: content.legalName ?? "",
      tagline: content.tagline ?? "",
      logo: content.logo ?? "",
      favicon: content.favicon ?? "",
      shortDescription: content.shortDescription ?? "",
      about: content.about ?? "",
      yearEstablished: content.yearEstablished ?? "",
      address: content.address ?? "",
      country: content.country ?? (data.country ?? ""),
      areaServed: content.areaServed ?? "",
      phone: content.phone ?? "",
      email: content.email ?? "",
      whatsApp: content.whatsApp ?? "",
      businessHours: content.businessHours ?? "",
      specialHours: content.specialHours ?? "",
      timezone: content.timezone ?? "",
      heroImage: content.heroImage ?? "",
      galleryUrls: Array.isArray(content.galleryUrls) ? content.galleryUrls.join("\n") : "",
      youtubeUrls: Array.isArray(content.youtubeUrls) ? content.youtubeUrls.join("\n") : "",
    });
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
    const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const base = site
      ? {
          ...((site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>),
          ...form,
        }
      : { ...form };
    const draftContentForPayload = {
      [locale]: { ...base, ...templateExtraValues, galleryUrls, youtubeUrls },
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
      const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const draftContentForPayload = {
        [locale]: { ...form, ...templateExtraValues, galleryUrls, youtubeUrls },
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
          setError("Site created but publish failed. You can publish from the editor.");
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

      {/* Step progress */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </p>
        <div className="flex items-center gap-0">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className="flex flex-1 flex-col items-center gap-1 py-2 text-left sm:flex-row sm:justify-center"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-gray-900" : isCompleted ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < totalSteps - 1 && (
                  <div
                    className={`h-0.5 w-8 flex-shrink-0 sm:w-16 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
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
        </div>
        )}

        {/* Step 6: Media */}
        {currentStep === 6 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Step 7 of {totalSteps} — {WIZARD_STEPS[6].label}
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
