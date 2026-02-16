import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/lib/features";

/**
 * Public API: returns current feature flags (key -> enabled).
 * Used by the app to show/hide features.
 */
export async function GET() {
  const flags = await getFeatureFlags();
  return NextResponse.json(flags);
}
