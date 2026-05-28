"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

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
    <div className="relative min-h-screen bg-emerald-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-center">
        <Card className="w-full border-emerald-100 bg-white/90 shadow-2xl shadow-emerald-200/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-emerald-900">Set a new business admin password</CardTitle>
            <CardDescription className="text-center text-emerald-700">
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
                <p className="text-xs text-emerald-600">Must be at least 6 characters.</p>
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
              <Button type="submit" disabled={!canSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

