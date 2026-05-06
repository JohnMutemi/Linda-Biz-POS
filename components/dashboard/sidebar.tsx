"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Settings, ChevronRight, Menu, LogOut } from "lucide-react"
import { useDashboard } from "./dashboard-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"

export function Sidebar() {
  const { user } = useDashboard()
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Products",
      href: "/products",
      icon: Package,
      current: pathname === "/products",
    },
    {
      name: "Sales",
      href: "/sales",
      icon: ShoppingCart,
      current: pathname === "/sales",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname === "/settings",
    },
  ]
  if (!user) return null

  const brandHeader = (
    <SidebarBrandHeader businessName={user.businessName} />
  )

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed left-4 top-4 z-50 bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm shadow-emerald-200/60 hover:bg-white/80"
          >
            <Menu className="h-5 w-5 text-emerald-700" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-white/75 backdrop-blur-xl border-white/40 z-50">
          <MobileSidebar user={user} navigation={navigation} brandHeader={brandHeader} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r border-white/40 bg-white/65 backdrop-blur-xl shadow-sm shadow-emerald-200/40">
        <DesktopSidebar user={user} navigation={navigation} brandHeader={brandHeader} />
      </div>
    </>
  )
}

function SidebarBrandHeader({ businessName }: { businessName: string }) {
  return (
    <div className="px-5 py-5 sm:px-6 border-b border-emerald-100/80 bg-gradient-to-br from-white/95 via-emerald-50/40 to-white/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <LindaBizLogo compact />
        </div>
        <div className="min-w-0 flex-1 pl-3 border-l border-emerald-200/90">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600/90">Business</p>
          <p
            className="mt-1 text-sm font-semibold leading-snug text-emerald-950 tracking-tight sm:text-[15px]"
            title={businessName}
          >
            <span className="line-clamp-2">{businessName}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function MobileSidebar({
  user,
  navigation,
  brandHeader,
}: {
  user: any
  navigation: any[]
  brandHeader: React.ReactNode
}) {
  const { confirmLogout } = useDashboard()

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl">
      {brandHeader}

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors relative z-10",
                item.current
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  item.current ? "text-emerald-700" : "text-emerald-600 group-hover:text-emerald-700",
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-emerald-200 p-4">
        <div className="flex items-center mb-4">
          <Link href="/profile" className="flex items-center flex-1 relative z-10">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-emerald-900">{user.name}</p>
              <p className="text-xs text-emerald-600">{user.email}</p>
            </div>
          </Link>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 relative z-10"
          onClick={confirmLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function DesktopSidebar({
  user,
  navigation,
  brandHeader,
}: {
  user: any
  navigation: any[]
  brandHeader: React.ReactNode
}) {
  const { confirmLogout } = useDashboard()

  return (
    <div className="flex flex-col h-full relative">
      {brandHeader}

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors relative z-10 cursor-pointer",
                item.current
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  item.current ? "text-emerald-700" : "text-emerald-600 group-hover:text-emerald-700",
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.current && <ChevronRight className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-emerald-200 p-4">
        <div className="flex items-center mb-4">
          <Link href="/profile" className="flex items-center flex-1 relative z-10 cursor-pointer">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-900 truncate">{user.name}</p>
              <p className="text-xs text-emerald-600 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 relative z-10 cursor-pointer"
          onClick={confirmLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
