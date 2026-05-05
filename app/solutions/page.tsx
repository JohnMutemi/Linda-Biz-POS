import Link from "next/link"
import { Building2, Store, Zap } from "lucide-react"
import { MarketingShell } from "@/components/marketing/marketing-shell"

export default function SolutionsPage() {
  return (
    <MarketingShell
      title="Fits different shop workflows"
      subtitle="Whether you sell mixed products or fast-moving items, LindaBiz keeps your sales and inventory organized."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Store className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">General Retail</h2>
          <p className="mt-2 text-sm text-slate-600">Track mixed inventory, process sales quickly, and monitor stock.</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Fast Moving Stock</h2>
          <p className="mt-2 text-sm text-slate-600">Ideal for high-traffic counters with quick checkout needs.</p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
          <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Single or Multiple Staff</h2>
          <p className="mt-2 text-sm text-slate-600">A clean dashboard that keeps daily operations easy to follow.</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
        <h3 className="text-xl font-bold text-slate-900">Not sure what fits your shop?</h3>
        <p className="mt-2 text-slate-600">Tell us what you sell and we&apos;ll recommend the best setup.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Talk to support
          </Link>
          <Link
            href="/login?tab=signup"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Create account
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}
