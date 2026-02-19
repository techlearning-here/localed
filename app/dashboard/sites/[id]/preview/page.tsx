"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SinglePageSiteView } from "@/components/single-page-site-view";
import type { LocaledSite } from "@/lib/types/site";
import { parseSiteContentForDisplay } from "@/lib/parse-site-content";
import { getLayoutIdForTemplate } from "@/lib/template-catalog";

export default function PreviewSitePage() {
  const params = useParams();
  const id = params.id as string;
  const [site, setSite] = useState<LocaledSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/sites/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setSite)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading preview…</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">Site not found</p>
      </div>
    );
  }

  const locale = site.languages?.[0] ?? "en";
  const content = (site.draft_content?.[locale] ?? site.draft_content?.en ?? {}) as Record<string, unknown>;
  const parsed = parseSiteContentForDisplay(content, {
    slug: site.slug ?? "preview",
    business_type: site.business_type ?? undefined,
    country: site.country ?? undefined,
  });

  const layoutId = getLayoutIdForTemplate(site.template_id ?? "");
  return (
    <SinglePageSiteView
      parsed={parsed}
      siteSlug={site.slug ?? "preview"}
      layoutId={layoutId}
      previewBanner={
        <div className="border-b border-amber-400 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Preview — draft content only. Publish to go live.
        </div>
      }
    />
  );
}
