"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, Settings, Store, Wine, ChevronRight, Menu, LogOut } from "lucide-react"
import { useDashboard } from "./dashboard-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

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

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed left-4 top-4 z-50 bg-white/80 backdrop-blur-sm border border-emerald-200 hover:bg-emerald-50"
          >
            <Menu className="h-5 w-5 text-emerald-700" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-white/95 backdrop-blur-sm border-emerald-200 z-50">
          <MobileSidebar user={user} navigation={navigation} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-30 border-r border-emerald-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <DesktopSidebar user={user} navigation={navigation} />
      </div>
    </>
  )
}

function MobileSidebar({
  user,
  navigation,
}: {
  user: any
  navigation: any[]
}) {
  const { confirmLogout } = useDashboard()

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm">
      <div className="px-6 py-6 border-b border-emerald-200">
        <div className="flex items-center space-x-3">
          {user.userType === "general" ? (
            <Store className="h-8 w-8 text-emerald-600" />
          ) : (
            <Wine className="h-8 w-8 text-green-600" />
          )}
          <span className="text-xl font-bold text-emerald-900">LindaBiz</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700">{user.businessName}</p>
      </div>

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
          className="w-full justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700 relative z-10"
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
}: {
  user: any
  navigation: any[]
}) {
  const { confirmLogout } = useDashboard()

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-6 py-6 border-b border-emerald-200">
        <div className="flex items-center space-x-3">
          {user.userType === "general" ? (
            <Store className="h-8 w-8 text-emerald-600" />
          ) : (
            <Wine className="h-8 w-8 text-green-600" />
          )}
          <span className="text-xl font-bold text-emerald-900">LindaBiz</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700">{user.businessName}</p>
      </div>

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
          className="w-full justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700 relative z-10 cursor-pointer"
          onClick={confirmLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
