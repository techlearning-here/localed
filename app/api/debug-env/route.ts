import { NextResponse } from "next/server";

/**
 * GET /api/debug-env — Returns whether key env vars are set (for deployment debugging).
 * Does not expose values. Remove or restrict in production once OAuth is integrated.
 */
export async function GET() {
  const vars: Record<string, boolean> = {
    LOCALED_DEV_OWNER_ID: !!process.env.LOCALED_DEV_OWNER_ID?.trim(),
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const allSet = Object.values(vars).every(Boolean);
  return NextResponse.json(
    { env: vars, dashboardReady: allSet },
    { status: 200 }
  );
}
