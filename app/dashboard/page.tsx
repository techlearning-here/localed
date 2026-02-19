"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LocaledSite } from "@/lib/types/site";
import { useDashboardFeatures } from "./features-context";

type FilterKind = "all" | "active" | "archived";

function filterSites(sites: LocaledSite[], filter: FilterKind): LocaledSite[] {
  if (filter === "active") return sites.filter((s) => !s.archived_at);
  if (filter === "archived") return sites.filter((s) => !!s.archived_at);
  return sites;
}

/** Dedupe rapid duplicate fetches (e.g. React Strict Mode double-mount). */
let sitesFetchInFlight: Promise<LocaledSite[]> | null = null;

function fetchSitesOnce(): Promise<LocaledSite[]> {
  if (sitesFetchInFlight) return sitesFetchInFlight;
  sitesFetchInFlight = fetch("/api/dashboard/sites")
    .then((res) => {
      if (!res.ok) throw new Error(res.status === 401 ? "Not authorized" : "Failed to load");
      return res.json();
    })
    .finally(() => {
      sitesFetchInFlight = null;
    });
  return sitesFetchInFlight;
}

export default function DashboardPage() {
  const [sites, setSites] = useState<LocaledSite[]>([]);
  const [filter, setFilter] = useState<FilterKind>("all");
  const flags = useDashboardFeatures();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const loadSites = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchSitesOnce()
      .then(setSites)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  async function setArchive(siteId: string, archived: boolean) {
    setArchivingId(siteId);
    try {
      const res = await fetch(`/api/dashboard/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (res.ok) {
        const updated: LocaledSite = await res.json();
        setSites((prev) => prev.map((s) => (s.id === siteId ? updated : s)));
      }
    } finally {
      setArchivingId(null);
    }
  }

  if (loading) {
    return (
      <p className="text-gray-500">Loading your sites…</p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-medium">Could not load dashboard</p>
        <p className="mt-1 text-sm">{error}</p>
        <p className="mt-2 text-sm">
          In development, set <code className="rounded bg-red-100 px-1">LOCALED_DEV_OWNER_ID</code> in .env.local to a user UUID from Supabase Auth → Users.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My sites</h1>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">You don’t have any sites yet.</p>
          <Link
            href="/dashboard/sites/new/edit"
            className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create your first site
          </Link>
        </div>
      ) : (
        <>
          {flags.archive !== false && (
          <div className="mb-4 flex gap-2">
            {(["all", "active", "archived"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                }
              >
                {f === "all" ? "All" : f === "active" ? "Active" : "Archived"}
              </button>
            ))}
          </div>
          )}
          <ul className="space-y-3">
            {filterSites(sites, flags.archive === false ? "all" : filter).map((site) => {
              const locale = site.languages?.[0] ?? "en";
              const content = site.draft_content?.[locale] ?? site.draft_content?.en ?? {};
              const name = (content.businessName as string) || site.slug || "Untitled";
              const isArchived = !!site.archived_at;
              return (
                <li key={site.id}>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow">
                    <Link
                      href={`/dashboard/sites/${site.id}/edit`}
                      className="min-w-0 flex-1"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-sm text-gray-500">
                          /{site.slug}
                          {site.published_at && !isArchived ? (
                            <span className="ml-2 text-green-600">Published</span>
                          ) : isArchived ? (
                            <span className="ml-2 text-amber-600">Unpublished</span>
                          ) : (
                            <span className="ml-2 text-amber-600">Draft</span>
                          )}
                        </p>
                      </div>
                    </Link>
                    <span className="flex shrink-0 items-center gap-3 text-gray-500">
                      {site.published_at && !site.archived_at && (
                        <>
                          <a
                            href={`/${site.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            aria-label="View site"
                            title="View site"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                          <Link
                            href={`/dashboard/sites/${site.id}/edit#qr`}
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            aria-label="QR code"
                            title="QR code"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <rect x="1" y="1" width="5" height="5" />
                              <rect x="1" y="8" width="5" height="5" />
                              <rect x="8" y="1" width="5" height="5" />
                              <rect x="8" y="8" width="5" height="5" />
                              <rect x="15" y="1" width="4" height="4" />
                              <rect x="15" y="7" width="4" height="4" />
                              <rect x="21" y="1" width="2" height="5" />
                              <rect x="21" y="8" width="2" height="5" />
                              <rect x="1" y="15" width="5" height="5" />
                              <rect x="8" y="15" width="5" height="5" />
                              <rect x="8" y="21" width="5" height="2" />
                              <rect x="15" y="15" width="4" height="4" />
                              <rect x="15" y="21" width="4" height="2" />
                              <rect x="21" y="15" width="2" height="5" />
                              <rect x="21" y="21" width="2" height="2" />
                            </svg>
                          </Link>
                        </>
                      )}
                      <Link
                        href={`/dashboard/sites/${site.id}/edit`}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Edit site"
                        title="Edit site"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                    </span>
                    {flags.archive !== false && (
                    <button
                      type="button"
                      onClick={() => setArchive(site.id, !isArchived)}
                      disabled={!!archivingId}
                      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {archivingId === site.id
                        ? "…"
                        : isArchived
                          ? "Unarchive"
                          : "Archive"}
                    </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {filterSites(sites, flags.archive === false ? "all" : filter).length === 0 && (
            <p className="text-sm text-gray-500">
              {flags.archive !== false && filter === "active" && "No active sites."}
              {flags.archive !== false && filter === "archived" && "No archived sites."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
