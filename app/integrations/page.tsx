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
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Unified Data</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Products, sales, and stock updates stay connected.</p>
        </div>
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <RefreshCw className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Auto Stock Updates</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">After checkout, stock reduces automatically and safely.</p>
        </div>
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Clear Reports</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">See recent transactions and exact items sold per sale.</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md md:p-8">
        <h3 className="text-xl font-semibold text-slate-900">Want a specific integration?</h3>
        <p className="mt-2 leading-relaxed text-slate-700">
          Tell support what you want (e.g., export formats) and we&apos;ll advise the best approach.
        </p>
        <Link href="/support" className="mt-6 inline-block text-sm font-semibold text-emerald-700 transition hover:text-emerald-600">
          Talk to support
        </Link>
      </div>
    </MarketingShell>
  )
}
