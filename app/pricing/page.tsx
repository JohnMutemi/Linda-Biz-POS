import Link from "next/link"
import { BadgeCheck, MessageCircle } from "lucide-react"
import { MarketingShell } from "@/components/marketing/marketing-shell"

const WHATSAPP_NUMBER = "254115900005"
const PAYMENT_MESSAGE = "Hi, I want to pay for LindaBiz POS. Please share payment details."

export default function PricingPage() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PAYMENT_MESSAGE)}`

  return (
    <MarketingShell
      title="Simple pricing. Clear value."
      subtitle="One plan that covers inventory, sales, and reporting — built for day-to-day retail."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md lg:col-span-2 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">LindaBiz Plan</p>
          <p className="mt-3 text-5xl font-semibold tracking-tight text-slate-900">KSh 15,000</p>
          <p className="mt-2 leading-relaxed text-slate-700">One transparent package for your POS operations.</p>

          <ul className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {[
              "Products & inventory management",
              "Sales checkout + stock deductions",
              "Transaction history & reports",
              "Mobile-first dashboard experience",
              "Support via WhatsApp",
              "Ongoing improvements",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Pay / Ask for payment details
            </a>
            <Link
              href="/login?tab=signup"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md md:p-8">
          <h3 className="text-lg font-semibold text-slate-900">Need help choosing?</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">Tell us your shop type and we&apos;ll guide you on setup.</p>
          <Link href="/support" className="mt-5 inline-block text-sm font-semibold text-emerald-700 transition hover:text-emerald-600">
            Talk to support
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}
