import Link from "next/link";
import { headers } from "next/headers";

/** Always run on server so we read current env and host. */
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const raw = process.env.LOCALED_DEV_OWNER_ID;
  const devOwnerConfigured = typeof raw === "string" && raw.trim().length > 0;
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalhost = host.includes("localhost");

  const isProduction = !isLocalhost;
  const showDevOwnerFlow = !isProduction || devOwnerConfigured;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-bold text-gray-900">
          localed.info
        </h1>
        {showDevOwnerFlow ? (
          <>
            <p className="mt-2 text-center text-sm text-gray-600">
              {devOwnerConfigured
                ? "You're set up. No sign-in required."
                : "Development: use the dashboard with your dev owner ID."}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to dashboard
            </Link>
            {!devOwnerConfigured && (
              <p className="mt-6 text-center text-xs text-gray-500">
                Set <code className="rounded bg-gray-100 px-1">LOCALED_DEV_OWNER_ID</code> in{" "}
                <code className="rounded bg-gray-100 px-1">.env.local</code> to a user UUID from
                Supabase Auth → Users. No sign-in required during development. Google OAuth will
                be added later.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access the dashboard. Google OAuth will be added soon.
            </p>
            <p className="mt-4 text-center text-xs text-gray-500">
              Once signed in, you can open the dashboard from the home page.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
