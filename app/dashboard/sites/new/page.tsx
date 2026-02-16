"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BusinessType } from "@/lib/types/site";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/languages";

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "salon", label: "Salon / Beauty" },
  { value: "clinic", label: "Clinic / Health" },
  { value: "repair", label: "Repair / Workshop" },
  { value: "tutor", label: "Tutor / Coach" },
  { value: "cafe", label: "Cafe / Restaurant" },
  { value: "local_service", label: "Local service" },
  { value: "other", label: "Other" },
];

const NEW_SITE_STEPS = [
  { id: "basics", label: "Basics" },
  { id: "languages", label: "Languages" },
] as const;

export default function NewSitePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [businessType, setBusinessType] = useState<BusinessType>("salon");
  const [slug, setSlug] = useState("");
  const [languages, setLanguages] = useState<string[]>([DEFAULT_LANGUAGE]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalSteps = NEW_SITE_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  function addLanguage(lang: string) {
    if (lang && !languages.includes(lang)) {
      setLanguages((prev) => [...prev, lang].sort((a, b) => {
        const ia = SUPPORTED_LANGUAGES.findIndex((l) => l.value === a);
        const ib = SUPPORTED_LANGUAGES.findIndex((l) => l.value === b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }));
    }
  }

  function removeLanguage(lang: string) {
    if (lang !== DEFAULT_LANGUAGE) {
      setLanguages((prev) => prev.filter((l) => l !== lang));
    }
  }

  const availableToAdd = SUPPORTED_LANGUAGES.filter((l) => !languages.includes(l.value));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: businessType,
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
          languages: languages.length ? languages : ["en"],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create site");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/sites/${data.id}/edit`);
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Create a new site</h1>
      <p className="mt-1 text-gray-600">
        Complete the steps below. You can edit all content after the site is created.
      </p>

      {/* Step progress */}
      <div className="mt-8 mb-8">
        <p className="mb-2 text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </p>
        <div className="flex items-center gap-0">
          {NEW_SITE_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className="flex flex-1 flex-col items-center gap-1 py-2 sm:flex-row sm:justify-center"
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

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Basics */}
        {currentStep === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Basics</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                  Business type
                </label>
                <select
                  id="business_type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                >
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL slug
                </label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Your site will be at localed.info/<strong>{slug || "your-slug"}</strong>
                </p>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="e.g. joes-salon"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Languages */}
        {currentStep === 1 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Languages</h2>
            <p className="mb-4 text-sm text-gray-500">
              English is included. Add more languages from the dropdown; you can edit content per language in the editor.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {languages.map((code) => {
                const meta = SUPPORTED_LANGUAGES.find((l) => l.value === code);
                const label = meta?.label ?? code;
                const isDefault = code === DEFAULT_LANGUAGE;
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
                  >
                    {label}
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(code)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-gray-200"
                        aria-label={`Remove ${label}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
              {availableToAdd.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) addLanguage(v);
                    e.target.value = "";
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
                  aria-label="Add language"
                >
                  <option value="">+ Add language</option>
                  {availableToAdd.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

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
          <div className="flex gap-3">
            {isLastStep && (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create and edit"}
              </button>
            )}
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
