"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ContactSubmission = {
  id: string;
  site_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

/**
 * Formats an ISO date string for display in the submissions list.
 * Exported for unit tests (CONTACT-03-UI).
 */
export function formatSubmissionDate(iso: string): string {
  if (!iso || typeof iso !== "string") return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type Props = { siteId: string };

/**
 * CONTACT-03-UI: Section that fetches and displays contact form submissions for the site.
 * Shown on the edit page when not in create mode.
 */
export function ContactSubmissionsSection({ siteId }: Props) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/sites/${siteId}/submissions`);
      if (!res.ok) {
        setError("Failed to load submissions");
        setSubmissions([]);
        return;
      }
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load submissions");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [siteId]);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-medium text-gray-900">Contact submissions</h2>
      <p className="mb-4 text-sm text-gray-600">
        Messages sent via your site’s contact form appear here.
      </p>
      {loading && (
        <p className="text-sm text-gray-500">Loading…</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && submissions.length === 0 && (
        <p className="text-sm text-gray-500">No contact submissions yet.</p>
      )}
      {!loading && !error && submissions.length > 0 && (
        <ul className="space-y-4">
          {submissions.map((sub) => (
            <li
              key={sub.id}
              className="rounded border border-gray-100 bg-gray-50 p-4"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-900">{sub.name}</span>
                <span className="text-gray-500">·</span>
                <a
                  href={`mailto:${sub.email}`}
                  className="text-gray-600 underline hover:text-gray-900"
                >
                  {sub.email}
                </a>
                <span className="text-gray-400">
                  {formatSubmissionDate(sub.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{sub.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
