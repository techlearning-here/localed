import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
import type { UpdateSiteDraftBody } from "@/lib/types/site";
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

/** SITES-03: GET /api/dashboard/sites/[id] */
export async function GET(
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
  const { site, error } = await getSiteAndCheckOwner(supabase, id, ownerId);
  if (error && !site) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 404 }
    );
  }
  return NextResponse.json(site);
}

/** SITES-04: PATCH /api/dashboard/sites/[id] — update draft */
export async function PATCH(
  request: NextRequest,
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
  let body: UpdateSiteDraftBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 422 });
  }
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.country !== undefined) {
    updates.country = body.country === "" ? null : body.country;
  }
  if (body.draft_content !== undefined) {
    const merged: Record<string, Record<string, unknown>> = {
      ...(site.draft_content as Record<string, Record<string, unknown>>),
    };
    for (const [locale, localeContent] of Object.entries(body.draft_content)) {
      if (localeContent && typeof localeContent === "object") {
        merged[locale] = {
          ...(merged[locale] ?? {}),
          ...localeContent,
        };
      }
    }
    if (body.country !== undefined) {
      const countryValue = body.country === "" ? undefined : body.country;
      for (const locale of Object.keys(merged)) {
        merged[locale] = { ...merged[locale], country: countryValue };
      }
      updates.country = countryValue ?? null;
    } else {
      const primaryLocale = site.languages?.[0] ?? "en";
      const fromDraft = merged[primaryLocale]?.country ?? merged.en?.country;
      if (fromDraft !== undefined) updates.country = fromDraft === "" ? null : fromDraft;
    }
    updates.draft_content = merged;
  } else if (body.country !== undefined) {
    const countryValue = body.country === "" ? undefined : body.country;
    const merged: Record<string, Record<string, unknown>> = {
      ...(site.draft_content as Record<string, Record<string, unknown>>),
    };
    for (const locale of Object.keys(merged)) {
      merged[locale] = { ...(merged[locale] ?? {}), country: countryValue };
    }
    updates.draft_content = merged;
  }
  if (typeof body.archived === "boolean") {
    updates.archived_at = body.archived ? new Date().toISOString() : null;
  }
  const { data: updated, error } = await supabase
    .from("localed_sites")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(updated);
}
