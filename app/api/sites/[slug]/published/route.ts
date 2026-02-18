import { NextRequest, NextResponse } from "next/server";
import { getPublishedSiteUrl } from "@/lib/published-storage";
import { getPublishedSiteBySlug } from "@/lib/sites";

/**
 * GET /api/sites/[slug]/published
 * Proxies the published static HTML from storage with Content-Type: text/html; charset=utf-8
 * so the browser renders it (iframe or direct) instead of showing raw code.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const site = await getPublishedSiteBySlug(slug);
  if (!site?.published_artifact_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const cdnUrl = getPublishedSiteUrl(site.published_artifact_path);
  if (!cdnUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const res = await fetch(cdnUrl, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to load published site" }, { status: 502 });
  }
  const html = await res.text();
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
