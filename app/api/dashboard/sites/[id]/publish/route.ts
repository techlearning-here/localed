import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
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

/**
 * SITES-05: POST /api/dashboard/sites/[id]/publish
 * Copies draft to published. Public URL is /{site.slug} (the site name the user set in the editor).
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
  const published_content = site.draft_content;
  const published_at = new Date().toISOString();
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
