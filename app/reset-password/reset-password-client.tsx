"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function ResetPasswordClient() {
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
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || "Failed to reset password")
      }

      toast({ title: "Password updated", description: "You can now log in with your new password." })
      router.push("/login?tab=login&email=" + encodeURIComponent(email))
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
    <div className="relative min-h-screen bg-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[720px] items-center px-4 py-10">
        <Card className="w-full border-emerald-100 bg-white/90 shadow-2xl shadow-emerald-200/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center">
              <LindaBizLogo />
            </div>
            <CardTitle className="text-center text-2xl text-emerald-900">Reset Password</CardTitle>
            <CardDescription className="text-center text-emerald-700">
              Choose a new password for <span className="font-medium">{email || "your account"}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token || !email ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This reset link is missing required information. Please request a new password reset.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-emerald-600">Must be at least 6 characters.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                    minLength={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={!canSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {busy ? "Updating..." : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

