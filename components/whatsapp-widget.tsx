"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { usePathname } from "next/navigation"

const WHATSAPP_NUMBER = "254115900005"
const DEFAULT_MESSAGE = "Hi, I need support with LindaBiz POS."

export function WhatsAppWidget() {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
  const [showPrompt, setShowPrompt] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem("lindabiz_user")
    setIsAuthenticated(Boolean(user))
  }, [])

  const protectedArea = ["/dashboard", "/products", "/sales", "/settings", "/profile", "/admin"].some((route) =>
    pathname.startsWith(route),
  )
  if (isAuthenticated || protectedArea) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {showPrompt && (
        <div className="w-[252px] rounded-2xl border border-emerald-300/80 bg-white/95 p-3 shadow-2xl shadow-emerald-300/30 ring-1 ring-emerald-200/70 backdrop-blur-md">
          <p className="text-sm font-semibold text-slate-900">Talk to LindaBiz support?</p>
          <p className="mt-1 text-xs text-slate-700">Click to start chat.</p>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => {
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
                setShowPrompt(false)
              }}
            >
              Start chat
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500"
        aria-label="Chat on WhatsApp"
        onClick={() => setShowPrompt((prev) => !prev)}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp Support
      </button>
    </div>
  )
}
