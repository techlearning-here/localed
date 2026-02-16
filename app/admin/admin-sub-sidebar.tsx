"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "Feature flags" },
  { href: "/admin/sites", label: "Sites" },
] as const;

export function AdminSubSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 bg-white py-4">
      <nav className="flex flex-col gap-0.5 px-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Admin
        </p>
        {ADMIN_NAV.map(({ href, label }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(href) ?? false;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
