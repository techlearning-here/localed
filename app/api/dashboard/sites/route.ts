import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
import { buildDraftContentFromTemplate, isValidSlug } from "@/lib/templates";
import { isTemplateValidForBusinessType } from "@/lib/template-catalog";
import type { CreateSiteBody } from "@/lib/types/site";

/** SITES-02: GET /api/dashboard/sites — list current owner's sites */
export async function GET() {
  const { client: supabase, userId: ownerId } = await getDashboardSupabase();
  if (!ownerId || !supabase) {
    return NextResponse.json(
      { error: "Unauthorized; sign in or in development set LOCALED_DEV_OWNER_ID and SUPABASE_SERVICE_ROLE_KEY" },
      { status: 401 }
    );
  }
  const { data, error } = await supabase
    .from("localed_sites")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

/** SITES-01: POST /api/dashboard/sites — create site */
export async function POST(request: NextRequest) {
  const { client: supabase, userId: ownerId } = await getDashboardSupabase();
  if (!ownerId || !supabase) {
    return NextResponse.json(
      { error: "Unauthorized; sign in or in development set LOCALED_DEV_OWNER_ID and SUPABASE_SERVICE_ROLE_KEY" },
      { status: 401 }
    );
  }
  let body: CreateSiteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 422 }
    );
  }
  const { business_type, slug, languages, country, template_id, draft_content: bodyDraft } = body;
  if (
    !business_type ||
    !slug ||
    !Array.isArray(languages) ||
    languages.length === 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid business_type, slug, or languages" },
      { status: 422 }
    );
  }
  if (!template_id || typeof template_id !== "string") {
    return NextResponse.json(
      { error: "Missing template_id" },
      { status: 422 }
    );
  }
  if (!isTemplateValidForBusinessType(template_id, business_type)) {
    return NextResponse.json(
      { error: "Invalid template_id for this business type" },
      { status: 422 }
    );
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Invalid slug; use lowercase letters, numbers, hyphens only" },
      { status: 422 }
    );
  }
  const draft_content =
    bodyDraft && typeof bodyDraft === "object"
      ? bodyDraft
      : buildDraftContentFromTemplate(template_id, languages, country);
  const plan = "free";

  const { data: existing } = await supabase
    .from("localed_sites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "Slug already taken" },
      { status: 409 }
    );
  }

  const insertPayload: Record<string, unknown> = {
    owner_id: ownerId,
    slug,
    business_type,
    template_id,
    plan,
    languages,
    draft_content,
    published_content: null,
    published_at: null,
  };
  if (country != null && String(country).trim() !== "") {
    insertPayload.country = String(country).trim();
  }

  const { data: site, error } = await supabase
    .from("localed_sites")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    const isSlugConflict =
      error.code === "23505" &&
      (error.message?.includes("localed_sites_slug") ||
        (typeof error.details === "string" && error.details.includes("localed_sites_slug")));
    if (isSlugConflict) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(site, { status: 201 });
}
