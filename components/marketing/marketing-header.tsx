"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/integrations" },
  { label: "Support", href: "/support" },
]

export function MarketingHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-3 py-2 shadow-md shadow-emerald-100/70 backdrop-blur-md md:px-4">
      <LindaBizLogo />

      <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-800 lg:flex">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("transition hover:text-emerald-600", active && "text-emerald-700")}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/login?tab=login"
            className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50"
          >
            Login
          </Link>
          <Link
            href="/login?tab=signup"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            Sign up
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden border-emerald-200 bg-white/80 backdrop-blur-sm hover:bg-emerald-50"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-emerald-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-white/95 backdrop-blur-sm">
            <div className="mt-4 space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-emerald-100 bg-white text-slate-800 hover:bg-emerald-50",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 grid gap-2">
              <Link
                href="/login?tab=login"
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Login
              </Link>
              <Link
                href="/login?tab=signup"
                className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Sign up
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

