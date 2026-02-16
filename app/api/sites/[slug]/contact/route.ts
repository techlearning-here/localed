import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/contact-notification";

/** CONTACT-01: POST /api/sites/[slug]/contact — submit contact form (no auth). CONTACT-01.4: optional email to owner. */
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
    .select("id, published_content")
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

  const ownerEmail = getOwnerEmailFromContent(site.published_content);
  const siteName = getSiteNameFromContent(site.published_content);
  if (ownerEmail) {
    await sendContactNotification(
      ownerEmail,
      { name, email, message },
      siteName
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

function getOwnerEmailFromContent(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const locales = content as Record<string, Record<string, unknown>>;
  for (const locale of Object.values(locales)) {
    if (locale && typeof locale === "object" && typeof locale.email === "string" && locale.email.trim()) {
      return locale.email.trim();
    }
  }
  return null;
}

function getSiteNameFromContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const locales = content as Record<string, Record<string, unknown>>;
  for (const locale of Object.values(locales)) {
    if (locale && typeof locale === "object" && typeof locale.businessName === "string" && locale.businessName.trim()) {
      return locale.businessName.trim();
    }
  }
  return "";
}
