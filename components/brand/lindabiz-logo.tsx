"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LindaBizLogoProps {
  compact?: boolean
  className?: string
  href?: string
}

export function LindaBizLogo({ compact = false, className, href = "/" }: LindaBizLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
        <Image src="/lindabiz-logo.svg" alt="LindaBiz logo" fill className="object-contain p-1.5" priority />
      </div>
      {!compact && (
        <div>
          <p className="text-lg font-bold text-slate-900 leading-tight">LindaBiz</p>
          <p className="-mt-0.5 text-xs text-slate-500">Point of Sale System</p>
        </div>
      )}
    </div>
  )

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  )
}
