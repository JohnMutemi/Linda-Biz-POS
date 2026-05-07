"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function BackToDashboardButton({
  label = "Back to Dashboard",
  className = "",
}: {
  label?: string
  className?: string
}) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => router.push("/dashboard")}
      className={cn(
        "min-h-11 touch-manipulation border-emerald-200 hover:bg-emerald-50 px-4 max-sm:text-sm",
        className,
      )}
    >
      <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Button>
  )
}

