import { Suspense } from "react"
import { BusinessAdminDashboardClient } from "./business-admin-dashboard-client"

export default function BusinessAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="relative z-20 mx-auto w-full max-w-7xl safe-pad-x py-10 text-center text-sm text-emerald-800">
          Loading dashboard…
        </div>
      }
    >
      <BusinessAdminDashboardClient />
    </Suspense>
  )
}
