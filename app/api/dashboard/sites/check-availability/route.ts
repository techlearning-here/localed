import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase } from "@/lib/supabase/server";
import { isValidSlug } from "@/lib/templates";

/**
 * GET /api/dashboard/sites/check-availability?slug=xxx
 * Returns whether the site name (slug) is available: valid format and not already taken.
 */
export async function GET(request: NextRequest) {
  const { client: supabase, userId: ownerId } = await getDashboardSupabase();
  if (!ownerId || !supabase) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("slug") ?? "";
  const slug = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug) {
    return NextResponse.json(
      { available: false, message: "Enter a site name" },
      { status: 200 }
    );
  }
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { available: false, message: "Use only lowercase letters, numbers, and hyphens (2–64 characters)" },
      { status: 200 }
    );
  }
  const excludeSiteId = searchParams.get("excludeSiteId")?.trim() || null;
  const { data: existing } = await supabase
    .from("localed_sites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const isAvailable = !existing || (excludeSiteId !== null && existing.id === excludeSiteId);
  return NextResponse.json({
    available: isAvailable,
    message: isAvailable ? "Available" : "This name is already taken",
  });
}
