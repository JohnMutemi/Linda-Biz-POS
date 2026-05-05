import Link from "next/link"
import { MarketingShell } from "@/components/marketing/marketing-shell"

const WHATSAPP_NUMBER_DISPLAY = "0115900005"
const WHATSAPP_NUMBER_INTL = "254115900005"
const SUPPORT_MESSAGE = "Hi, I need support with LindaBiz POS."

export default function SupportPage() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`

  return (
    <MarketingShell
      title="Support that responds fast"
      subtitle="Get help with setup, login, sales flow, inventory, and reports. Tap WhatsApp to start a chat with LindaBiz support."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Support</h2>
          <p className="mt-2 text-slate-600">
            Tell us what you need help with and we&apos;ll guide you step-by-step.
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-700">WhatsApp: {WHATSAPP_NUMBER_DISPLAY}</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/30 hover:bg-emerald-500"
          >
            Start WhatsApp Chat
          </a>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-xl shadow-emerald-200/30 backdrop-blur-sm md:p-8">
          <h2 className="text-xl font-bold text-slate-900">What we can help with</h2>
          <ul className="mt-4 grid gap-3 text-slate-700 sm:grid-cols-2">
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">Account & login</li>
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">Add products & stock</li>
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">Sales checkout issues</li>
            <li className="rounded-2xl border border-emerald-100 bg-white/70 p-4">Reports & exports</li>
          </ul>

          <Link href="/pricing" className="mt-6 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-600">
            View pricing
          </Link>
        </div>
      </div>
    </MarketingShell>
  )
}
