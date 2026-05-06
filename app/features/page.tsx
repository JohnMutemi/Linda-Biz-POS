import { CheckCircle2, Gauge, Package, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { MarketingShell } from "@/components/marketing/marketing-shell"

export default function FeaturesPage() {
  return (
    <MarketingShell
      title="Everything you need to run sales daily"
      subtitle="Fast checkout, inventory control, and clear reporting — designed for mobile-first retail workflows."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <Gauge className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Fast Checkout</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Sell in seconds with a clean cart flow built for busy counters.</p>
        </div>
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <Package className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Inventory Tracking</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Add products, update stock, and spot low inventory quickly.</p>
        </div>
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md">
          <div className="inline-flex rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Reliable & Secure</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Your records stay consistent across sessions and devices.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md md:p-8">
          <h3 className="text-xl font-semibold text-slate-900">Built for small businesses</h3>
          <p className="mt-2 leading-relaxed text-slate-700">
            Simple setup, minimal training, and an interface optimized for daily use on mobile and desktop.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            {[
              "Clean dashboard with key numbers",
              "Accurate stock deductions after sales",
              "Transaction history with sold item details",
              "Quick product search on sales screen",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md md:p-8">
          <div className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Tip
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Start with your best sellers</h3>
          <p className="mt-2 leading-relaxed text-slate-700">
            Add the products you sell most often first. You&apos;ll get faster checkouts and cleaner tracking from day one.
          </p>
          <Link
            href="/login?tab=signup"
            className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Create an account
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}
