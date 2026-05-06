"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Box, Headphones, ShieldCheck, ShoppingCart, Users } from "lucide-react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { DesktopPreview } from "@/components/marketing/desktop-preview"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const user = await response.json()
          localStorage.setItem("lindabiz_user", JSON.stringify(user))
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Session check failed:", error)
      }
      setLoading(false)
    }
    void checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-4 pb-10 pt-6 md:px-8">
        <MarketingHeader />

        <section className="mt-8 grid flex-1 items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-950 md:text-6xl">
              Simplify Sales.
              <br />
              Grow Your <span className="text-emerald-600">Business.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-slate-600">
              LindaBiz is a modern Point of Sale system that helps you manage sales, inventory, customers, and reports
              in one workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Fast Checkout</p>
                  <p className="text-sm text-slate-600">Speed up billing and reduce wait times.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Box className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Inventory Management</p>
                  <p className="text-sm text-slate-600">Track stock levels and get low stock alerts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Insightful Reports</p>
                  <p className="text-sm text-slate-600">Monitor performance with clear analytics.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Customer Management</p>
                  <p className="text-sm text-slate-600">Build loyalty with customer profiles.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 hover:bg-emerald-500">
                Get Started Free
              </button>
              <Link
                href="/login?tab=login"
                className="rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Login to Dashboard
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure & Reliable
              </span>
              <span className="inline-flex items-center gap-2">
                <Box className="h-4 w-4 text-emerald-600" />
                Works on Any Device
              </span>
              <span className="inline-flex items-center gap-2">
                <Headphones className="h-4 w-4 text-emerald-600" />
                24/7 Support
              </span>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -left-5 top-10 hidden h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl lg:block" />
            <DesktopPreview className="max-w-[620px]" />
          </div>
        </section>
      </div>
    </div>
  )
}
