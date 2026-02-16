import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase, isAdminUserId } from "@/lib/supabase/server";
import { getSitesForAdmin } from "@/lib/sites";

/**
 * GET /api/admin/sites — list all sites (admin only). Query ?archived=true for archived only.
 */
export async function GET(request: NextRequest) {
  const { userId } = await getDashboardSupabase();
  if (!isAdminUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const archivedOnly = searchParams.get("archived") === "true";
  const sites = await getSitesForAdmin(archivedOnly);
  return NextResponse.json(sites);
}
