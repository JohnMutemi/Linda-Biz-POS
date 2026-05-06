"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export function DashboardPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "dashboard-content-shell relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="rounded-3xl border border-white/40 bg-white/55 shadow-[0_10px_35px_-20px_rgba(16,185,129,0.45)] ring-1 ring-emerald-100/60 backdrop-blur-xl">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
