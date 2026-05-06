import type React from "react"

import { MarketingHeader } from "@/components/marketing/marketing-header"

export function MarketingShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <main className="relative min-h-screen bg-emerald-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-[-120px] h-[340px] w-[340px] rounded-full bg-emerald-300/40 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-80px] h-[280px] w-[280px] rounded-full bg-emerald-300/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 pb-14 pt-6 md:px-8">
        <MarketingHeader />

        {(title || subtitle) && (
          <section className="mt-9">
            <div className="rounded-3xl border border-emerald-200/80 bg-[#fffaf0]/95 p-6 shadow-md shadow-emerald-300/20 backdrop-blur-md md:p-8">
              {title && <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">{title}</h1>}
              {subtitle && <p className="mt-3 max-w-3xl text-slate-700 md:text-lg">{subtitle}</p>}
            </div>
          </section>
        )}

        <section className="mt-8">{children}</section>

        <footer className="mt-14 border-t border-emerald-100/90 pt-8 text-sm text-slate-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-slate-700">LindaBiz POS</p>
            <p className="text-slate-500">Support: WhatsApp 0115900005</p>
          </div>
        </footer>
      </div>
    </main>
  )
}

