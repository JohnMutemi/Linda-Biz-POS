"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function BusinessAdminLoginClient() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
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

  if (loading) return <div className="min-h-screen bg-emerald-50" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-emerald-100 shadow-xl shadow-emerald-100/40">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">Business Admin Login</CardTitle>
            <CardDescription className="text-emerald-700">Sign in with credentials sent after approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ba-email">Email</Label>
                <Input id="ba-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ba-password">Business admin password</Label>
                <Input
                  id="ba-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-emerald-700">
              <Link href="/login" className="font-medium hover:text-emerald-600">
                Main user login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

