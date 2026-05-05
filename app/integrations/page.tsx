import Link from "next/link"
import { BarChart3, Database, RefreshCw } from "lucide-react"
import { MarketingShell } from "@/components/marketing/marketing-shell"

export default function IntegrationsPage() {
  return (
    <MarketingShell
      title="One workflow, one dataset"
      subtitle="LindaBiz keeps sales, inventory, and reports in sync so your records stay accurate and easy to review."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Unified Data</h3>
          <p className="mt-2 text-sm text-slate-600">Products, sales, and stock updates stay connected.</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <RefreshCw className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Auto Stock Updates</h3>
          <p className="mt-2 text-sm text-slate-600">After checkout, stock reduces automatically and safely.</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">Clear Reports</h3>
          <p className="mt-2 text-sm text-slate-600">See recent transactions and exact items sold per sale.</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
        <h3 className="text-xl font-bold text-slate-900">Want a specific integration?</h3>
        <p className="mt-2 text-slate-600">
          Tell support what you want (e.g., export formats) and we&apos;ll advise the best approach.
        </p>
        <Link href="/support" className="mt-6 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-600">
          Talk to support
        </Link>
      </div>
    </MarketingShell>
  )
}
