"use client"



import type React from "react"



import Link from "next/link"

import { usePathname, useSearchParams } from "next/navigation"

import { useMemo, useState } from "react"

import { BarChart3, ChevronRight, Lightbulb, PanelLeft, Sparkles, Boxes, Activity } from "lucide-react"

import { OwnerAdminProfileMenu } from "@/components/business-admin/owner-admin-profile-menu"



import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"

import { Button } from "@/components/ui/button"

import { OwnerAdminLogo } from "@/components/brand/owner-admin-logo"

import { useDashboard } from "@/components/dashboard/dashboard-provider"

import { businessAdminTheme as ba } from "@/lib/business-admin-theme"

import { cn } from "@/lib/utils"



export function OwnerAdminSidebar() {

  const { user } = useDashboard()

  const pathname = usePathname()

  const searchParams = useSearchParams()

  const [mobileExpanded, setMobileExpanded] = useState(false)



  const tabParam = (searchParams.get("tab") || "overview").toLowerCase()

  const activeTab = tabParam === "products" ? "inventory" : tabParam



  const navigation = useMemo(

    () => [

      {

        name: "Overview",

        href: "/business-admin?tab=overview",

        icon: BarChart3,

        current: pathname === "/business-admin" && activeTab === "overview",

      },

      {

        name: "Inventory",

        href: "/business-admin?tab=inventory&view=manage",

        icon: Boxes,

        current: pathname === "/business-admin" && activeTab === "inventory",

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



  const brandHeader = <OwnerBrandHeader businessName={user.businessName} />



  return (

    <>

      <div

        className={cn(

          "fixed left-16 right-0 z-30 border-b px-2 py-2 shadow-sm backdrop-blur-md lg:hidden",

          ba.border,

          ba.surface,

        )}

        style={{ top: "env(safe-area-inset-top)" }}

      >

        <nav className="grid grid-cols-2 gap-2">

          {navigation.map((item) => (

            <Link

              key={`quick-${item.name}`}

              href={item.href}

              className={cn(

                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition-all touch-manipulation sm:flex-row sm:gap-2 sm:text-xs",

                item.current ? ba.activeNav : cn(ba.border, ba.surface, ba.inactiveNav),

              )}

            >

              <item.icon className="h-4 w-4 shrink-0" />

              <span className="truncate text-center leading-tight">{item.name}</span>

            </Link>

          ))}

        </nav>

      </div>



      <div className={cn("owner-admin-sidebar fixed inset-y-0 left-0 z-40 flex w-16 flex-col lg:hidden", ba.sidebarShell)}>

        <div className={cn("flex h-16 items-center justify-center border-b", ba.borderStrong)}>

          <OwnerAdminLogo compact />

        </div>

        <div className="flex-1 overflow-y-auto py-2">

          <nav className="space-y-1 px-2">

            {navigation.map((item) => (

              <Link

                key={`rail-${item.name}`}

                href={item.href}

                className={cn(

                  "flex h-11 w-11 items-center justify-center rounded-xl transition-all touch-manipulation",

                  item.current ? ba.railActive : ba.railInactive,

                )}

                aria-label={item.name}

                title={item.name}

              >

                <item.icon className="h-5 w-5" />

              </Link>

            ))}

          </nav>

        </div>

        <div className={cn("flex flex-col gap-2 border-t p-2 safe-pad-b", ba.borderStrong)}>
          <Button
            variant="outline"
            size="icon"
            className={cn("h-11 w-11", ba.btnOutline)}
            onClick={() => setMobileExpanded(true)}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <OwnerAdminProfileMenu compact />
        </div>

      </div>



      <Sheet open={mobileExpanded} onOpenChange={setMobileExpanded}>

        <SheetContent

          side="left"

          className={cn(

            "w-[min(88vw,340px)] max-w-[min(88vw,340px)] p-0 shadow-2xl z-50 pt-[env(safe-area-inset-top)]",

            ba.sidebarShell,

          )}

        >

          <MobileOwnerSidebar navigation={navigation} brandHeader={brandHeader} />

        </SheetContent>

      </Sheet>



      <div

        className={cn(

          "owner-admin-sidebar hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 xl:w-80 backdrop-blur-xl",

          ba.sidebarShell,

        )}

      >

        <DesktopOwnerSidebar navigation={navigation} brandHeader={brandHeader} />

      </div>

    </>

  )

}



function OwnerBrandHeader({ businessName }: { businessName: string }) {

  return (

    <div className={cn("px-5 py-5 sm:px-6 backdrop-blur-sm", ba.sidebarBrand)}>

      <div className="flex items-center gap-3">

        <div className="shrink-0 owner-admin-logo-wrap">
          <OwnerAdminLogo compact />
        </div>

        <div className={cn("min-w-0 flex-1 pl-3 border-l", ba.border)}>

          <div className={ba.badgePill}>

            <Sparkles className={ba.badgePillIcon} />

            Owner Admin

          </div>

          <p

            className={cn("mt-2 text-sm font-semibold leading-snug tracking-tight sm:text-[15px]", ba.textPrimary)}

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

  navigation,

  brandHeader,

}: {

  navigation: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; current: boolean }[]

  brandHeader: React.ReactNode

}) {

  return (

    <div className={cn("owner-admin-sidebar flex h-full flex-col", ba.surface)}>

      {brandHeader}



      <div className="flex-1 px-4 py-4 overflow-y-auto">

        <nav className="space-y-1">

          {navigation.map((item) => (

            <SheetClose key={item.name} asChild>

              <Link

                href={item.href}

                className={cn(

                  "flex min-h-12 items-center px-4 py-3 text-base font-medium rounded-xl group transition-colors relative z-10 touch-manipulation",

                  item.current ? ba.activeNav : ba.inactiveNav,

                )}

              >

                <item.icon

                  className={cn(

                    "mr-3 h-5 w-5 flex-shrink-0",

                    item.current ? "text-white" : cn(ba.navIcon, "group-hover:text-blue-800"),

                  )}

                />

                {item.name}

              </Link>

            </SheetClose>

          ))}

        </nav>

      </div>



      <div className={cn("border-t p-4 safe-pad-b", ba.borderStrong, ba.surfaceMuted)}>
        <OwnerAdminProfileMenu />
      </div>

    </div>

  )

}



function DesktopOwnerSidebar({

  navigation,

  brandHeader,

}: {

  navigation: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; current: boolean }[]

  brandHeader: React.ReactNode

}) {

  return (

    <div className="flex flex-col h-full relative">

      {brandHeader}



      <div className="flex-1 px-4 py-5 overflow-y-auto xl:px-5">

        <p className={cn("mb-2 px-2", ba.sidebarMenuLabel)}>Menu</p>

        <nav className="space-y-1.5">

          {navigation.map((item) => (

            <Link

              key={item.name}

              href={item.href}

              className={cn(

                "flex min-h-12 items-center rounded-xl px-4 py-3 text-base font-medium group transition-all relative z-10 cursor-pointer touch-manipulation xl:min-h-[3.25rem]",

                item.current ? ba.activeNav : ba.inactiveNav,

              )}

            >

              <item.icon

                className={cn(

                  "mr-3 h-5 w-5 flex-shrink-0",

                  item.current ? "text-white" : cn(ba.navIcon, "group-hover:text-blue-800"),

                )}

              />

              <span className="flex-1">{item.name}</span>

              {item.current && <ChevronRight className="h-4 w-4 text-white/90 flex-shrink-0" />}

            </Link>

          ))}

        </nav>

      </div>



      <div className={cn("border-t p-4 mx-2 mb-2 rounded-t-xl", ba.borderStrong, ba.surfaceMuted)}>
        <OwnerAdminProfileMenu />
      </div>

    </div>

  )

}


