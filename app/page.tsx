import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">localed.info</h1>
      <p className="mt-2 text-gray-600">
        Simple web presence for small local businesses.
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
