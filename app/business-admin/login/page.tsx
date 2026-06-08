import { Suspense } from "react"
import { BusinessAdminLoginClient } from "./business-admin-login-client"

export default function BusinessAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <BusinessAdminLoginClient />
    </Suspense>
  )
}
