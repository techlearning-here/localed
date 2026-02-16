"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LocaledSite } from "@/lib/types/site";
import { TIMEZONE_OPTIONS } from "@/lib/timezones";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { QRCodeSection } from "./qr-code-section";

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const WIZARD_STEPS = [
  { id: "basic", label: "Basic info" },
  { id: "contact", label: "Contact" },
  { id: "hours", label: "Business hours" },
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
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState<Record<string, string>>({});
  const totalSteps = WIZARD_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

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
    const locale = data.languages?.[0] ?? "en";
    const content = (data.draft_content?.[locale] ?? data.draft_content?.en ?? {}) as Record<string, string>;
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
    loadSite();
  }, [loadSite]);

  useEffect(() => {
    fetch("/api/features")
      .then((res) => (res.ok ? res.json() : {}))
      .then(setFlags)
      .catch(() => setFlags({}));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!site) return;
    setSaving(true);
    setSaveStatus("idle");
    const locale = site.languages?.[0] ?? "en";
    const base = {
      ...((site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>),
      ...form,
    };
    const galleryUrls = (form.galleryUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const youtubeUrls = (form.youtubeUrls ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    const draft_content = {
      [locale]: { ...base, galleryUrls, youtubeUrls },
    };
    try {
      const res = await fetch(`/api/dashboard/sites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft_content }),
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
      setSaveStatus("saved");
      setError(null);
    } catch {
      setSaveStatus("error");
      setError("Network error");
    }
    setSaving(false);
  }

  function openPreview() {
    window.open(`/dashboard/sites/${id}/preview`, "_blank", "noopener");
  }

  async function handlePublish() {
    if (!site) return;
    setPublishing(true);
    setError(null);
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

  if (error && !site) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!site) return null;

  const locale = site.languages?.[0] ?? "en";

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Edit site</h1>
        <span className="rounded bg-gray-200 px-2 py-0.5 text-sm text-gray-600">
          /{site.slug}
        </span>
        {site.published_at ? (
          <span className="rounded bg-green-100 px-2 py-0.5 text-sm text-green-800">
            Published
          </span>
        ) : (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-sm text-amber-800">
            Draft
          </span>
        )}
        {flags.archive !== false && site.archived_at ? (
          <span className="rounded bg-gray-200 px-2 py-0.5 text-sm text-gray-700">
            Archived
          </span>
        ) : null}
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
      </div>

      {error && saveStatus === "error" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
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
        {/* Step 1: Basic info */}
        {currentStep === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
        {currentStep === 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
        {currentStep === 2 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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

        {/* Step 4: Media */}
        {currentStep === 3 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
            {saveStatus === "saved" && (
              <span className="text-sm text-green-600">Saved</span>
            )}
            <button
              type="button"
              onClick={openPreview}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
            {site.published_at && (
              <a
                href={`${BASE_URL}/${site.slug}`}
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

      {site.published_at && (
        <div className="mt-8">
          <QRCodeSection slug={site.slug} siteUrl={`${BASE_URL}/${site.slug}`} />
        </div>
      )}

      {!site.published_at && (
        <p className="mt-6 text-sm text-gray-500">
          Publish your site to get a public link and QR code.
        </p>
      )}
    </div>
  );
}
