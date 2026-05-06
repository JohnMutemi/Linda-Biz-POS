"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Mail, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const user = await response.json()
          if (user.isAdmin) {
            router.push("/admin")
            return
          }
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Admin session check failed:", error)
      }
      setLoading(false)
    }
    void checkSession()
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Admin login failed")
      }
      if (!data.isAdmin) {
        throw new Error("This account is not an admin account.")
      }

      localStorage.setItem("lindabiz_user", JSON.stringify(data))
      toast({
        title: "Admin login successful",
        description: `Welcome, ${data.name}.`,
      })
      router.push("/admin")
    } catch (error) {
      toast({
        title: "Admin login failed",
        description: error instanceof Error ? error.message : "Unable to sign in.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-emerald-100 shadow-xl shadow-emerald-100/40">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">Admin Login</CardTitle>
            <CardDescription className="text-emerald-700">Sign in to the LindaBiz admin console</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    className="pl-10 border-emerald-200 focus:border-emerald-400"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type="password"
                    className="pl-10 border-emerald-200 focus:border-emerald-400"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in as Admin"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-emerald-700">
              <Link href="/login" className="font-medium hover:text-emerald-600">
                Client login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
