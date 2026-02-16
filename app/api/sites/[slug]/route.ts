import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * PUBLIC-01: GET /api/sites/[slug] — returns published site content (no auth).
 * 404 if slug not found or site not published.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }
  const { slug } = await params;
  const { data, error } = await supabase
    .from("localed_sites")
    .select("id, slug, business_type, template_id, languages, published_content")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single();
  if (error || !data) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    business_type: data.business_type,
    template_id: data.template_id,
    languages: data.languages,
    content: data.published_content,
  });
}
