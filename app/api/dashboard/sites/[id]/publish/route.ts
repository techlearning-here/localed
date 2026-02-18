import { NextRequest, NextResponse } from "next/server";
import { buildPublishedPageHtmlFromSite } from "@/lib/build-published-html";
import {
  getArtifactPathPrefix,
  getPublishedCdnBaseUrl,
  uploadPublishedHtml,
} from "@/lib/published-storage";
import type { PublishedSitesBucket } from "@/lib/published-storage";
import { getDashboardSupabase, getSupabaseServiceRole } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getSiteAndCheckOwner(
  supabase: SupabaseClient | null,
  siteId: string,
  ownerId: string
) {
  if (!supabase) return { site: null, error: { message: "No client" } };
  const { data, error } = await supabase
    .from("localed_sites")
    .select("*")
    .eq("id", siteId)
    .single();
  if (error || !data) return { site: null, error };
  if (data.owner_id !== ownerId) {
    return { site: null, error: { message: "Forbidden" } };
  }
  return { site: data, error: null };
}

const SITE_BASE_URL =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
  process.env.NEXT_PUBLIC_SITE_URL.trim()
    ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "")
    : "https://localed.info";

/**
 * SITES-05: POST /api/dashboard/sites/[id]/publish
 * Builds static HTML from draft, uploads to R2, Supabase Storage, or local. Table stores path + meta; no full page in DB (recreate from draft_content).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { client: supabase, userId: ownerId } = await getDashboardSupabase();
  if (!ownerId || !supabase) {
    return NextResponse.json(
      { error: "Unauthorized; sign in or in development set LOCALED_DEV_OWNER_ID and SUPABASE_SERVICE_ROLE_KEY" },
      { status: 401 }
    );
  }
  const { id } = await params;
  const { site, error: fetchError } = await getSiteAndCheckOwner(
    supabase,
    id,
    ownerId
  );
  if (fetchError && !site) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: fetchError.message === "Forbidden" ? 403 : 404 }
    );
  }

  const { html, meta } = buildPublishedPageHtmlFromSite(site, SITE_BASE_URL);

  let bucket: PublishedSitesBucket | undefined;
  try {
    const mod = await import("@opennextjs/cloudflare");
    const ctx = mod.getCloudflareContext?.();
    bucket = (ctx?.env as { PUBLISHED_SITES?: PublishedSitesBucket } | undefined)?.PUBLISHED_SITES;
  } catch {
    bucket = undefined;
  }

  const supabaseForStorage = bucket ? undefined : getSupabaseServiceRole() ?? undefined;
  const uploaded = await uploadPublishedHtml(bucket, id, html, supabaseForStorage);
  const published_at = new Date().toISOString();

  if (uploaded && getPublishedCdnBaseUrl()) {
    const artifactPath = getArtifactPathPrefix(id).replace(/\/$/, "");
    const updatePayload = {
      published_at,
      updated_at: published_at,
      published_content: null,
      published_artifact_path: artifactPath,
      published_meta: meta,
    };
    const { data: updated, error } = await supabase
      .from("localed_sites")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(updated);
  }

  const published_content = site.draft_content;
  const updatePayload = {
    published_content,
    published_at,
    updated_at: published_at,
  };
  const { data: updated, error } = await supabase
    .from("localed_sites")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(updated);
}
