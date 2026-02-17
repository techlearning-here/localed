import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">localed.info</h1>
      <p className="mt-2 text-gray-600">
        Simple web presence for small local businesses.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Development: use the dashboard with your dev owner ID. Set{" "}
        <code className="rounded bg-gray-100 px-1">LOCALED_DEV_OWNER_ID</code> in{" "}
        <code className="rounded bg-gray-100 px-1">.env.local</code> to a user UUID from
        Supabase Auth → Users. No sign-in required during development. Google OAuth will be
        added later.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
