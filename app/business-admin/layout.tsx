"use client"

import "./owner-admin-theme.css"
import "./owner-admin-surface.css"

import type React from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { OwnerAdminSidebar } from "@/components/dashboard/owner-admin-sidebar"
import { businessAdminTheme as t } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

const AUTH_ROUTES = new Set(["/business-admin/login", "/business-admin/reset-password"])

export default function BusinessAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.has(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen" data-owner-admin-root>
      <div className={cn("absolute inset-0 -z-10", t.pageBg)} />
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={cn("absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full blur-3xl", t.blobPrimary)} />
        <div className={cn("absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full blur-3xl", t.blobSecondary)} />
        <div className={cn("absolute right-[20%] top-[35%] hidden h-[420px] w-[420px] rounded-full blur-3xl xl:block", t.blobAccent)} />
      </div>

      <Suspense fallback={null}>
        <OwnerAdminSidebar />
      </Suspense>

      <div
        className="relative z-10 min-w-0 flex-1 pl-16 pt-[calc(max(4rem,env(safe-area-inset-top))+4.5rem)] sm:pt-[calc(max(4rem,env(safe-area-inset-top))+4rem)] lg:pl-72 lg:pt-0 xl:pl-80"
        data-owner-admin-panel
      >
        {children}
      </div>
    </div>
  )
}
