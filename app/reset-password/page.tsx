import { Suspense } from "react"
import { ResetPasswordClient } from "./reset-password-client"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
          <div className="text-sm text-emerald-800">Loading reset form…</div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  )
}

