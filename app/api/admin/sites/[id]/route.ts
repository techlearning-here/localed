import { NextRequest, NextResponse } from "next/server";
import { deletePublishedArtifacts } from "@/lib/published-storage";
import { getDashboardSupabase, isAdminUserId } from "@/lib/supabase/server";
import { getSupabaseServiceRole } from "@/lib/supabase/server";
import { getSiteByIdForAdmin, deleteSiteForAdmin } from "@/lib/sites";

/**
 * GET /api/admin/sites/[id] — get site by id including archived (admin only).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await getDashboardSupabase();
  if (!isAdminUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const site = await getSiteByIdForAdmin(id);
  if (!site) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(site);
}

/**
 * DELETE /api/admin/sites/[id] — delete site permanently (admin only).
 * Removes published static files from Supabase Storage (or local), then deletes DB row.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await getDashboardSupabase();
  if (!isAdminUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const supabase = getSupabaseServiceRole();
  await deletePublishedArtifacts(id, supabase ?? undefined);
  const ok = await deleteSiteForAdmin(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
