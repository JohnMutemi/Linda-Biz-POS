import { Suspense } from "react"
import { BusinessAdminLoginClient } from "./business-admin-login-client"

export default function BusinessAdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-emerald-50" />}>
      <BusinessAdminLoginClient />
    </Suspense>
  )
}
