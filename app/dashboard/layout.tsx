"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>
      <Sidebar />
      <div className="relative z-10 flex-1 pt-[max(4rem,env(safe-area-inset-top))] lg:pl-72 lg:pt-0">{children}</div>
    </div>
  )
}
