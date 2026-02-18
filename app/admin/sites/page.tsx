"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LocaledSite } from "@/lib/types/site";

export default function AdminSitesPage() {
  const [sites, setSites] = useState<LocaledSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [archivedOnly, setArchivedOnly] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<LocaledSite | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setForbidden(false);
    const q = archivedOnly ? "?archived=true" : "";
    fetch(`/api/admin/sites${q}`)
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return [];
        }
        if (!res.ok) return [];
        return res.json();
      })
      .then(setSites)
      .finally(() => setLoading(false));
  }, [archivedOnly]);

  useEffect(() => {
    load();
  }, [load]);

  function openDeleteConfirm(site: LocaledSite) {
    setSiteToDelete(site);
  }

  function closeDeleteConfirm() {
    if (!deletingId) setSiteToDelete(null);
  }

  async function confirmDelete() {
    if (!siteToDelete) return;
    setDeletingId(siteToDelete.id);
    try {
      const res = await fetch(`/api/admin/sites/${siteToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.id !== siteToDelete.id));
        setSiteToDelete(null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-medium">Admin access required</p>
          <Link href="/admin" className="mt-2 inline-block text-sm underline">
            ← Back to admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setArchivedOnly(true)}
            className={
              archivedOnly
                ? "rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            }
          >
            Archived only
          </button>
          <button
            type="button"
            onClick={() => setArchivedOnly(false)}
            className={
              !archivedOnly
                ? "rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            }
          >
            All sites
          </button>
        </div>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Only admins can view archived sites here. End users get 404 on archived slugs. Delete removes the site and its data permanently.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Owner</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sites.map((site) => {
              const locale = site.languages?.[0] ?? "en";
              const content = site.draft_content?.[locale] ?? site.draft_content?.en ?? {};
              const name = (content.businessName as string) || site.slug || "—";
              const isArchived = !!site.archived_at;
              return (
                <tr key={site.id}>
                  <td className="px-4 py-3 font-mono text-sm text-gray-900">{site.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-[120px]" title={site.owner_id}>
                    {site.owner_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {site.published_at && !isArchived ? (
                      <span className="text-green-600">Published</span>
                    ) : isArchived ? (
                      <span className="text-amber-600">Unpublished</span>
                    ) : (
                      <span className="text-gray-500">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/sites/${site.id}/view`}
                      className="mr-2 text-sm text-gray-600 underline hover:text-gray-900"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => openDeleteConfirm(site)}
                      disabled={deletingId === site.id}
                      className="text-sm text-red-600 underline hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === site.id ? "…" : "Delete forever"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sites.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          {archivedOnly ? "No archived sites." : "No sites."}
        </p>
      )}

      {siteToDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={closeDeleteConfirm}
        >
          <div
            className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
              Delete site?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Delete &quot;{siteToDelete.slug}&quot; forever? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                disabled={!!deletingId}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!!deletingId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === siteToDelete.id ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
