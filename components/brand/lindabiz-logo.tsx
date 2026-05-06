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
  const logoSrc = "https://res.cloudinary.com/dhxtzhs6h/image/upload/v1778096626/LindaBiz_Logo_rndqs5.png"

  const content = (
    <div className={cn("group flex items-center", className)}>
      {compact ? (
        <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-emerald-200/90 bg-[#02141a] shadow-md shadow-emerald-300/20 ring-1 ring-emerald-100/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-emerald-300/35">
          <Image
            src={logoSrc}
            alt="LindaBiz logo"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        </div>
      ) : (
        <div className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-emerald-200 bg-white/95 px-2 py-1.5 shadow-sm shadow-emerald-100/70 ring-1 ring-white/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-emerald-200/60">
          <div className="relative h-9 w-9 overflow-hidden rounded-md border border-emerald-200/70 bg-[#03181f]">
            <Image src={logoSrc} alt="LindaBiz logo" fill className="object-cover object-center" priority unoptimized />
          </div>
          <div className="rounded-md border border-emerald-200/80 bg-emerald-50/60 px-2 py-0.5">
            <p className="text-base font-semibold italic leading-none tracking-tight text-emerald-800 sm:text-lg">LindaBiz</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Link href={href} className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl">
      {content}
    </Link>
  )
}
