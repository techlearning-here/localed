import { createSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseServiceRole } from "@/lib/supabase/server";

export type FeatureFlags = Record<string, boolean>;

/**
 * Fetch current feature flags (public read). Uses anon client; RLS allows select.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const supabase = createSupabaseServer();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("localed_feature_flags")
    .select("key, enabled");
  if (error || !data) return {};
  const flags: FeatureFlags = {};
  for (const row of data) {
    flags[row.key] = !!row.enabled;
  }
  return flags;
}

type FlagRow = { key: string; enabled: boolean; description?: string | null };

/**
 * Update feature flags. Call only from admin API with service role; no RLS policy for update.
 * Returns full list for admin UI.
 */
export async function updateFeatureFlags(updates: FeatureFlags): Promise<FlagRow[]> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  for (const [key, enabled] of Object.entries(updates)) {
    await supabase
      .from("localed_feature_flags")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("key", key);
  }
  return getFeatureFlagsForAdmin();
}

/**
 * Fetch all rows (key, enabled, description) for admin UI. Uses service role so we get full list.
 */
export async function getFeatureFlagsForAdmin(): Promise<FlagRow[]> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("localed_feature_flags")
    .select("key, enabled, description")
    .order("key");
  if (error || !data) return [];
  return data as FlagRow[];
}
