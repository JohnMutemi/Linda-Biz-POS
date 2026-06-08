"use client"

import "../owner-admin-theme.css"
import "../owner-admin-surface.css"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { businessAdminTheme as t } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

export function BusinessAdminRecoverPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  const canSubmit = useMemo(() => {
    return Boolean(token && email && password.length >= 6 && password === confirm && !busy)
  }, [busy, confirm, email, password, token])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setBusy(true)
    try {
      const response = await fetch("/api/business-admin/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Failed to reset password")
      }

      toast({
        title: "Password updated",
        description: "You can now sign in to the business admin panel with your new password.",
      })
      router.push(`/business-admin/login?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-owner-admin-root className={cn("relative min-h-[100dvh]", t.pageBg)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn("absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full blur-3xl", t.blobPrimary)} />
        <div className={cn("absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full blur-3xl", t.blobSecondary)} />
      </div>

      <div className="safe-pad-x relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[720px] items-center px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Card className={cn("w-full shadow-2xl shadow-sky-200/40 backdrop-blur-sm", t.card)}>
          <CardHeader className="space-y-3 text-center">
            <div className={cn("mx-auto", t.cardIcon)}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className={cn("text-2xl", t.textPrimary)}>Reset business admin password</CardTitle>
            <CardDescription className={t.textSecondary}>
              Choose a new password for <span className="font-medium">{email || "your account"}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token || !email ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This reset link is missing required information. Please request a new password reset from the login page.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ba-recover-password">New password</Label>
                  <Input
                    id="ba-recover-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn("border-sky-200 focus:border-blue-400")}
                    minLength={6}
                    required
                  />
                  <p className={cn("text-xs", t.textAccent)}>Must be at least 6 characters.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ba-recover-confirm">Confirm new password</Label>
                  <Input
                    id="ba-recover-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={cn("border-sky-200 focus:border-blue-400")}
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={!canSubmit} className={cn("w-full text-white", t.primary)}>
                  {busy ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}

            <div className={cn("mt-6 text-center text-sm", t.textSecondary)}>
              <Link href="/business-admin/login" className={cn("font-medium hover:text-blue-900", t.textAccent)}>
                Back to business admin login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
