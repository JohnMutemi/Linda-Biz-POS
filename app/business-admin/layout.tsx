"use client"

import type React from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { OwnerAdminSidebar } from "@/components/dashboard/owner-admin-sidebar"

const AUTH_ROUTES = new Set(["/business-admin/login", "/business-admin/reset-password"])

export default function BusinessAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.has(pathname)

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen overflow-x-clip">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" />
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <Suspense fallback={null}>
        <OwnerAdminSidebar />
      </Suspense>

      <div className="relative z-10 flex-1 pl-16 pt-[calc(max(4rem,env(safe-area-inset-top))+3.25rem)] lg:pl-72 lg:pt-0">
        {children}
      </div>
    </div>
  )
}
