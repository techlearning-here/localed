import { headers } from "next/headers";
import {
  createSupabaseServerWithAuth,
  getDevOwnerIdFromHeader,
} from "@/lib/supabase/server";

/**
 * Returns current user id from Supabase session, or (in development only) dev owner from
 * X-Dev-User-Id header or LOCALED_DEV_OWNER_ID env. Null when unauthorized.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const authClient = await createSupabaseServerWithAuth();
  if (authClient) {
    const { data } = await authClient.auth.getUser();
    if (data.user?.id) return data.user.id;
  }
  const headersList = await headers();
  return getDevOwnerIdFromHeader(headersList);
}
