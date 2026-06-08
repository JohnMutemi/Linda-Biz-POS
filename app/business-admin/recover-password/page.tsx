import { Suspense } from "react"
import { BusinessAdminRecoverPasswordClient } from "./business-admin-recover-password-client"

export default function BusinessAdminRecoverPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50" />
      }
    >
      <BusinessAdminRecoverPasswordClient />
    </Suspense>
  )
}
