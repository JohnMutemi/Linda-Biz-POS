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
      <Sidebar />
      <div className="flex-1 lg:pl-72 relative z-10 pt-16 lg:pt-0">{children}</div>
    </div>
  )
}
