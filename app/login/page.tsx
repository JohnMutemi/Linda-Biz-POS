"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthForm } from "@/components/auth-form"
import { DesktopPreview } from "@/components/marketing/desktop-preview"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"

export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const user = await response.json()
          localStorage.setItem("lindabiz_user", JSON.stringify(user))
          router.push(user.isAdmin ? "/admin" : "/dashboard")
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
          <p className="text-emerald-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1240px] items-center px-4 py-8 md:px-8 md:py-10">
        <div className="grid w-full items-center gap-6 rounded-3xl border border-emerald-100 bg-white/90 p-4 shadow-2xl shadow-emerald-200/40 backdrop-blur-sm md:gap-8 md:p-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Account Access
            </span>
            <div className="mt-4">
              <LindaBizLogo />
            </div>
            <p className="mt-5 max-w-sm text-sm text-slate-600">
              Welcome back. Sign in to access your dashboard, manage inventory, and track daily sales.
            </p>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Approved clients only: new registrations must be reviewed by admin before login is enabled.
            </div>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-500">
              Back Home
            </Link>

            <DesktopPreview className="mt-5" />
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white/95 p-1 shadow-lg shadow-emerald-100/70">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
