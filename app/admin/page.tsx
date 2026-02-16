"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type FlagRow = { key: string; enabled: boolean; description?: string | null };

export default function AdminPage() {
  const [flags, setFlags] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setForbidden(false);
    fetch("/api/admin/features")
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true);
          return [];
        }
        if (!res.ok) return [];
        return res.json();
      })
      .then(setFlags)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(key: string, enabled: boolean) {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: enabled }),
      });
      if (res.ok) {
        const updated: FlagRow[] = await res.json();
        setFlags(updated);
      }
    } finally {
      setSavingKey(null);
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
          <p className="mt-1 text-sm">
            Add your user ID to <code className="rounded bg-amber-100 px-1">LOCALED_ADMIN_IDS</code> in
            .env.local to access this page.
          </p>
          <Link href="/dashboard" className="mt-3 inline-block text-sm underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-600 underline hover:text-gray-900">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Feature flags</h1>
        <Link
          href="/admin/sites"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Archived sites
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Toggle features for the whole app. Changes take effect immediately. Use &quot;Archived sites&quot; to view or delete archived sites.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Feature</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flags.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 font-mono text-sm text-gray-900">{row.key}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggle(row.key, !row.enabled)}
                    disabled={savingKey === row.key}
                    className={
                      row.enabled
                        ? "rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        : "rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    }
                  >
                    {savingKey === row.key ? "…" : row.enabled ? "On" : "Off"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {flags.length === 0 && !loading && (
        <p className="mt-4 text-sm text-gray-500">No feature flags found. Run the migration that creates localed_feature_flags.</p>
      )}
    </div>
  );
}
