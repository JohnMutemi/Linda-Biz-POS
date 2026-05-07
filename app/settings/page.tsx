"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SettingsIcon, Bell, Shield, Palette } from "lucide-react"
import { useDashboard } from "@/components/dashboard/dashboard-provider"
import { BackToDashboardButton } from "@/components/dashboard/back-to-dashboard-button"
import { DashboardPageShell } from "@/components/dashboard/page-shell"

export default function SettingsPage() {
  const { user } = useDashboard()

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 -z-10"></div>

      <DashboardPageShell>
        <div className="dashboard-sticky-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-emerald-700 sm:text-base">Manage your application preferences</p>
          </div>
          <BackToDashboardButton className="w-full shrink-0 sm:w-auto" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <Bell className="mr-2 h-5 w-5 text-emerald-600" />
                Notifications
              </CardTitle>
              <CardDescription className="text-emerald-700">Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm sm:text-base">Low stock alerts</span>
                  <Button variant="outline" size="sm" className="min-h-10 touch-manipulation border-emerald-200 hover:bg-emerald-50">
                    Enabled
                  </Button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm sm:text-base">Sales notifications</span>
                  <Button variant="outline" size="sm" className="min-h-10 touch-manipulation border-emerald-200 hover:bg-emerald-50">
                    Enabled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                Security
              </CardTitle>
              <CardDescription className="text-emerald-700">Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50">
                  Two-Factor Authentication
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <Palette className="mr-2 h-5 w-5 text-emerald-600" />
                Appearance
              </CardTitle>
              <CardDescription className="text-emerald-700">Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Dark mode</span>
                  <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                    Light
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Language</span>
                  <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                    English
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <SettingsIcon className="mr-2 h-5 w-5 text-emerald-600" />
                General
              </CardTitle>
              <CardDescription className="text-emerald-700">General application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start border-emerald-200 hover:bg-emerald-50">
                  Import Data
                </Button>
                <Button variant="destructive" className="w-full justify-start border-emerald-200 hover:bg-emerald-50">
                  Reset Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPageShell>
    </div>
  )
}
