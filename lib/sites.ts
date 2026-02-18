import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import type { LocaledSite } from "@/lib/types/site";

export type PublishedSiteRow = {
  id: string;
  slug: string;
  business_type: string;
  template_id: string;
  languages: string[];
  country?: string | null;
  published_content: Record<string, Record<string, unknown>> | null;
  published_artifact_path?: string | null;
  published_meta?: { title?: string; description?: string; ogImage?: string } | null;
};

/**
 * Load published site by slug for server-side render (e.g. /[siteSlug] page).
 * Archived sites return null so end users get 404.
 */
export async function getPublishedSiteBySlug(
  slug: string
): Promise<PublishedSiteRow | null> {
  const supabase = createSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("localed_sites")
    .select("id, slug, business_type, template_id, languages, country, published_content, published_artifact_path, published_meta")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .is("archived_at", null)
    .single();
  if (error || !data) return null;
  return data as PublishedSiteRow;
}

/**
 * Admin only: list sites (optionally only archived). Uses service role.
 */
export async function getSitesForAdmin(archivedOnly?: boolean): Promise<LocaledSite[]> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  let q = supabase
    .from("localed_sites")
    .select("*")
    .order("updated_at", { ascending: false });
  if (archivedOnly) q = q.not("archived_at", "is", null);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as LocaledSite[];
}

/**
 * Admin only: get site by id (including archived). Uses service role.
 */
export async function getSiteByIdForAdmin(id: string): Promise<LocaledSite | null> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("localed_sites")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as LocaledSite;
}

/**
 * Admin only: delete site permanently (cascade removes contact submissions). Uses service role.
 */
export async function deleteSiteForAdmin(id: string): Promise<boolean> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return false;
  const { error } = await supabase.from("localed_sites").delete().eq("id", id);
  return !error;
}
