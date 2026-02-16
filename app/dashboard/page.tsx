"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LocaledSite } from "@/lib/types/site";

type FilterKind = "all" | "active" | "archived";

function filterSites(sites: LocaledSite[], filter: FilterKind): LocaledSite[] {
  if (filter === "active") return sites.filter((s) => !s.archived_at);
  if (filter === "archived") return sites.filter((s) => !!s.archived_at);
  return sites;
}

type FeatureFlags = Record<string, boolean>;

export default function DashboardPage() {
  const [sites, setSites] = useState<LocaledSite[]>([]);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const loadSites = useCallback(() => {
    fetch("/api/dashboard/sites")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Not authorized" : "Failed to load");
        return res.json();
      })
      .then(setSites)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

  useEffect(() => {
    fetch("/api/features")
      .then((res) => (res.ok ? res.json() : {}))
      .then(setFlags)
      .catch(() => setFlags({}));
  }, []);

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
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My sites</h1>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Admin
          </Link>
          <Link
            href="/dashboard/sites/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create site
          </Link>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">You don’t have any sites yet.</p>
          <Link
            href="/dashboard/sites/new"
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
                          {site.published_at ? (
                            <span className="ml-2 text-green-600">Published</span>
                          ) : (
                            <span className="ml-2 text-amber-600">Draft</span>
                          )}
                          {flags.archive !== false && isArchived && (
                            <span className="ml-2 text-gray-500">Archived</span>
                          )}
                        </p>
                      </div>
                    </Link>
                    <span className="text-gray-400">
                      <Link
                        href={`/dashboard/sites/${site.id}/edit`}
                        className="hover:text-gray-600"
                      >
                        Edit →
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
