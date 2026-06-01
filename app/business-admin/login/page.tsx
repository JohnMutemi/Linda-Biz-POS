import { Suspense } from "react"
import { BusinessAdminLoginClient } from "./business-admin-login-client"

export default function BusinessAdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50" />}>
      <BusinessAdminLoginClient />
    </Suspense>
  )
}
