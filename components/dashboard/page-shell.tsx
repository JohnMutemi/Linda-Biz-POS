"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export function DashboardPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-7xl safe-pad-x pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 sm:pb-10 sm:pt-6",
        className,
      )}
    >
      <div className="rounded-2xl border border-white/40 bg-white/55 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.45)] ring-1 ring-emerald-100/60 backdrop-blur-xl sm:rounded-3xl">
        <div className="p-3 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
