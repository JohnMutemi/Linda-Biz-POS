"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Users, LogOut } from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Admin Overview",
    href: "/admin",
    icon: Shield,
  },
  {
    name: "Client Accounts",
    href: "/admin",
    icon: Users,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, confirmLogout } = useDashboard()

  if (!user) return null

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r border-emerald-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="px-6 py-6 border-b border-emerald-200">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Admin Console</p>
        <h2 className="text-lg font-bold text-emerald-900 mt-1">LindaBiz Administration</h2>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const current = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors",
                  current
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    current ? "text-emerald-700" : "text-emerald-600 group-hover:text-emerald-700",
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-emerald-200 p-4">
        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="text-sm font-medium text-emerald-900">{user.name}</p>
          <p className="text-xs text-emerald-700">{user.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700"
          onClick={confirmLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
