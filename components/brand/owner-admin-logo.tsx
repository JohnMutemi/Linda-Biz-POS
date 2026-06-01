"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const LOGO_SRC =
  "https://res.cloudinary.com/dhxtzhs6h/image/upload/v1778096626/LindaBiz_Logo_rndqs5.png"

type OwnerAdminLogoProps = {
  compact?: boolean
  className?: string
  href?: string
}

/** Ocean blue frame — no emerald; for business owner admin only. */
export function OwnerAdminLogo({ compact = true, className, href = "/business-admin" }: OwnerAdminLogoProps) {
  const inner = compact ? (
    <div
      className={cn(
        "owner-admin-logo relative h-11 w-11 overflow-hidden rounded-xl",
        "border border-sky-200/90 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
        "shadow-md shadow-blue-900/20 ring-1 ring-sky-100/60",
      )}
    >
      <Image src={LOGO_SRC} alt="LindaBiz" fill className="object-cover object-center" priority unoptimized />
    </div>
  ) : (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-sky-200/90 bg-white px-2 py-1.5",
        "shadow-sm shadow-sky-100/50 ring-1 ring-sky-50",
      )}
    >
      <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-sky-200/80 bg-gradient-to-br from-slate-900 to-blue-900">
        <Image src={LOGO_SRC} alt="LindaBiz" fill className="object-cover" priority unoptimized />
      </div>
      <p className="text-base font-semibold tracking-tight text-slate-900">LindaBiz</p>
    </div>
  )

  return (
    <Link
      href={href}
      className={cn("inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-xl", className)}
    >
      {inner}
    </Link>
  )
}
