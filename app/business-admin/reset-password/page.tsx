"use client"

import "../owner-admin-theme.css"
import "../owner-admin-surface.css"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { businessAdminTheme as t } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

export default function BusinessAdminResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [busy, setBusy] = useState(false)

  const canSubmit = useMemo(() => {
    return password.length >= 6 && password === confirm && !busy
  }, [busy, confirm, password])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setBusy(true)
    try {
      const response = await fetch("/api/business-admin/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || "Failed to update password")

      toast({ title: "Password updated", description: "You can now use your new password to access the business admin panel." })
      router.push("/business-admin")
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-owner-admin-root className={cn("relative min-h-screen px-4 py-10", t.pageBg)}>
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-center">
        <Card className={cn("w-full shadow-2xl shadow-sky-200/40 backdrop-blur-sm", t.card)}>
          <CardHeader>
            <CardTitle className={cn("text-center text-2xl", t.textPrimary)}>Set a new business admin password</CardTitle>
            <CardDescription className={cn("text-center", t.textSecondary)}>
              For security, you must change the temporary password before continuing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ba-new-password">New password</Label>
                <Input
                  id="ba-new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <p className={cn("text-xs", t.textAccent)}>Must be at least 6 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-confirm-password">Confirm new password</Label>
                <Input
                  id="ba-confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={!canSubmit} className={cn("w-full text-white", t.primary)}>
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
