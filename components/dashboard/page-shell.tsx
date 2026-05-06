"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export function DashboardPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("dashboard-content-shell relative z-10", className)}>{children}</div>
}
