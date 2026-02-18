import type { SupabaseClient } from "@supabase/supabase-js";

const ARTIFACT_PREFIX = "sites/";
const SUPABASE_BUCKET = "published-sites";

/**
 * Key prefix for a site's published files. With version, each publish gets a new path to avoid CDN serving stale content.
 * @param siteId - Site UUID
 * @param version - Optional version segment (e.g. from published_at); when set, path is sites/{id}/{version}/
 */
export function getArtifactPathPrefix(siteId: string, version?: string): string {
  if (version) return `${ARTIFACT_PREFIX}${siteId}/${version}/`;
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
 * Upload published HTML to Supabase Storage. With version, uses sites/{siteId}/{version}/index.html so each publish is a new object (avoids CDN stale cache).
 */
export async function uploadPublishedHtmlToSupabase(
  supabase: SupabaseClient,
  siteId: string,
  html: string,
  version?: string
): Promise<boolean> {
  const path = version
    ? `${ARTIFACT_PREFIX}${siteId}/${version}/${INDEX_KEY}`
    : `${ARTIFACT_PREFIX}${siteId}/${INDEX_KEY}`;
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
 * When version is provided, uses a versioned path so each publish is a new object (avoids CDN stale cache).
 */
export async function uploadPublishedHtml(
  siteId: string,
  html: string,
  supabase?: SupabaseClient | null,
  version?: string
): Promise<boolean> {
  if (supabase) {
    return uploadPublishedHtmlToSupabase(supabase, siteId, html, version);
  }
  if (isSupabaseConfigured()) {
    return false;
  }
  try {
    const path = await import("path");
    const fs = await import("fs");
    const baseDir = getLocalDir();
    const siteDir = version
      ? path.join(baseDir, "sites", siteId, version)
      : path.join(baseDir, "sites", siteId);
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(path.join(siteDir, INDEX_KEY), html, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete published artifacts for a site from Supabase Storage.
 * When artifactPath is provided (e.g. sites/id/version), removes that path; otherwise removes sites/{siteId}/index.html.
 */
export async function deletePublishedArtifactsFromSupabase(
  supabase: SupabaseClient,
  siteId: string,
  artifactPath?: string | null
): Promise<void> {
  const path = artifactPath
    ? `${artifactPath.replace(/\/$/, "")}/${INDEX_KEY}`
    : `${ARTIFACT_PREFIX}${siteId}/${INDEX_KEY}`;
  await supabase.storage.from(SUPABASE_BUCKET).remove([path]);
}

/**
 * Delete published artifacts for a site. When artifactPath is provided, removes that version only.
 */
export async function deletePublishedArtifacts(
  siteId: string,
  supabase?: SupabaseClient | null,
  artifactPath?: string | null
): Promise<void> {
  if (supabase) {
    await deletePublishedArtifactsFromSupabase(supabase, siteId, artifactPath);
    return;
  }
  if (isSupabaseConfigured()) {
    return;
  }
  try {
    const path = await import("path");
    const fs = await import("fs");
    const baseDir = getLocalDir();
    const toRemove = artifactPath
      ? path.join(baseDir, artifactPath)
      : path.join(baseDir, "sites", siteId);
    if (fs.existsSync(toRemove)) fs.rmSync(toRemove, { recursive: true });
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
