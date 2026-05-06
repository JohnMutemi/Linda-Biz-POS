import { Suspense } from "react"
import { TermsClient } from "./terms-client"

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
          <div className="text-sm text-emerald-800">Loading terms…</div>
        </div>
      }
    >
      <TermsClient />
    </Suspense>
  )
}

