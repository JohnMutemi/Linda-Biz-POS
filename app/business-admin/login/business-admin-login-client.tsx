"use client"

import "../owner-admin-theme.css"
import "../owner-admin-surface.css"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { businessAdminTheme as t } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

const LOGO_SRC =
  "https://res.cloudinary.com/dhxtzhs6h/image/upload/v1778096626/LindaBiz_Logo_rndqs5.png"

export function BusinessAdminLoginClient() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetBusy, setResetBusy] = useState(false)
  const params = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const prefilledEmail = useMemo(() => params.get("email") || "", [params])

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail)
  }, [prefilledEmail])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const user = await response.json()
          if (user.isBusinessAdminPanel) {
            router.push("/business-admin")
            return
          }
          if (user.isAdmin) {
            router.push("/admin")
            return
          }
          router.push("/dashboard")
          return
        }
      } catch {
        // continue to login form
      }
      setLoading(false)
    }
    void checkSession()
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch("/api/business-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Business admin login failed")

      localStorage.setItem("lindabiz_user", JSON.stringify(data))
      toast({ title: "Login successful", description: `Welcome to ${data.businessName} admin panel.` })
      router.push("/business-admin")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unable to sign in.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const requestPasswordReset = async () => {
    const targetEmail = resetEmail.trim() || email.trim()
    if (!targetEmail) {
      toast({
        title: "Email required",
        description: "Enter your business admin email to receive a reset link.",
        variant: "destructive",
      })
      return
    }

    setResetBusy(true)
    try {
      const response = await fetch("/api/business-admin/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to send reset email")
      }

      toast({
        title: "Check your email",
        description: "If your business admin account exists, a password reset link has been sent.",
      })
      setResetOpen(false)
      setResetEmail("")
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setResetBusy(false)
    }
  }

  if (loading) {
    return (
      <div data-owner-admin-root className={cn("flex min-h-[100dvh] items-center justify-center", t.pageBg)}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className={t.textAccent}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div data-owner-admin-root className={cn("relative min-h-[100dvh]", t.pageBg)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn("absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full blur-3xl", t.blobPrimary)} />
        <div className={cn("absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full blur-3xl", t.blobSecondary)} />
        <div className={cn("absolute right-[20%] top-[35%] hidden h-[420px] w-[420px] rounded-full blur-3xl xl:block", t.blobAccent)} />
      </div>

      <div className="safe-pad-x relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1240px] items-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] md:px-8 md:py-10">
        <div
          className={cn(
            "grid w-full items-center gap-6 rounded-2xl border bg-white/90 p-4 shadow-2xl backdrop-blur-sm sm:rounded-3xl md:gap-8 md:p-8 lg:grid-cols-2",
            t.border,
            "shadow-sky-200/40",
          )}
        >
          {/* Brand panel — hidden on very small screens, visible from sm */}
          <div className="hidden flex-col sm:flex">
            <span
              className={cn(
                "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                t.border,
                "bg-sky-50 text-sky-800",
              )}
            >
              Owner Admin Access
            </span>

            <div className="mt-4 flex items-center gap-2">
              <div className="owner-admin-logo relative h-11 w-11 overflow-hidden rounded-xl border border-sky-200/90 bg-[#03181f] shadow-md shadow-sky-200/30">
                <Image src={LOGO_SRC} alt="LindaBiz logo" fill className="object-cover object-center" priority unoptimized />
              </div>
              <div className="rounded-md border border-sky-200/80 bg-sky-50/60 px-2 py-0.5">
                <p className="text-base font-semibold italic leading-none tracking-tight text-slate-900 sm:text-lg">
                  LindaBiz
                </p>
              </div>
            </div>

            <h1 className={cn("mt-5 text-2xl font-bold tracking-tight md:text-3xl", t.textPrimary)}>
              Business admin console
            </h1>
            <p className={cn("mt-3 max-w-sm text-sm leading-relaxed", t.textSecondary)}>
              Sign in to monitor inventory, review sales performance, and manage owner-level settings for your business.
            </p>

            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-slate-700">
              Use the credentials issued after your account was approved. You may be asked to set a new password on first
              login.
            </div>

            <Link href="/" className={cn("mt-4 inline-block text-sm font-medium hover:text-blue-900", t.textAccent)}>
              Back to home
            </Link>

            <div className="mt-8 hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 lg:block">
              <div className="flex items-center gap-3">
                <div className={t.cardIcon}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", t.textPrimary)}>Secure owner access</p>
                  <p className={cn("text-xs", t.textSecondary)}>Separate credentials from your main POS login</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login form */}
          <div className={cn("rounded-2xl border bg-white/95 p-1 shadow-lg", t.border, "shadow-sky-100/70")}>
            <Card className={cn("border-0 shadow-none", t.surface)}>
              <CardHeader className="space-y-3 pb-2 text-center sm:text-left">
                <div className={cn("mx-auto sm:mx-0", t.cardIcon)}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className={cn("text-2xl", t.textPrimary)}>Sign in</CardTitle>
                <CardDescription className={t.textSecondary}>
                  Enter your business admin email and password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ba-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="ba-email"
                        type="email"
                        placeholder="owner@business.com"
                        className="border-sky-200 pl-10 focus:border-blue-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ba-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="ba-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="border-sky-200 pl-10 pr-10 focus:border-blue-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className={cn("text-xs font-semibold hover:text-blue-900", t.textAccent)}
                        onClick={() => {
                          setResetEmail(email)
                          setResetOpen(true)
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={cn("h-11 w-full text-white touch-manipulation", t.primary)}
                    disabled={submitting}
                  >
                    {submitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className={cn("mt-5 text-center text-sm sm:text-left", t.textSecondary)}>
                  <Link href="/login" className={cn("font-medium hover:text-blue-900", t.textAccent)}>
                    Main user login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className={cn("border-sky-200 bg-white/95 backdrop-blur-sm", t.border)}>
          <DialogHeader>
            <DialogTitle className={t.textPrimary}>Reset business admin password</DialogTitle>
            <DialogDescription className={t.textSecondary}>
              Enter your business admin email and we&apos;ll send a reset link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ba-reset-email">Email</Label>
              <Input
                id="ba-reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="border-sky-200 focus:border-blue-400"
                placeholder="owner@business.com"
              />
            </div>
            <Button
              type="button"
              onClick={requestPasswordReset}
              disabled={resetBusy}
              className={cn("w-full text-white", t.primary)}
            >
              {resetBusy ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
