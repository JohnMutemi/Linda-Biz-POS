"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export type UserType = "general" | "wines-spirits"

export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  approvalStatus?: "pending" | "approved" | "rejected"
  isAdmin?: boolean
  businessName: string
  phone?: string
  location?: string
  isNewUser?: boolean
  registrationDate?: string
}

interface DashboardContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  confirmLogout: () => void
  refreshData: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAdminLoginRoute = pathname === "/admin/login"
        // Only check for user authentication on protected routes.
        // Keep /admin/login public so admins can sign in.
        const protectedRoutes = ["/dashboard", "/products", "/sales", "/settings", "/profile", "/admin"]
        const isProtectedRoute = !isAdminLoginRoute && protectedRoutes.some((route) => pathname.startsWith(route))

        if (!isProtectedRoute) {
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/session", { method: "GET" })
        if (!response.ok) {
          if (isProtectedRoute) {
            router.push("/")
          }
          setLoading(false)
          return
        }

        const currentUser = await response.json()
        setUser(currentUser)
        localStorage.setItem("lindabiz_user", JSON.stringify(currentUser))
      } catch (error) {
        console.error("Error loading user data:", error)
        const isAdminLoginRoute = pathname === "/admin/login"
        const protectedRoutes = ["/dashboard", "/products", "/sales", "/settings", "/profile", "/admin"]
        const isProtectedRoute = !isAdminLoginRoute && protectedRoutes.some((route) => pathname.startsWith(route))
        if (isProtectedRoute) {
          router.push("/")
        }
      } finally {
        setLoading(false)
      }
    }

    void loadUser()
  }, [router, pathname])

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("lindabiz_user")
      setUser(null)
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/")
    }
  }

  const confirmLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?\n\nYou will need to log in again to access your dashboard.",
    )
    if (confirmed) {
      void logout()
    }
  }

  const refreshData = () => {
    // Trigger a re-render by updating a timestamp or similar
    window.dispatchEvent(new Event("dashboard-refresh"))
  }

  return (
    <DashboardContext.Provider value={{ user, loading, logout, confirmLogout, refreshData }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
