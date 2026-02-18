import type { SupabaseClient } from "@supabase/supabase-js";

const ARTIFACT_PREFIX = "sites/";
const SUPABASE_BUCKET = "published-sites";

/**
 * Key prefix for a site's published files (e.g. "sites/abc-123/").
 */
export function getArtifactPathPrefix(siteId: string): string {
  return `${ARTIFACT_PREFIX}${siteId}/`;
}

const INDEX_KEY = "index.html";

const LOCAL_DIR_ENV = "PUBLISHED_SITES_LOCAL_DIR";
const DEFAULT_LOCAL_DIR = "public/published-sites";

function getLocalDir(): string {
  const raw =
    typeof process.env[LOCAL_DIR_ENV] === "string"
      ? process.env[LOCAL_DIR_ENV]!.trim()
      : "";
  const dir = raw || DEFAULT_LOCAL_DIR;
  return dir.startsWith("/") ? dir : `${process.cwd()}/${dir.replace(/^\.\//, "")}`;
}

/**
 * Upload published HTML to Supabase Storage (bucket: published-sites, path: sites/{siteId}/index.html).
 * Bucket must exist and be public.
 */
export async function uploadPublishedHtmlToSupabase(
  supabase: SupabaseClient,
  siteId: string,
  html: string
): Promise<boolean> {
  const path = `${ARTIFACT_PREFIX}${siteId}/${INDEX_KEY}`;
  const body =
    typeof Buffer !== "undefined"
      ? Buffer.from(html, "utf8")
      : new TextEncoder().encode(html);
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, body, {
    contentType: "text/html; charset=utf-8",
    upsert: true,
  });
  return !error;
}

/** True when Supabase is configured (URL set); then we never use local filesystem for publish. */
function isSupabaseConfigured(): boolean {
  const url =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
      : "";
  return url.length > 0;
}

/**
 * Upload published HTML to Supabase Storage or local folder (only when Supabase is not configured).
 * When NEXT_PUBLIC_SUPABASE_URL is set (local or production), we use Supabase Storage only; set SUPABASE_SERVICE_ROLE_KEY for uploads.
 */
export async function uploadPublishedHtml(
  siteId: string,
  html: string,
  supabase?: SupabaseClient | null
): Promise<boolean> {
  if (supabase) {
    return uploadPublishedHtmlToSupabase(supabase, siteId, html);
  }
  if (isSupabaseConfigured()) {
    return false;
  }
  try {
    const path = await import("path");
    const fs = await import("fs");
    const baseDir = getLocalDir();
    const siteDir = path.join(baseDir, "sites", siteId);
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, INDEX_KEY), html, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete published artifacts for a site from Supabase Storage.
 */
export async function deletePublishedArtifactsFromSupabase(
  supabase: SupabaseClient,
  siteId: string
): Promise<void> {
  const path = `${ARTIFACT_PREFIX}${siteId}/${INDEX_KEY}`;
  await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
}

/**
 * Delete all published artifacts for a site (Supabase Storage or local folder when Supabase not configured).
 */
export async function deletePublishedArtifacts(
  siteId: string,
  supabase?: SupabaseClient | null
): Promise<void> {
  if (supabase) {
    await deletePublishedArtifactsFromSupabase(supabase, siteId);
    return;
  }
  if (isSupabaseConfigured()) {
    return;
  }
  try {
    const path = await import("path");
    const fs = await import("fs");
    const siteDir = path.join(getLocalDir(), "sites", siteId);
    if (fs.existsSync(siteDir)) fs.rmSync(siteDir, { recursive: true });
  } catch {
    // Ignore local delete errors (e.g. dir missing)
  }
}

/**
 * Base URL for published site assets (Supabase Storage public URL from NEXT_PUBLIC_SUPABASE_URL, or PUBLISHED_SITES_CDN_URL if set).
 */
export function getPublishedCdnBaseUrl(): string {
  const raw =
    typeof process.env.PUBLISHED_SITES_CDN_URL === "string"
      ? process.env.PUBLISHED_SITES_CDN_URL.trim()
      : "";
  if (raw) return raw.replace(/\/$/, "");
  const supabaseUrl =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim().replace(/\/$/, "")
      : "";
  if (supabaseUrl) return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}`;
  return "";
}

/**
 * Full URL to the published site index (e.g. https://cdn.example.com/sites/abc-123/index.html).
 */
export function getPublishedSiteUrl(artifactPath: string): string {
  const base = getPublishedCdnBaseUrl();
  if (!base) return "";
  const path = artifactPath.startsWith("sites/") ? artifactPath : `sites/${artifactPath}`;
  const normalized = path.replace(/\/$/, "");
  return `${base}/${normalized}/${INDEX_KEY}`;
}
