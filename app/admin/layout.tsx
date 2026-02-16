"use client";

import { DashboardSidebar } from "@/app/dashboard/dashboard-sidebar";
import { AdminSubSidebar } from "./admin-sub-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <AdminSubSidebar />
        <main className="min-w-0 flex-1 lg:max-w-4xl lg:px-8 lg:py-8">
          <div className="px-4 py-6 lg:px-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
