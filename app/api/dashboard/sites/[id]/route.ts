import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
import { buildInitialDraftContent, isValidSlug } from "@/lib/templates";
import type { BusinessType, UpdateSiteDraftBody } from "@/lib/types/site";
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
  const currentCountry = body.country !== undefined
    ? (body.country === "" ? null : body.country)
    : (site.country ?? null);

  if (body.country !== undefined) {
    updates.country = body.country === "" ? null : body.country;
  }

  if (body.languages !== undefined) {
    const langs = Array.isArray(body.languages) ? body.languages.filter((l) => typeof l === "string" && l.trim()) : [];
    if (langs.length === 0) {
      return NextResponse.json(
        { error: "languages must be a non-empty array of locale codes" },
        { status: 422 }
      );
    }
    updates.languages = langs;
    const existing = (site.draft_content ?? {}) as Record<string, Record<string, unknown>>;
    const defaultContent = buildInitialDraftContent(langs, currentCountry ?? undefined);
    const newDraft: Record<string, Record<string, unknown>> = {};
    for (const locale of langs) {
      const def = defaultContent[locale as keyof typeof defaultContent];
      newDraft[locale] = existing[locale] ? { ...(def ?? {}), ...existing[locale] } : (def ?? {});
    }
    updates.draft_content = newDraft;
  }

  if (body.draft_content !== undefined) {
    const merged: Record<string, Record<string, unknown>> = {
      ...((updates.draft_content ?? site.draft_content) as Record<string, Record<string, unknown>>),
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
    } else if (!body.languages) {
      const primaryLocale = (updates.languages as string[])?.[0] ?? site.languages?.[0] ?? "en";
      const fromDraft = merged[primaryLocale]?.country ?? merged.en?.country;
      if (fromDraft !== undefined) updates.country = fromDraft === "" ? null : fromDraft;
    }
    updates.draft_content = merged;
    if (body.assistant_prefilled_fields === undefined) {
      const primaryLocale = (updates.languages as string[])?.[0] ?? site.languages?.[0] ?? "en";
      const localeContent = merged[primaryLocale] ?? merged.en;
      const prefilled = localeContent && typeof localeContent === "object" && Array.isArray((localeContent as Record<string, unknown>)._assistantPrefilledFields)
        ? ((localeContent as Record<string, unknown>)._assistantPrefilledFields as unknown[]).filter((k): k is string => typeof k === "string")
        : [];
      updates.assistant_prefilled_fields = prefilled;
    }
  } else if (body.country !== undefined && body.languages === undefined) {
    const countryValue = body.country === "" ? undefined : body.country;
    const merged: Record<string, Record<string, unknown>> = {
      ...(site.draft_content as Record<string, Record<string, unknown>>),
    };
    for (const locale of Object.keys(merged)) {
      merged[locale] = { ...(merged[locale] ?? {}), country: countryValue };
    }
    updates.draft_content = merged;
  }
  const validBusinessTypes: BusinessType[] = [
    "salon", "clinic", "repair", "tutor", "cafe", "local_service", "other",
  ];
  if (body.business_type !== undefined && validBusinessTypes.includes(body.business_type)) {
    updates.business_type = body.business_type;
  }
  if (typeof body.archived === "boolean") {
    updates.archived_at = body.archived ? new Date().toISOString() : null;
  }
  if (body.assistant_prefilled_fields !== undefined) {
    const raw = body.assistant_prefilled_fields;
    const arr = Array.isArray(raw) ? raw.filter((k): k is string => typeof k === "string") : [];
    updates.assistant_prefilled_fields = arr;
  }
  if (body.slug !== undefined) {
    if (site.published_at) {
      return NextResponse.json(
        { error: "Site name cannot be changed after publishing" },
        { status: 422 }
      );
    }
    const slug = String(body.slug).trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) {
      return NextResponse.json(
        { error: "Slug cannot be empty" },
        { status: 422 }
      );
    }
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug; use lowercase letters, numbers, hyphens only (2–64 characters)" },
        { status: 422 }
      );
    }
    if (slug !== site.slug) {
      const { data: existing } = await supabase
        .from("localed_sites")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "Slug already taken" },
          { status: 409 }
        );
      }
    }
    updates.slug = slug;
  }
  const { data: updated, error } = await supabase
    .from("localed_sites")
    .update(updates)
    .eq("id", id)
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
  return NextResponse.json(updated);
}
