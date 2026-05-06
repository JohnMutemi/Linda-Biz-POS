"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LindaBizLogo } from "@/components/brand/lindabiz-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

type TermsItem = { id: string; title: string; body: string }

export default function TermsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()

  const email = params.get("email") || ""

  const [terms, setTerms] = useState<TermsItem[]>([])
  const [version, setVersion] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const [agreed, setAgreed] = useState(false)
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/terms")
        const data = await res.json()
        setTerms(Array.isArray(data?.items) ? data.items : [])
        setVersion(String(data?.version || ""))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const canSubmit = useMemo(() => {
    return Boolean(email && password && agreed && !busy)
  }, [agreed, busy, email, password])

  const onAgree = async () => {
    if (!canSubmit) return
    setBusy(true)
    try {
      const res = await fetch("/api/terms/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accepted: true }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Failed to accept terms")

      toast({ title: "Terms accepted", description: "You can now sign in." })
      router.push(`/login?tab=login&email=${encodeURIComponent(email)}`)
    } catch (e) {
      toast({
        title: "Could not continue",
        description: e instanceof Error ? e.message : "Please try again.",
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[980px] items-center px-4 py-10">
        <Card className="w-full border-white/40 bg-white/60 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100/60 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <div className="flex justify-center">
              <LindaBizLogo />
            </div>
            <CardTitle className="text-center text-2xl text-emerald-900">Terms & Conditions</CardTitle>
            <CardDescription className="text-center text-emerald-700">
              Please review and accept the POS terms before your first login.
              {version ? ` (v${version})` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-xl">
              <p className="text-sm text-emerald-800">
                Account: <span className="font-semibold text-emerald-900">{email || "Missing email"}</span>
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">POS terms</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(loading ? Array.from({ length: 6 }) : terms).map((item: any, idx: number) => (
                  <div
                    key={item?.id || idx}
                    className="rounded-2xl border border-white/40 bg-white/55 p-4 ring-1 ring-emerald-100/40 backdrop-blur-xl"
                  >
                    <p className="text-sm font-semibold text-emerald-900">{item?.title || "Loading..."}</p>
                    <p className="mt-1 text-xs text-slate-700">{item?.body || "Fetching terms..."}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/55 p-4 ring-1 ring-emerald-100/40 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
                <div className="min-w-0">
                  <Label htmlFor="agree" className="text-sm font-medium text-emerald-900">
                    I agree to the Terms & Conditions
                  </Label>
                  <p className="mt-1 text-xs text-slate-700">
                    If you do not agree, you will not be able to log in.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Confirm password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/40 bg-white/70 backdrop-blur-xl"
                  placeholder="Enter your password"
                />
                <p className="text-xs text-slate-600">Used to confirm it’s you before activating the account.</p>
              </div>

              <div className="flex flex-col justify-end gap-2">
                <Button
                  type="button"
                  disabled={!canSubmit}
                  onClick={onAgree}
                  className="h-11 bg-emerald-600 hover:bg-emerald-700"
                >
                  {busy ? "Saving..." : "Agree & Continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300"
                  onClick={() => router.push("/")}
                >
                  Do not agree
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

