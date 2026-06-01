"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { businessAdminTheme as ba } from "@/lib/business-admin-theme"
import { cn } from "@/lib/utils"

type TabItem = { value: string; label: string; shortLabel?: string }

type OwnerAdminTabStripProps = {
  tabs: TabItem[]
  listClassName?: string
  triggerClassName?: string
  /** Sub-tabs sit flush left under main tabs */
  variant?: "main" | "sub"
}

export function OwnerAdminTabStrip({
  tabs,
  listClassName,
  triggerClassName,
  variant = "main",
}: OwnerAdminTabStripProps) {
  return (
    <TabsList
      className={cn(
        variant === "main" ? ba.pillTabsList : cn(ba.pillTabsList, "lg:max-w-3xl lg:mx-0 lg:justify-start"),
        listClassName,
      )}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(ba.pillTabsTrigger, triggerClassName)}
        >
          {tab.shortLabel ? (
            <>
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </>
          ) : (
            tab.label
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}

export function OwnerAdminTabIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between",
        ba.sectionDivider,
      )}
    >
      <div className="space-y-1">
        <p className={ba.sectionEyebrow}>{eyebrow}</p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <p className={cn("max-w-2xl sm:text-base", ba.sectionDesc)}>{description}</p>
      </div>
      {children}
    </div>
  )
}
