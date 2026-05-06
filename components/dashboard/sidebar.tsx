"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Settings, ChevronRight, Menu, LogOut } from "lucide-react"
import { useDashboard } from "./dashboard-provider"
import { useDashboardTheme } from "./dashboard-theme-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"
import type { DashboardThemeClasses } from "@/lib/dashboard-theme"

function useNavStyles(t: DashboardThemeClasses) {
  const isDark = t.id === "dark"
  const link = (current: boolean) =>
    cn(
      "flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors relative z-10",
      current
        ? isDark
          ? "bg-emerald-600/30 text-white border border-emerald-500/40"
          : cn("border", t.border, t.textStrong, "bg-white/90")
        : isDark
          ? "text-slate-300 hover:bg-slate-800/80 hover:text-white"
          : cn(t.textMuted, "hover:bg-white/70"),
    )
  const icon = (current: boolean) =>
    cn(
      "mr-3 h-5 w-5 flex-shrink-0",
      current
        ? isDark
          ? "text-emerald-300"
          : t.textStrong
        : isDark
          ? "text-slate-400 group-hover:text-slate-200"
          : cn(t.textLabel, "opacity-90", "group-hover:opacity-100"),
    )
  const chevron = isDark ? "text-emerald-400" : t.textLabel
  return { isDark, link, icon, chevron }
}

export function Sidebar() {
  const { user } = useDashboard()
  const { t } = useDashboardTheme()
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

  const shell = cn(
    "hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r backdrop-blur-xl",
    t.id === "dark"
      ? "border-slate-700 bg-slate-900/85 text-slate-100 shadow-sm shadow-black/20"
      : "border-white/40 bg-white/65 text-emerald-900 shadow-sm shadow-emerald-200/40",
  )

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "lg:hidden fixed left-4 top-4 z-50 backdrop-blur-xl border shadow-sm",
              t.id === "dark"
                ? "border-slate-600 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
                : "border-white/50 bg-white/70 shadow-emerald-200/60 hover:bg-white/80",
            )}
          >
            <Menu className={cn("h-5 w-5", t.id === "dark" ? "text-slate-200" : "text-emerald-700")} />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn(
            "w-[280px] p-0 backdrop-blur-xl z-50",
            t.id === "dark" ? "border-slate-700 bg-slate-900/95 text-slate-100" : "border-white/40 bg-white/75",
          )}
        >
          <MobileSidebar user={user} navigation={navigation} t={t} />
        </SheetContent>
      </Sheet>

      <div className={shell}>
        <DesktopSidebar user={user} navigation={navigation} t={t} />
      </div>
    </>
  )
}

function MobileSidebar({
  user,
  navigation,
  t,
}: {
  user: any
  navigation: any[]
  t: DashboardThemeClasses
}) {
  const { confirmLogout } = useDashboard()
  const { isDark, link, icon } = useNavStyles(t)

  return (
    <div className={cn("flex flex-col h-full backdrop-blur-xl", isDark ? "bg-slate-900/40" : "bg-white/70")}>
      <div className={cn("px-6 py-6 border-b", isDark ? "border-slate-700" : "border-white/40")}>
        <LindaBizLogo compact />
        <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : t.textMuted)}>{user.businessName}</p>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={link(item.current)}>
              <item.icon className={icon(item.current)} />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className={cn("border-t p-4", isDark ? "border-slate-700" : "border-emerald-200")}>
        <div className="flex items-center mb-4">
          <Link href="/profile" className="flex items-center flex-1 relative z-10">
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-semibold",
                  isDark ? "bg-slate-800 text-emerald-300" : "bg-emerald-100 text-emerald-800",
                )}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className={cn("text-sm font-medium", isDark ? "text-slate-100" : t.textStrong)}>{user.name}</p>
              <p className={cn("text-xs", isDark ? "text-slate-400" : t.textLabel)}>{user.email}</p>
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
  t,
}: {
  user: any
  navigation: any[]
  t: DashboardThemeClasses
}) {
  const { confirmLogout } = useDashboard()
  const { isDark, link, icon, chevron } = useNavStyles(t)

  return (
    <div className="flex flex-col h-full relative">
      <div className={cn("px-6 py-6 border-b", isDark ? "border-slate-700" : "border-white/40")}>
        <LindaBizLogo compact />
        <p className={cn("mt-1 text-sm", isDark ? "text-slate-400" : t.textMuted)}>{user.businessName}</p>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={cn(link(item.current), "cursor-pointer")}>
              <item.icon className={icon(item.current)} />
              <span className="flex-1">{item.name}</span>
              {item.current && <ChevronRight className={cn("h-4 w-4 flex-shrink-0", chevron)} />}
            </Link>
          ))}
        </nav>
      </div>

      <div className={cn("border-t p-4", isDark ? "border-slate-700" : "border-emerald-200")}>
        <div className="flex items-center mb-4">
          <Link href="/profile" className="flex items-center flex-1 relative z-10 cursor-pointer">
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-semibold",
                  isDark ? "bg-slate-800 text-emerald-300" : "bg-emerald-100 text-emerald-800",
                )}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", isDark ? "text-slate-100" : t.textStrong)}>
                {user.name}
              </p>
              <p className={cn("text-xs truncate", isDark ? "text-slate-400" : t.textLabel)}>{user.email}</p>
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
