import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getSiteAndCheckOwner(
  supabase: SupabaseClient | null,
  siteId: string,
  ownerId: string
): Promise<{ site: { id: string } | null; error: { message: string } | null }> {
  if (!supabase) return { site: null, error: { message: "No client" } };
  const { data, error } = await supabase
    .from("localed_sites")
    .select("id, owner_id")
    .eq("id", siteId)
    .single();
  if (error || !data) return { site: null, error: error ?? { message: "Not found" } };
  if (data.owner_id !== ownerId) {
    return { site: null, error: { message: "Forbidden" } };
  }
  return { site: { id: data.id }, error: null };
}

/** CONTACT-03: GET /api/dashboard/sites/[id]/submissions — list contact submissions for site (owner only). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { client: supabase, userId: ownerId } = await getDashboardSupabase();
  if (!ownerId || !supabase) {
    return NextResponse.json(
      {
        error:
          "Unauthorized; sign in or in development set LOCALED_DEV_OWNER_ID and SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 401 }
    );
  }
  const { id } = await params;
  const { site, error } = await getSiteAndCheckOwner(supabase, id, ownerId);
  if (error && !site) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 404 }
    );
  }
  const { data, error: fetchError } = await supabase
    .from("localed_contact_submissions")
    .select("id, site_id, name, email, message, created_at")
    .eq("site_id", site!.id)
    .order("created_at", { ascending: false });
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}
