import { NextRequest, NextResponse } from "next/server";
import { getDashboardSupabase, isAdminUserId } from "@/lib/supabase/server";
import {
  getFeatureFlagsForAdmin,
  updateFeatureFlags,
  type FeatureFlags,
} from "@/lib/features";

/**
 * GET /api/admin/features — list all flags (key, enabled, description). Admin only.
 */
export async function GET() {
  const { userId } = await getDashboardSupabase();
  if (!isAdminUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const flags = await getFeatureFlagsForAdmin();
  return NextResponse.json(flags);
}

/**
 * PATCH /api/admin/features — update flags. Body: { "key": boolean, ... }. Admin only.
 */
export async function PATCH(request: NextRequest) {
  const { userId } = await getDashboardSupabase();
  if (!isAdminUserId(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: FeatureFlags;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 422 });
  }
  const updates: FeatureFlags = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "boolean") updates[key] = value;
  }
  const updated = await updateFeatureFlags(updates);
  return NextResponse.json(updated);
}
