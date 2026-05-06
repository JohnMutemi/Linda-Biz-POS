"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useDashboard } from "@/components/dashboard/dashboard-provider"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useDashboard()

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
      <AdminSidebar />
      <div className="flex-1 lg:pl-72 relative z-10">
        <header className="sticky top-0 z-30 border-b border-emerald-200 bg-white/90 px-4 py-3 backdrop-blur-md shadow-sm sm:px-6 lg:px-8">
          <p className="text-sm text-emerald-700">Welcome, {user?.name ?? "Admin"} to LindaBiz Admin</p>
        </header>
        {children}
      </div>
    </div>
  )
}
