"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  DASHBOARD_THEMES,
  DASHBOARD_THEME_STORAGE_KEY,
  type DashboardThemeId,
  type DashboardThemeClasses,
  isDashboardThemeId,
} from "@/lib/dashboard-theme"

interface DashboardThemeContextValue {
  themeId: DashboardThemeId
  setThemeId: (id: DashboardThemeId) => void
  t: DashboardThemeClasses
}

const DashboardThemeContext = createContext<DashboardThemeContextValue | undefined>(undefined)

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<DashboardThemeId>("emerald")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DASHBOARD_THEME_STORAGE_KEY)
      if (raw && isDashboardThemeId(raw)) {
        setThemeIdState(raw)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setThemeId = useCallback((id: DashboardThemeId) => {
    setThemeIdState(id)
    try {
      localStorage.setItem(DASHBOARD_THEME_STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      t: DASHBOARD_THEMES[themeId],
    }),
    [themeId, setThemeId],
  )

  return <DashboardThemeContext.Provider value={value}>{children}</DashboardThemeContext.Provider>
}

export function useDashboardTheme() {
  const ctx = useContext(DashboardThemeContext)
  if (!ctx) {
    throw new Error("useDashboardTheme must be used within DashboardThemeProvider")
  }
  return ctx
}
