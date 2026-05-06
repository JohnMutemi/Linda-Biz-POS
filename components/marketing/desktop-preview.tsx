"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export function DesktopPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full rounded-3xl border border-emerald-100 bg-white/80 p-3 shadow-2xl shadow-emerald-200/40 backdrop-blur-sm",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-emerald-50">
        <Image
          src="/lindabiz-desktop-preview.svg"
          alt="Desktop appearance"
          fill
          className="object-contain object-center"
          unoptimized
        />
      </div>
    </div>
  )
}
