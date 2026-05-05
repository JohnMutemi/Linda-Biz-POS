"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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
      className={`border-emerald-200 hover:bg-emerald-50 ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

