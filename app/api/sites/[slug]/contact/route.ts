import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

/** CONTACT-01: POST /api/sites/[slug]/contact — submit contact form (no auth) */
export async function POST(
  request: NextRequest,
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

  const { data: site } = await supabase
    .from("localed_sites")
    .select("id")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single();
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 422 }
    );
  }
  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing name, email, or message" },
      { status: 422 }
    );
  }

  const { error } = await supabase.from("localed_contact_submissions").insert({
    site_id: site.id,
    name,
    email,
    message,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
