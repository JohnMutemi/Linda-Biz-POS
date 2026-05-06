"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

const WHATSAPP_NUMBER = "254115900005"
const DEFAULT_MESSAGE = "Hi, I need support with LindaBiz POS."

export function WhatsAppWidget() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
  const [showPrompt, setShowPrompt] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const dismissed = localStorage.getItem("lindabiz_whatsapp_prompt_dismissed")
    if (dismissed === "1") setShowPrompt(false)
    const user = localStorage.getItem("lindabiz_user")
    setIsAuthenticated(Boolean(user))
  }, [])

  const protectedArea = ["/dashboard", "/products", "/sales", "/settings", "/profile"].some((route) =>
    pathname.startsWith(route),
  )
  if (isAuthenticated || protectedArea) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {showPrompt && (
        <div className="w-[240px] rounded-2xl border border-emerald-100 bg-white/90 p-3 shadow-xl shadow-emerald-200/40 backdrop-blur-sm">
          <p className="text-sm font-semibold text-slate-900">Talk to LindaBiz support?</p>
          <p className="mt-1 text-xs text-slate-600">Click to start chat.</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => {
                localStorage.setItem("lindabiz_whatsapp_prompt_dismissed", "1")
                setShowPrompt(false)
              }}
            >
              Not now
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                localStorage.setItem("lindabiz_whatsapp_prompt_dismissed", "1")
                setShowPrompt(false)
              }}
            >
              Start chat
            </a>
          </div>
        </div>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp Support
      </a>
    </div>
  )
}
