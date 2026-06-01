"use client"

import { ChevronUp, LogOut, User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { businessAdminTheme as ba } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? "OA").toUpperCase()
}

type OwnerAdminProfileMenuProps = {
  /** Icon-only trigger for the narrow mobile rail */
  compact?: boolean
  className?: string
}

export function OwnerAdminProfileMenu({ compact = false, className }: OwnerAdminProfileMenuProps) {
  const { user, confirmLogout } = useDashboard()

  if (!user) return null

  const initials = getInitials(user.name)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
            compact ? ba.profileTriggerCompact : ba.profileTriggerFull,
            className,
          )}
          aria-label="Open account menu"
        >
          {compact ? (
            <span className={ba.profileAvatar}>{initials}</span>
          ) : (
            <>
              <span className={cn(ba.profileAvatar, "h-9 w-9 text-xs")}>{initials}</span>
              <span className="min-w-0 flex-1 text-left">
                <span className={cn("block truncate text-sm font-semibold", ba.textPrimary)}>{user.name}</span>
                <span className={cn("block truncate text-xs", ba.textSecondary)}>{user.email}</span>
              </span>
              <ChevronUp className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={compact ? "center" : "start"}
        sideOffset={8}
        className={ba.profileMenu}
      >
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <div className="flex items-center gap-2.5">
            <span className={cn(ba.profileAvatar, "h-9 w-9 text-xs")}>{initials}</span>
            <div className="min-w-0">
              <p className={cn("truncate text-sm font-semibold", ba.textPrimary)}>{user.name}</p>
              <p className={cn("truncate text-xs", ba.textSecondary)}>{user.email}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-sky-700">
                <User className="h-3 w-3" />
                Owner admin
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-sky-100" />
        <DropdownMenuItem
          className={ba.profileMenuLogout}
          onSelect={(e) => {
            e.preventDefault()
            confirmLogout()
          }}
        >
          <LogOut className="h-4 w-4" />
          End session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
