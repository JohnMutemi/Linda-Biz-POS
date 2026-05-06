"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"
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
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>
      <AdminSidebar />
      <div className="flex-1 lg:pl-72 relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/40 bg-white/65 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LindaBizLogo compact href="/admin" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Admin Console</p>
              <p className="text-xs text-slate-600 truncate">{user?.businessName ?? "LindaBiz"}</p>
            </div>
          </div>
        </header>
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/40 bg-white/55 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.45)] ring-1 ring-emerald-100/60 backdrop-blur-xl">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
