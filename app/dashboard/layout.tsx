"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>
      <Sidebar />
      <div className="flex-1 lg:pl-72 relative z-10 pt-[max(4rem,env(safe-area-inset-top))] lg:pt-0">{children}</div>
    </div>
  )
}
