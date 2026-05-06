"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardThemeProvider, useDashboardTheme } from "@/components/dashboard/dashboard-theme-provider"
import { cn } from "@/lib/utils"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useDashboardTheme()

  return (
    <div className="flex min-h-screen relative">
      <div className={cn("fixed inset-0 -z-10", t.pageBg)} />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full blur-3xl",
            t.orb1,
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full blur-3xl",
            t.orb2,
          )}
        />
      </div>
      <Sidebar />
      <div className="flex-1 lg:pl-72 relative z-10 pt-16 lg:pt-0">{children}</div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardThemeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DashboardThemeProvider>
  )
}
