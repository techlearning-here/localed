import { NextRequest, NextResponse } from "next/server";
import { stripAssistantPrefilledFromDraft } from "@/lib/strip-assistant-prefilled";
import { getDashboardSupabase, getSupabaseServiceRole } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Dynamic imports to avoid pulling EJS and Node-only paths into the route bundle (fixes "handler is not a function" on Cloudflare Workers). */
async function loadPublishDeps() {
  const [buildModule, storageModule] = await Promise.all([
    import("@/lib/build-published-html"),
    import("@/lib/published-storage"),
  ]);
  return {
    buildPublishedPageHtmlFromSite: buildModule.buildPublishedPageHtmlFromSite,
    getArtifactPathPrefix: storageModule.getArtifactPathPrefix,
    getPublishedCdnBaseUrl: storageModule.getPublishedCdnBaseUrl,
    uploadPublishedHtml: storageModule.uploadPublishedHtml,
    deletePublishedArtifacts: storageModule.deletePublishedArtifacts,
  };
}

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
 * Builds static HTML from draft, uploads to Supabase Storage or local. Table stores path + meta; no full page in DB (recreate from draft_content).
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

  const {
    buildPublishedPageHtmlFromSite,
    getArtifactPathPrefix,
    getPublishedCdnBaseUrl,
    uploadPublishedHtml,
    deletePublishedArtifacts,
  } = await loadPublishDeps();

  let html: string;
  let meta: { title?: string; description?: string; ogImage?: string };
  try {
    const built = buildPublishedPageHtmlFromSite(site, SITE_BASE_URL);
    html = built.html;
    meta = built.meta;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Build failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const published_at = new Date().toISOString();
  const version = published_at.replace(/[:.]/g, "-");
  const supabaseForStorage = getSupabaseServiceRole() ?? undefined;
  const uploaded = await uploadPublishedHtml(id, html, supabaseForStorage, version);
  const cdnBaseUrl = getPublishedCdnBaseUrl();
  if (cdnBaseUrl && !uploaded) {
    return NextResponse.json(
      {
        error:
          "Publish to storage failed. Set SUPABASE_SERVICE_ROLE_KEY (and ensure the published-sites bucket exists and is public).",
      },
      { status: 500 }
    );
  }

  if (uploaded && cdnBaseUrl) {
    const artifactPath = getArtifactPathPrefix(id, version).replace(/\/$/, "");
    const oldArtifactPath = (site.published_artifact_path ?? "").trim() || null;
    const artifactUpdatePayload = {
      published_at,
      updated_at: published_at,
      published_content: null,
      published_artifact_path: artifactPath,
      published_meta: meta,
    };
    const { data: updatedWithArtifact, error: artifactError } = await supabase
      .from("localed_sites")
      .update(artifactUpdatePayload)
      .eq("id", id)
      .select()
      .single();
    if (!artifactError) {
      if (oldArtifactPath && oldArtifactPath !== artifactPath) {
        await deletePublishedArtifacts(id, supabaseForStorage, oldArtifactPath);
      }
      return NextResponse.json(updatedWithArtifact);
    }
    // Fallback: table may lack published_artifact_path / published_meta (migration not run); store in published_content
  }

  /** Strip editor-only metadata (e.g. assistant-prefilled field list) before storing published snapshot. */
  const published_content = stripAssistantPrefilledFromDraft(site.draft_content);
  const fallbackPayload = {
    published_content,
    published_at,
    updated_at: published_at,
  };
  const { data: updated, error } = await supabase
    .from("localed_sites")
    .update(fallbackPayload)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json(
      { error: error.message || "Database update failed" },
      { status: 500 }
    );
  }
  return NextResponse.json(updated);
}
