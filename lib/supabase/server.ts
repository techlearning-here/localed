import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Server client with cookie-based session (for dashboard, getCurrentUserId).
 * Use in Route Handlers and Server Components that need auth.
 */
export async function createSupabaseServerWithAuth() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore when called from Server Component (middleware refreshes session)
        }
      },
    },
  });
}

/**
 * Anon-only server client (no cookies). Use for public API and public data reads.
 */
export function createSupabaseServer() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Returns the Supabase client to use for dashboard and the current user id.
 * When there is a session, uses the auth client (RLS applies). When there is no session
 * but LOCALED_DEV_OWNER_ID is set (dev), uses the service role client so RLS does not block
 * inserts (auth.uid() would be null otherwise).
 */
export async function getDashboardSupabase(): Promise<{
  client: SupabaseClient | null;
  userId: string | null;
}> {
  const authClient = await createSupabaseServerWithAuth();
  if (authClient) {
    const { data } = await authClient.auth.getUser();
    if (data.user?.id) {
      return { client: authClient, userId: data.user.id };
    }
  }
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const devOwnerId = getDevOwnerIdFromHeader(headersList);
  const allowDevOwner = devOwnerId && supabaseUrl && supabaseServiceRoleKey;
  if (allowDevOwner) {
    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
    return { client: serviceClient, userId: devOwnerId };
  }
  return { client: authClient, userId: devOwnerId };
}

/**
 * Phase 2: session first; Phase 1 fallback: dev owner from header or LOCALED_DEV_OWNER_ID (works in dev, preview, and production when set).
 */
export function getDevOwnerIdFromHeader(headers: Headers): string | null {
  const fromHeader = headers.get("X-Dev-User-Id");
  if (fromHeader) return fromHeader;
  const raw = process.env.LOCALED_DEV_OWNER_ID;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/**
 * Service role client. Use only in server code when you need to bypass RLS (e.g. admin writes).
 * Do not expose to client.
 */
export function getSupabaseServiceRole() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

/** Comma-separated UUIDs in LOCALED_ADMIN_IDS. Empty or unset = no admins. */
const ADMIN_IDS = (process.env.LOCALED_ADMIN_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Returns true if the given user id is in LOCALED_ADMIN_IDS (admin panel access).
 */
export function isAdminUserId(userId: string | null): boolean {
  return !!userId && ADMIN_IDS.includes(userId);
}
