import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * R2-compatible bucket interface for published site files (no Cloudflare types dependency).
 */
export type PublishedSitesBucket = {
  put(
    key: string,
    value: string | ReadableStream | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  list(options?: {
    prefix?: string;
    cursor?: string;
  }): Promise<{
    objects: { key: string }[];
    truncated?: boolean;
    cursor?: string;
  }>;
  delete(keys: string | string[]): Promise<void>;
};

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
 * Use when R2 is not available (e.g. no credit card for Cloudflare). Bucket must exist and be public.
 */
export async function uploadPublishedHtmlToSupabase(
  supabase: SupabaseClient,
  siteId: string,
  html: string
): Promise<boolean> {
  const path = `${ARTIFACT_PREFIX}${siteId}/${INDEX_KEY}`;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, html, {
    contentType: "text/html; charset=utf-8",
    upsert: true,
  });
  return !error;
}

/**
 * Upload published HTML to R2, Supabase Storage, or local folder (in that order when available).
 * Local: writes to PUBLISHED_SITES_LOCAL_DIR (default public/published-sites)/sites/{siteId}/index.html.
 */
export async function uploadPublishedHtml(
  bucket: PublishedSitesBucket | undefined,
  siteId: string,
  html: string,
  supabase?: SupabaseClient | null
): Promise<boolean> {
  if (bucket) {
    const prefix = getArtifactPathPrefix(siteId);
    const key = `${prefix}${INDEX_KEY}`;
    await bucket.put(key, html, {
      httpMetadata: { contentType: "text/html; charset=utf-8" },
    });
    return true;
  }
  if (supabase) {
    return uploadPublishedHtmlToSupabase(supabase, siteId, html);
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
 * Delete all published artifacts for a site (R2, Supabase Storage, or local folder).
 */
export async function deletePublishedArtifacts(
  bucket: PublishedSitesBucket | undefined,
  siteId: string,
  supabase?: SupabaseClient | null
): Promise<void> {
  if (bucket) {
    const prefix = getArtifactPathPrefix(siteId);
    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const result = await bucket.list({ prefix, cursor });
      keys.push(...result.objects.map((o) => o.key));
      cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);
    if (keys.length > 0) await bucket.delete(keys);
    return;
  }
  if (supabase) {
    await deletePublishedArtifactsFromSupabase(supabase, siteId);
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
 * Base URL for published site assets.
 * Uses PUBLISHED_SITES_CDN_URL if set (R2 or custom); otherwise Supabase Storage public URL when NEXT_PUBLIC_SUPABASE_URL is set.
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
