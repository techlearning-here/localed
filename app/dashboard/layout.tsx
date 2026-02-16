"use client";

import { usePathname } from "next/navigation";
import { DashboardFeaturesProvider } from "./features-context";
import { DashboardSidebar } from "./dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPreview = pathname?.includes("/preview") ?? false;

  if (isPreview) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <DashboardFeaturesProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <main className="min-w-0 flex-1 lg:max-w-4xl lg:px-8 lg:py-8">
            <div className="px-4 py-6 lg:px-0">{children}</div>
          </main>
        </div>
      </div>
    </DashboardFeaturesProvider>
  );
}
