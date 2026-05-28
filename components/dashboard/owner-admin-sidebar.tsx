"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { BarChart3, ChevronRight, Lightbulb, LogOut, PanelLeft, Sparkles, Boxes, Activity } from "lucide-react"

import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { cn } from "@/lib/utils"

export function OwnerAdminSidebar() {
  const { user } = useDashboard()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const activeTab = (searchParams.get("tab") || "overview").toLowerCase()

  const navigation = useMemo(
    () => [
      {
        name: "Overview",
        href: "/business-admin?tab=overview",
        icon: BarChart3,
        current: pathname === "/business-admin" && activeTab === "overview",
      },
      {
        name: "Products",
        href: "/business-admin?tab=products",
        icon: Boxes,
        current: pathname === "/business-admin" && activeTab === "products",
      },
      {
        name: "Actions",
        href: "/business-admin?tab=actions",
        icon: Activity,
        current: pathname === "/business-admin" && activeTab === "actions",
      },
      {
        name: "Tips",
        href: "/business-admin?tab=tips",
        icon: Lightbulb,
        current: pathname === "/business-admin" && activeTab === "tips",
      },
    ],
    [pathname, activeTab],
  )

  if (!user) return null

  const brandHeader = (
    <OwnerBrandHeader businessName={user.businessName} />
  )

  return (
    <>
      <div
        className={cn(
          "fixed left-16 right-0 z-30 border-b border-emerald-100 bg-white/95 px-2 py-2 backdrop-blur-sm lg:hidden",
          mobileExpanded ? "hidden" : "block",
        )}
        style={{ top: "env(safe-area-inset-top)" }}
      >
        <nav className="grid grid-cols-1 gap-2">
          {navigation.map((item) => (
            <Link
              key={`quick-${item.name}`}
              href={item.href}
              className={cn(
                "flex min-h-10 items-center justify-center gap-2 rounded-lg border px-2 text-xs font-semibold transition-colors touch-manipulation",
                item.current
                  ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                  : "border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-emerald-100 bg-white lg:hidden">
        <div className="flex h-16 items-center justify-center border-b border-emerald-100">
          <LindaBizLogo compact />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => (
              <Link
                key={`rail-${item.name}`}
                href={item.href}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-lg transition-colors touch-manipulation",
                  item.current
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
                )}
                aria-label={item.name}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-emerald-100 p-2 safe-pad-b">
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => setMobileExpanded(true)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileExpanded} onOpenChange={setMobileExpanded}>
        <SheetContent
          side="left"
          className="w-[min(88vw,340px)] max-w-[min(88vw,340px)] p-0 bg-white border-r border-emerald-100 shadow-2xl z-50 pt-[env(safe-area-inset-top)]"
        >
          <MobileOwnerSidebar user={user} navigation={navigation} brandHeader={brandHeader} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r border-white/40 bg-white/65 backdrop-blur-xl shadow-sm shadow-emerald-200/40">
        <DesktopOwnerSidebar user={user} navigation={navigation} brandHeader={brandHeader} />
      </div>
    </>
  )
}

function OwnerBrandHeader({ businessName }: { businessName: string }) {
  return (
    <div className="px-5 py-5 sm:px-6 border-b border-emerald-100/80 bg-gradient-to-br from-white/95 via-emerald-50/40 to-white/90 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <LindaBizLogo compact />
        </div>
        <div className="min-w-0 flex-1 pl-3 border-l border-emerald-200/90">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
            <Sparkles className="h-3 w-3" />
            Owner Admin
          </div>
          <p
            className="mt-2 text-sm font-semibold leading-snug text-emerald-950 tracking-tight sm:text-[15px]"
            title={businessName}
          >
            <span className="line-clamp-2">{businessName}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function MobileOwnerSidebar({
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
    <div className="flex h-full flex-col bg-white">
      {brandHeader}

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <SheetClose key={item.name} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-12 items-center px-4 py-3 text-base font-medium rounded-lg group transition-colors relative z-10 touch-manipulation active:bg-emerald-100/80",
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
            </SheetClose>
          ))}
        </nav>
      </div>

      <div className="border-t border-emerald-200 p-4 safe-pad-b">
        <Button
          variant="outline"
          className="min-h-11 w-full touch-manipulation justify-start border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 relative z-10"
          onClick={confirmLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

function DesktopOwnerSidebar({
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
                "flex min-h-12 items-center px-4 py-3 text-base font-medium rounded-lg group transition-colors relative z-10 cursor-pointer touch-manipulation active:bg-emerald-100/80",
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

